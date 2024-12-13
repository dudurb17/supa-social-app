import { Alert, StyleSheet, Text, View } from "react-native";
import React from "react";
import ScreenWrapper from "../../components/ScreenWrapper";
import Button from "../../components/Button";
import { useAuth } from "../../contexts/AuthContext";
import { supabase } from "../../lib/supabase";

export default function Home() {
  const { user } = useAuth();

  console.log("user: ", user);

  const onLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert("Sign out", "Error signing out!");
    }
  };
  return (
    <ScreenWrapper>
      <Text>H</Text>
      <Button title="logout" onPress={onLogout} />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({});
