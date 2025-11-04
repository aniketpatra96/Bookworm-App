import { View, Text, ActivityIndicator } from "react-native";
import React, { FC } from "react";
import COLORS from "@/constants/colors";

type Size = number | "large" | "small" | undefined;

const Loader: FC<{ size: Size }> = ({ size = "large" }) => {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: COLORS.background,
      }}
    >
      <ActivityIndicator size={size} color={COLORS.primary} />
    </View>
  );
};

export default Loader;
