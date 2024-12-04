import { StyleSheet, Text, View } from "react-native";
import React from "react";
import ScreenWrapper from "../components/ScreenWrapper";
import { theme } from "../constants/theme";
import Icon from "../assets/icons";

export default function Login() {
  return (
    <ScreenWrapper>
      <Text>login</Text>
      <Icon name="home" color="red" />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({});
