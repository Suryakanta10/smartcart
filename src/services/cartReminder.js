import {
  ensureNotificationPermission,
  scheduleCartReminder,
  cancelCartReminder,
} from "./notifications";

// Short delay so the feature is easy to demo. In production this would be ~2 hours.
export const REMINDER_DELAY_SECONDS = 60;

export function getReminderAction(prevItems, nextItems) {
  if (prevItems === nextItems) return "none";
  if (nextItems.length === 0) return prevItems.length > 0 ? "cancel" : "none";
  return "schedule";
}

export function buildReminderContent(items) {
  const firstTitle = items[0]?.title ?? "Your items";
  const others = items.length - 1;

  const body =
    others > 0
      ? `"${firstTitle}" and ${others} other ${others === 1 ? "product are" : "products are"} waiting in your cart.`
      : `"${firstTitle}" is still waiting in your cart.`;

  return {
    title: "Forgot something? 🛒",
    body,
    data: { url: "/cart" },
  };
}

export async function handleCartChange(prevItems, nextItems) {
  const action = getReminderAction(prevItems, nextItems);

  if (action === "cancel") {
    await cancelCartReminder();
    return action;
  }

  if (action === "schedule") {
    const allowed = await ensureNotificationPermission();
    if (!allowed) return "denied";
    await scheduleCartReminder(
      buildReminderContent(nextItems),
      REMINDER_DELAY_SECONDS,
    );
  }

  return action;
}
