import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
  useWindowDimensions,
} from "react-native";
import { theme } from "../../theme";
import { registerForPushNotificationsAsync } from "../../utils/registerForPushNotificationsAsync";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { useEffect, useRef, useState } from "react";
import { Duration, intervalToDuration, isBefore } from "date-fns";
import { TimeSegment } from "../../components/TimeSegment";
import { getFromStorage, saveToStorage } from "../../utils/storage";
import * as Haptics from "expo-haptics";
import ConfettiCannon from "react-native-confetti-cannon";

// 10 seconds from now
// how often we need to do something

// const oneDay = 24 * 60 * 60 * 1000;
// const oneHour = 60 * 60 * 1000;
// const oneMinute = 60 * 1000;
// const oneSecond = 1 * 1000;
const frequency = 2 * 24 * 60 * 60 * 1000;
export const countdownStorageKey = "tasky-countdown";

type CountdownStatus = {
  isOverdue: boolean;
  // distance: ReturnType<typeof intervalToDuration>;
  distance: Duration;
};

export type PersistedCountdownState = {
  currentNotificationId: string | undefined;
  completedAtTimestamps: number[];
};

export default function CounterScreen() {
  const confettiRef = useRef<any>();
  const { width } = useWindowDimensions();

  const [status, setStatus] = useState<CountdownStatus>({ isOverdue: false, distance: {} });
  const [countdownState, setCountdownState] = useState<PersistedCountdownState>();
  const [isLoading, setIsLoading] = useState(true);

  const lastCompletedTimestamp = countdownState?.completedAtTimestamps[0];

  useEffect(() => {
    const init = async () => {
      const value = await getFromStorage(countdownStorageKey);
      setCountdownState(value);
    };
    init();
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      const timestamp = lastCompletedTimestamp ? lastCompletedTimestamp + frequency : Date.now();
      if (lastCompletedTimestamp) {
        setIsLoading(false);
      }
      const isOverdue = isBefore(timestamp, Date.now());
      const distance = intervalToDuration(
        isOverdue ? { start: timestamp, end: Date.now() } : { start: Date.now(), end: timestamp },
      );
      setStatus({ isOverdue, distance });
    }, 1000);
    return () => {
      clearInterval(intervalId);
    };
  }, [lastCompletedTimestamp]);

  const scheduleNotification = async () => {
    confettiRef?.current?.start();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    let pushNotificationId;
    const result = await registerForPushNotificationsAsync();
    if (result === "granted") {
      pushNotificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: "Time to water the plants!",
        },
        trigger: {
          seconds: frequency / 1000,
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
    if (countdownState?.currentNotificationId) {
      await Notifications.cancelScheduledNotificationAsync(countdownState.currentNotificationId);
    }
    const newCountdownState: PersistedCountdownState = {
      currentNotificationId: pushNotificationId,
      completedAtTimestamps: countdownState
        ? [Date.now(), ...countdownState.completedAtTimestamps]
        : [Date.now()],
    };
    setCountdownState(newCountdownState);
    await saveToStorage(countdownStorageKey, newCountdownState);
  };

  if (isLoading) {
    return (
      <View style={styles.indicatorContainer}>
        <ActivityIndicator size="large"></ActivityIndicator>
      </View>
    );
  }
  return (
    <View style={[styles.container, status.isOverdue ? styles.containerLate : undefined]}>
      {status.isOverdue ? (
        <Text style={[styles.heading, status.isOverdue ? styles.whiteText : undefined]}>
          Wattering the plants overdue by
        </Text>
      ) : (
        <Text style={[styles.heading, status.isOverdue ? styles.whiteText : undefined]}>
          Wattering the plants due in...
        </Text>
      )}
      <View style={styles.row}>
        <TimeSegment
          unit="Days"
          number={status.distance.days ?? 0}
          textStyle={status.isOverdue ? styles.whiteText : undefined}
        />
        <TimeSegment
          unit="Hours"
          number={status.distance.hours ?? 0}
          textStyle={status.isOverdue ? styles.whiteText : undefined}
        />
        <TimeSegment
          unit="Minutes"
          number={status.distance.minutes ?? 0}
          textStyle={status.isOverdue ? styles.whiteText : undefined}
        />
        <TimeSegment
          unit="Seconds"
          number={status.distance.seconds ?? 0}
          textStyle={status.isOverdue ? styles.whiteText : undefined}
        />
      </View>
      <TouchableOpacity style={styles.button} activeOpacity={0.8} onPress={scheduleNotification}>
        <Text style={styles.buttonText}>I've watered the plants!</Text>
      </TouchableOpacity>
      <ConfettiCannon
        ref={confettiRef}
        count={50}
        origin={{ x: width / 2, y: -20 }}
        fadeOut
        autoStart={false}
      />
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
  row: {
    flexDirection: "row",
    marginBottom: 24,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
  },
  containerLate: {
    backgroundColor: theme.colorRed,
  },
  whiteText: {
    color: theme.colorWhite,
  },
  indicatorContainer: {
    backgroundColor: theme.colorWhite,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
