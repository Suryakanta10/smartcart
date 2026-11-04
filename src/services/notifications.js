import { Platform } from "react-native";
import * as Notifications from "expo-notifications";

export const CART_CHANNEL_ID = "cart-reminders";
export const CART_REMINDER_ID = "abandoned-cart-reminder";

export function configureNotifications() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export async function ensureNotificationPermission() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(CART_CHANNEL_ID, {
      name: "Cart reminders",
      importance: Notifications.AndroidImportance.HIGH,
    });
  }

  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;

  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

export async function scheduleCartReminder(content, delaySeconds) {
  await Notifications.cancelScheduledNotificationAsync(CART_REMINDER_ID);

  return Notifications.scheduleNotificationAsync({
    identifier: CART_REMINDER_ID,
    content,
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: delaySeconds,
      channelId: CART_CHANNEL_ID,
    },
  });
}

export function cancelCartReminder() {
  return Notifications.cancelScheduledNotificationAsync(CART_REMINDER_ID);
}
