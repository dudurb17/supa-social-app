import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  createComment,
  fetchPostDetails,
  removeComment,
  removePost,
} from "../../services/postService";
import { theme } from "../../constants/theme";
import { wp, hp } from "../../helpers/common";
import PostCard from "../../components/PostCard";
import { useAuth } from "../../contexts/AuthContext";
import Loading from "../../components/Loading";
import Input from "../../components/Input";
import Icon from "../../assets/icons";
import CommentItem from "../../components/CommentItem";
import { supabase } from "../../lib/supabase";
import { getUserData } from "../../services/userService";

export default function PostDetails() {
  const { postId } = useLocalSearchParams();
  const { user } = useAuth();
  const router = useRouter();
  const [startLoading, setStartLoading] = useState(true);
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(false);

  const inputRef = useRef(null);
  const commentRef = useRef("");

  const getPostDetails = async () => {
    try {
      const res = await fetchPostDetails(postId);
      // console.log("Post Details Response:", res);
      if (res.success) {
        setPost(res.data);
      } else {
        console.error("Erro na resposta:", res.message);
      }
    } catch (error) {
      console.error("Erro ao buscar detalhes do post:", error);
    } finally {
      setStartLoading(false);
    }
  };

  const onNewComment = async () => {
    if (!commentRef.current) {
      console.log("comment null");
      return null;
    }
    let data = {
      userId: user.id,
      postId: post.id,
      text: commentRef.current,
    };

    setLoading(true);
    const res = await createComment(data);
    console.log("teste");
    setLoading(false);
    if (res.success) {
      inputRef.current.clear();
      commentRef.current = "";
    } else {
      Alert.alert("Comment", res.msg);
    }
  };
  const handleNewComment = async (payload) => {
    console.log("Got new comment", payload.new);
    if (payload.new) {
      let newComment = { ...payload.new };
      let res = await getUserData(newComment.userId);
      newComment.user = res.success ? res.data : {};
      setPost((prev) => {
        return { ...prev, comments: [newComment, ...prev.comments] };
      });
    }
  };

  useEffect(() => {
    let commentChannel = supabase
      .channel("comments")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "comments",
          filter: `postId=eq.${postId}`,
        },
        handleNewComment
      )
      .subscribe();

    getPostDetails();

    return () => {
      supabase.removeChannel(commentChannel);
    };
  }, [postId]);

  const onDeletePost = async (item) => {
    let res = await removePost(item.id);
    if (res.success) {
      router.back();
    } else {
      Alert.alert("Post", res.msg);
    }
  };
  const onEditPost = async (item) => {
    console.log("Edit post: ", item);
  };
  const onDeleteComment = async (comment) => {
    console.log("Deleting comment: ", comment);
    let res = await removeComment(comment.id);
    console.log(res);
    if (res.success) {
      setPost((prevPost) => {
        let updatedPost = { ...prevPost };
        updatedPost.comments = updatedPost.comments.filter(
          (c) => c.id != comment.id
        );
        return updatedPost;
      });
    } else {
      Alert.alert("Comment", res.msg);
    }
  };

  if (startLoading) {
    return (
      <View style={styles.center}>
        <Loading />
      </View>
    );
  }

  if (!post) {
    return (
      <View
        style={[
          styles.center,
          { justifyContent: "flex-start", marginTop: 100 },
        ]}
      >
        <Text style={styles.notFound}>Post not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
      >
        <PostCard
          item={{ ...post, comments: [{ count: post.comments.length }] }}
          currentUser={user}
          router={router}
          hasShadow={false}
          showMoreIcon={false}
          showDelete={true}
          onDelete={onDeletePost}
          onEdit={onEditPost}
        />

        <View style={[styles.inputContainer]}>
          <Input
            inputRef={inputRef}
            placeholder="Type comment..."
            onChangeText={(value) => (commentRef.current = value)}
            placeholderTextColor={theme.colors.textLight}
            containerStyles={{
              flex: 1,
              height: hp(6.2),
              borderRadius: theme.radius.xl,
            }}
          />
          {loading ? (
            <View style={styles.loading}>
              <Loading size="small" />
            </View>
          ) : (
            <TouchableOpacity
              style={styles.sendIcon}
              onPress={() => onNewComment()}
            >
              <Icon name="send" color={theme.colors.primaryDark} />
            </TouchableOpacity>
          )}
        </View>

        {/* comment list */}
        <View style={{ marginVertical: 15, gap: 17 }}>
          {post.comments.map((comment) => (
            <CommentItem
              item={comment}
              key={comment.id.toString()}
              onDelete={onDeleteComment}
              canDelete={user.id == comment.userId || user.id == post.userId}
            />
          ))}
          {post.comments.length == 0 && (
            <Text style={{ color: theme.colors.text, marginLeft: 5 }}>
              Be first to comment
            </Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    paddingVertical: wp(7),
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  list: {
    paddingHorizontal: wp(4),
  },
  sendIcon: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0.8,
    borderColor: theme.colors.primary,
    borderRadius: theme.radius.lg,
    borderCurve: "continuous",
    height: hp(5.8),
    width: hp(5.8),
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  notFound: {
    fontSize: hp(2.5),
    color: theme.colors.text,
    fontWeight: theme.fonts.medium,
  },
  loading: {
    height: hp(5.8),
    width: hp(5.8),
    justifyContent: "center",
    alignItems: "center",
    transform: [{ scale: 1.3 }],
  },
});
