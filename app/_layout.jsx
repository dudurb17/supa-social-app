import React, { useEffect } from "react";
import { router, Stack } from "expo-router";
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import { getUserData } from "../services/userService";

export default function _layout() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}

function MainLayout() {
  const { setAuth, setUserData } = useAuth();
  useEffect(() => {
    supabase.auth.onAuthStateChange((_event, session) => {
      console.log("Session user: ", session?.user.id);

      if (session) {
        setAuth(session?.user);
        updateUserData(session.user, session.user.email);
        router.replace("/home");
      } else {
        setAuth(null);
        router.replace("/welcome");
      }
    });
  }, []);

  const updateUserData = async (user, email) => {
    let res = await getUserData(user.id);
    if (res.success) {
      setUserData({ ...res.data, email });
    }
  };
  return <Stack screenOptions={{ headerShown: false }} />;
}
