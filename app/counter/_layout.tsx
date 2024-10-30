import { Link, Stack } from "expo-router";
import { Pressable, Text } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { theme } from "../../theme";

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Counter",
          headerRight: () => (
            <Link href="/counter/history" asChild>
              {/* wrap it in pressable to increase the hit area and for the link to work you have to mark it asChild */}
              <Pressable hitSlop={20}>
                <MaterialIcons name="history" size={32} color={theme.colorGrey} />
              </Pressable>
            </Link>
          ),
        }}
      />
    </Stack>
  );
}
