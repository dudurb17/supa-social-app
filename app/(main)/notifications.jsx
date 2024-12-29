import { FlatList, ScrollView, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import { fetchNotifications } from "../../services/notificationService";
import { useAuth } from "../../contexts/AuthContext";
import ScreenWrapper from "../../components/ScreenWrapper";
import NotificationItem from "../../components/NotificationItem";
import { useRouter } from "expo-router";
import { wp, hp } from "../../helpers/common";
import { theme } from "../../constants/theme";
import Header from "../../components/Header";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [forceRender, setForceRender] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  const getNotifications = async () => {
    try {
      const res = await fetchNotifications(user.id);
      if (res?.success) {
        console.log(res);
        setNotifications(res.data);
      } else {
        setNotifications([]);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    getNotifications();
  }, []);

  return (
    <ScreenWrapper bg="white">
      <View>
        <Header title="Notifications" router={router} />
        <ScrollView contentContainerStyle={styles.listStyle}>
          {notifications?.map((item) => {
            return (
              <NotificationItem item={item} key={item.id} router={router} />
            );
          })}
          {notifications.length == 0 && (
            <Text style={styles.noData}>No notifications yet</Text>
          )}
        </ScrollView>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: wp(4),
  },
  listStyle: {
    paddingVertical: 20,
    gap: 10,
  },
  noDataContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noData: {
    textAlign: "center",
    fontSize: hp(1.8),
    color: theme.colors.text,
    fontWeight: theme.fonts.medium,
  },
});
