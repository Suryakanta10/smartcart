import { useEffect } from "react";
import { router } from "expo-router";
import * as Notifications from "expo-notifications";

export function useNotificationObserver() {
  useEffect(() => {
    let isMounted = true;

    function redirect(notification) {
      const url = notification?.request?.content?.data?.url;
      if (url) router.push(url);
    }

    // App was closed and opened by tapping the notification
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (isMounted && response?.notification) redirect(response.notification);
    });

    // App was open or in the background
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        redirect(response.notification);
      },
    );

    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, []);
}
