import SafeScreen from "@/components/SafeScreen";
import {
  Stack,
  useSegments,
  useRouter,
  SplashScreen,
  Router,
} from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import { ActivityIndicator, View } from "react-native";
import COLORS from "@/constants/colors";
import useAuthStore, { LoggedInUser } from "@/store/authStore";
import { useEffect, useState } from "react";

type SegmentsType =
  | ["_sitemap"]
  | ["(auth)"]
  | ["signup"]
  | ["(auth)", "signup"]
  | ["(tabs)"]
  | ["create"]
  | ["(tabs)", "create"]
  | ["profile"]
  | ["(tabs)", "profile"];

SplashScreen.preventAutoHideAsync();
export default function RootLayout() {
  const [fontsLoaded]: [boolean, any] = useFonts({
    JetBrainsMonoMedium: require("@/assets/fonts/JetBrainsMono-Medium.ttf"),
    SpaceMonoRegular: require("@/assets/fonts/SpaceMono-Regular.ttf"),
  });

  const router: Router = useRouter();
  const segments: SegmentsType = useSegments();
  const {
    checkAuth,
    user,
    token,
  }: {
    checkAuth: () => Promise<void>;
    user: LoggedInUser;
    token: string | null;
  } = useAuthStore();

  const [isReady, setIsReady] = useState<boolean>(false);

  // Wait for auth check before navigating
  useEffect(() => {
    const init: () => Promise<void> = async () => {
      await checkAuth();
      setIsReady(true);
    };
    init();
  }, []);

  // Navigate only after everything is ready
  useEffect(() => {
    if (!isReady || !fontsLoaded) return; // ✅ wait until ready
    const inAuthScreen: boolean = segments[0] === "(auth)";
    const isSignedIn: boolean = !!(user && token);

    if (!isSignedIn && !inAuthScreen) {
      router.replace("/(auth)");
    } else if (isSignedIn && inAuthScreen) {
      router.replace("/(tabs)");
    }
  }, [isReady, fontsLoaded, user, token, segments]);

  useEffect(() => {
    if (isReady && fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [isReady, fontsLoaded]);

  if (!fontsLoaded || !isReady) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: COLORS.background,
        }}
      >
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeScreen>
        {/* 👇 Root navigator must mount immediately */}
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </SafeScreen>
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}
