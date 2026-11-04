jest.mock("../src/services/notifications", () => ({
  ensureNotificationPermission: jest.fn(() => Promise.resolve(true)),
  scheduleCartReminder: jest.fn(() => Promise.resolve("reminder-id")),
  cancelCartReminder: jest.fn(() => Promise.resolve()),
}));

import {
  getReminderAction,
  buildReminderContent,
  handleCartChange,
  REMINDER_DELAY_SECONDS,
} from "../src/services/cartReminder";
import {
  ensureNotificationPermission,
  scheduleCartReminder,
  cancelCartReminder,
} from "../src/services/notifications";

const airpods = { id: 1, title: "Apple Airpods", quantity: 1 };
const watch = { id: 2, title: "Smart Watch", quantity: 2 };
const bag = { id: 3, title: "Leather Bag", quantity: 1 };

beforeEach(() => {
  jest.clearAllMocks();
});

describe("getReminderAction", () => {
  it("does nothing when the cart reference did not change", () => {
    const items = [airpods];
    expect(getReminderAction(items, items)).toBe("none");
  });

  it("schedules when an item is added", () => {
    expect(getReminderAction([], [airpods])).toBe("schedule");
  });

  it("reschedules when quantity changes", () => {
    expect(getReminderAction([airpods], [{ ...airpods, quantity: 2 }])).toBe(
      "schedule",
    );
  });

  it("cancels when the cart becomes empty", () => {
    expect(getReminderAction([airpods], [])).toBe("cancel");
  });

  it("does nothing when an empty cart stays empty", () => {
    expect(getReminderAction([], [])).toBe("none");
  });
});

describe("buildReminderContent", () => {
  it("mentions the single product", () => {
    const content = buildReminderContent([airpods]);
    expect(content.body).toBe('"Apple Airpods" is still waiting in your cart.');
  });

  it("mentions how many other products are waiting", () => {
    const content = buildReminderContent([airpods, watch, bag]);
    expect(content.body).toBe(
      '"Apple Airpods" and 2 other products are waiting in your cart.',
    );
  });

  it("opens the cart when tapped", () => {
    expect(buildReminderContent([airpods]).data).toEqual({ url: "/cart" });
  });
});

describe("handleCartChange", () => {
  it("schedules a reminder when an item is added", async () => {
    await handleCartChange([], [airpods]);

    expect(scheduleCartReminder).toHaveBeenCalledTimes(1);
    expect(scheduleCartReminder).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Forgot something? 🛒" }),
      REMINDER_DELAY_SECONDS,
    );
    expect(cancelCartReminder).not.toHaveBeenCalled();
  });

  it("does not schedule when permission is denied", async () => {
    ensureNotificationPermission.mockResolvedValueOnce(false);

    const result = await handleCartChange([], [airpods]);

    expect(result).toBe("denied");
    expect(scheduleCartReminder).not.toHaveBeenCalled();
  });

  it("cancels the reminder when the cart is cleared", async () => {
    await handleCartChange([airpods, watch], []);

    expect(cancelCartReminder).toHaveBeenCalledTimes(1);
    expect(scheduleCartReminder).not.toHaveBeenCalled();
  });

  it("cancels the reminder after a purchase (checkout empties the cart)", async () => {
    const result = await handleCartChange([watch], []);

    expect(result).toBe("cancel");
    expect(cancelCartReminder).toHaveBeenCalled();
  });
});
