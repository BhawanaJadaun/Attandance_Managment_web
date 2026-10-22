import React, { useEffect, useState } from "react";
import { Menu, Bell, X, UserRound, CheckCheck } from "lucide-react";

const configuredApiBase =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000";

const API_BASE = configuredApiBase.replace(/\/+$/, "");
const API_ROOT = API_BASE.endsWith("/api") ? API_BASE : `${API_BASE}/api`;

const readLoggedInUser = () => {
  try {
    const stored =
      localStorage.getItem("attendanceUser") || localStorage.getItem("user");

    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

const getAccessToken = () => {
  try {
    const storedUser = readLoggedInUser();

    return (
      localStorage.getItem("attendanceToken") ||
      localStorage.getItem("access_token") ||
      storedUser?.access_token ||
      storedUser?.accessToken ||
      storedUser?.token ||
      ""
    );
  } catch {
    return "";
  }
};

const apiRequest = async (path, options = {}) => {
  const token = getAccessToken();

  if (!token) {
    throw new Error("Please log in to view notifications.");
  }

  const response = await fetch(`${API_ROOT}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.detail || "Unable to process the notification request.",
    );
  }

  return data;
};

const Navbar = ({ setSidebarOpen }) => {
  const [user, setUser] = useState(readLoggedInUser);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [notificationError, setNotificationError] = useState("");

  const loadNotifications = async () => {
    if (!getAccessToken()) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    setLoadingNotifications(true);
    setNotificationError("");

    try {
      const data = await apiRequest("/notifications/");

      const items = Array.isArray(data)
        ? data
        : Array.isArray(data.notifications)
          ? data.notifications
          : [];

      setNotifications(items);
      setUnreadCount(
        typeof data.unread_count === "number"
          ? data.unread_count
          : items.filter((item) => !item.is_read).length,
      );
    } catch (error) {
      setNotificationError(error.message || "Unable to load notifications.");
    } finally {
      setLoadingNotifications(false);
    }
  };

  useEffect(() => {
    const syncNavbar = () => {
      setUser(readLoggedInUser());
      loadNotifications();
    };

    loadNotifications();

    window.addEventListener("storage", syncNavbar);
    window.addEventListener("focus", syncNavbar);

    return () => {
      window.removeEventListener("storage", syncNavbar);
      window.removeEventListener("focus", syncNavbar);
    };
  }, []);

  useEffect(() => {
    if (showNotifications) {
      loadNotifications();
    }
  }, [showNotifications]);

  const markAsRead = async (notification) => {
    if (notification.is_read) return;

    try {
      await apiRequest(`/notifications/${notification._id}/read`, {
        method: "PATCH",
      });

      setNotifications((previous) =>
        previous.map((item) =>
          item._id === notification._id ? { ...item, is_read: true } : item,
        ),
      );

      setUnreadCount((previous) => Math.max(0, previous - 1));
    } catch (error) {
      setNotificationError(
        error.message || "Could not mark notification as read.",
      );
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiRequest("/notifications/read-all", {
        method: "PATCH",
      });

      setNotifications((previous) =>
        previous.map((item) => ({ ...item, is_read: true })),
      );

      setUnreadCount(0);
      setNotificationError("");
    } catch (error) {
      setNotificationError(error.message || "Could not update notifications.");
    }
  };

  const name =
    user?.name ||
    user?.full_name ||
    user?.fullName ||
    user?.username ||
    user?.email?.split("@")[0] ||
    "Guest";

  const role = user?.role
    ? String(user.role).replace(/_/g, " ")
    : "Not signed in";

  const initials =
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join("") || "G";

  return (
    <header className="relative z-30 flex h-[76px] shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8">
      {/* Left side */}
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={() => setSidebarOpen?.(true)}
          aria-label="Open sidebar"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 md:hidden"
        >
          <Menu size={22} />
        </button>

        <div className="min-w-0">
          <h1 className="truncate text-base font-bold text-slate-900 sm:text-lg">
            Attendance Management
          </h1>
          <p className="mt-1 hidden text-xs text-slate-500 sm:block">
            Manage your attendance efficiently
          </p>
        </div>
      </div>

      {/* Right side */}
      <div className="flex shrink-0 items-center gap-2 sm:gap-4">
        {/* Notifications */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowNotifications((previous) => !previous)}
            aria-label={`View notifications. ${unreadCount} unread`}
            aria-expanded={showNotifications}
            className="relative flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-indigo-600"
          >
            <Bell size={20} />

            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-red-500 px-1 text-[10px] font-bold text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-12 z-50 w-[min(350px,calc(100vw-24px))] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                <div>
                  <h2 className="text-sm font-bold text-slate-800">
                    Notifications
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    {unreadCount} unread
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={markAllAsRead}
                      title="Mark all as read"
                      aria-label="Mark all notifications as read"
                      className="rounded-md p-1.5 text-indigo-600 hover:bg-indigo-50"
                    >
                      <CheckCheck size={17} />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setShowNotifications(false)}
                    aria-label="Close notifications"
                    className="rounded-md p-1 text-slate-500 hover:bg-slate-100"
                  >
                    <X size={17} />
                  </button>
                </div>
              </div>

              <div className="max-h-80 overflow-y-auto">
                {loadingNotifications && notifications.length === 0 ? (
                  <p className="px-4 py-6 text-center text-sm text-slate-500">
                    Loading notifications...
                  </p>
                ) : notificationError && notifications.length === 0 ? (
                  <div className="px-4 py-6 text-center">
                    <p className="text-sm text-red-600">{notificationError}</p>
                    <button
                      type="button"
                      onClick={loadNotifications}
                      className="mt-3 text-xs font-semibold text-indigo-600 hover:underline"
                    >
                      Try again
                    </button>
                  </div>
                ) : notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <button
                      key={notification._id}
                      type="button"
                      onClick={() => markAsRead(notification)}
                      className={`flex w-full gap-3 border-b border-slate-100 px-4 py-3 text-left last:border-b-0 hover:bg-slate-50 ${
                        notification.is_read ? "bg-white" : "bg-indigo-50/40"
                      }`}
                    >
                      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                        <Bell size={16} />
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="flex items-start justify-between gap-2">
                          <span className="text-sm font-semibold text-slate-800">
                            {notification.title}
                          </span>

                          {!notification.is_read && (
                            <span
                              aria-label="Unread"
                              className="mt-1 h-2 w-2 shrink-0 rounded-full bg-indigo-600"
                            />
                          )}
                        </span>

                        <span className="mt-1 block text-xs leading-5 text-slate-500">
                          {notification.message}
                        </span>

                        {notification.created_at && (
                          <span className="mt-2 block text-[10px] text-slate-400">
                            {new Date(notification.created_at).toLocaleString()}
                          </span>
                        )}
                      </span>
                    </button>
                  ))
                ) : (
                  <p className="px-4 py-6 text-center text-sm text-slate-500">
                    No notifications yet.
                  </p>
                )}

                {notificationError && notifications.length > 0 && (
                  <p className="px-4 py-2 text-xs text-red-600">
                    {notificationError}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Logged-in user */}
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-sm font-bold uppercase text-indigo-600">
            {user ? initials : <UserRound size={18} />}
          </div>

          <div className="hidden min-w-0 flex-col leading-tight sm:flex">
            <strong className="max-w-40 truncate text-xs font-semibold capitalize text-slate-800">
              Hi, {name}
            </strong>

            <span className="mt-1 max-w-40 truncate text-[11px] capitalize text-slate-500">
              {role}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
