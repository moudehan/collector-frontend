let unreadCount = 0;

type Listener = (count: number) => void;
const listeners = new Set<Listener>();

export function subscribeToUnread(listener: Listener) {
  listeners.add(listener);
  listener(unreadCount);

  return () => {
    listeners.delete(listener);
  };
}

export function setUnreadCount(count: number) {
  unreadCount = count;
  listeners.forEach((listener) => listener(unreadCount));
}

export function resetUnread() {
  setUnreadCount(0);
}
