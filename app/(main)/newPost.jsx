import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  Touchable,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import ScreenWrapper from "../../components/ScreenWrapper";
import Header from "../../components/Header";
import { hp, wp } from "../../helpers/common";
import { theme } from "../../constants/theme";
import Avatar from "../../components/Avatar";
import { useAuth } from "../../contexts/AuthContext";
import { useLocalSearchParams, useRouter } from "expo-router";
import Input from "../../components/Input";
import Button from "../../components/Button";
import * as ImagePicker from "expo-image-picker";
import Icon from "../../assets/icons";
import { getSupabaseFileUrl } from "../../services/imageService";
import { Video } from "expo-av";
import { createOrUpdatePost } from "../../services/postService";

export default function NewPost() {
  const post = useLocalSearchParams();
  const { user } = useAuth();

  const [body, setBody] = useState("");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(file);

  useEffect(() => {
    if (post && post.id) {
      setBody(post.body || "");
      setFile(post.file ? { uri: getSupabaseFileUrl(post.file).uri } : null);
    }
  }, []);
  const onPick = async (isImage) => {
    let mediaConfig = {
      mediaTypes: [isImage ? "images" : "videos"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    };

    let result = await ImagePicker.launchImageLibraryAsync(mediaConfig);

    if (!result.canceled) {
      setFile(result.assets[0]);
    }
  };
  const isLocalFile = (file) => {
    if (!file) return null;
    if (typeof file == "object") return true;
  };
  const getFileType = (file) => {
    if (!file) return null;
    if (isLocalFile) {
      return file.type;
    }

    //chek image or video for remote file

    if (file.includes("postImages")) {
      return "image";
    }
    return "video";
  };

  const getFileUri = (file) => {
    if (!file) return null;
    if (isLocalFile(file)) {
      return { uri: file.uri };
    }
    return getSupabaseFileUrl(file?.uri);
  };

  const onSubmit = async () => {
    if (!body && !file) {
      Alert.alert("Post", "Please chose an image or add post bod");
    }

    let data = {
      file,
      body: body,
      userId: user.id,
    };

    if (post && post.id) {
      data.id = post.id;
    }
    // create post
    setLoading(true);

    let response = await createOrUpdatePost(data);
    setLoading(false);

    if (response.success) {
      setFile(null);
      setBody("");
      router.back();
    } else {
      Alert.alert("Post", response.msg);
    }
  };

  return (
    <ScreenWrapper bg="white">
      <View style={styles.container}>
        <Header title="Create Post" />
        <ScrollView contentContainerStyle={{ gap: 20 }}>
          <View style={styles.header}>
            <Avatar uri={user.image} size={hp(6.5)} rounded={theme.radius.xl} />
            <View style={{ gap: 2 }}>
              <Text style={styles.userName}>{user && user.name}</Text>
              <Text style={styles.publicText}>Public</Text>
            </View>
          </View>

          <View style={styles.textEditor}>
            <Input
              placeholder="What's on your mind?"
              multilineStyle={{ height: hp(20), alignItems: "flex-start" }}
              value={body}
              multiline={true}
              contianerStyles={styles.bio}
              onChangeText={(value) => setBody(value)}
            />
          </View>

          {file && (
            <View style={styles.file}>
              {getFileType(file) == "video" ? (
                <Video
                  style={{ flex: 1 }}
                  source={getFileUri(file)}
                  useNativeControls
                  resizeMode="cover"
                  isLooping
                />
              ) : (
                <Image
                  source={getFileUri(file)}
                  resizeMode="cover"
                  style={{ flex: 1 }}
                />
              )}
              <Pressable style={styles.closeIcon} onPress={() => setFile(null)}>
                <Icon name="delete" size={25} color="white" />
              </Pressable>
            </View>
          )}

          <View style={styles.media}>
            <Text>Add to your post</Text>
            <View style={styles.mediaIcons}>
              <TouchableOpacity onPress={() => onPick(true)}>
                <Icon name="image" size={30} color={theme.colors.dark} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => onPick(false)}>
                <Icon name="video" size={33} color={theme.colors.dark} />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
        <Button
          buttonStyle={{ height: hp(6.2) }}
          title={post && post.id ? "Update" : "Post"}
          loading={loading}
          hasShadow={false}
          onPress={onSubmit}
        />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, marginBottom: 30, paddingHorizontal: wp(4), gap: 15 },
  title: {
    fontSize: hp(2.5),
    fontWeight: theme.fonts.semibold,
    color: theme.colors.text,
    textAlign: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  userName: {
    fontSize: hp(2.2),
    fontWeight: theme.fonts.semibold,
    color: theme.colors.text,
  },
  avatar: {
    height: hp(6.5),
    width: hp(6.5),
    borderRadius: theme.radius.xl,
    borderCurve: "continuous",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
  },
  publicText: {
    fontSize: hp(1.7),
    fontWeight: theme.fonts.medium,
    color: theme.colors.textLight,
  },
  textEditor: {},
  media: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1.5,
    padding: 12,
    paddingHorizontal: 18,
    borderRadius: theme.radius.xl,
    borderCurve: "continuous",
    borderColor: theme.colors.gray,
  },
  mediaIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  imageIcon: {
    borderRadius: theme.radius.md,
  },
  file: {
    height: hp(30),
    width: "100%",
    borderRadius: theme.radius.xl,
    overflow: "hidden",
    borderCurve: "continuous",
  },
  video: {},

  closeIcon: {
    position: "absolute",
    top: 10,
    right: 10,
    padding: 7,
    borderRadius: 50,
    backgroundColor: "rgba(255,0,0,0.6)",
  },
});
