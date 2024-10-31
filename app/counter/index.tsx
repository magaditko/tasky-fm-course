import { Text, View, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { theme } from "../../theme";
import { registerForPushNotificationsAsync } from "../../utils/registerForPushNotificationsAsync";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";

export default function CounterScreen() {
  const scheduleNotification = async () => {
    const result = await registerForPushNotificationsAsync();
    if (result === "granted") {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "I'm a notification from your app",
        },
        trigger: {
          seconds: 5,
        },
      });
    } else {
      if (Device.isDevice) {
        Alert.alert(
          "Unable to schedule notification",
          "Enable the notification permission for Expo Go in settings",
        );
      }
    }
    console.log(result);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} activeOpacity={0.8} onPress={scheduleNotification}>
        <Text style={styles.buttonText}>Schedule notification</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  buttonText: {
    fontSize: 24,
    color: theme.colorWhite,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  button: {
    backgroundColor: theme.colorBlack,
    padding: 12,
    borderRadius: 6,
  },
});
