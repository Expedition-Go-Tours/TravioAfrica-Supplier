import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Bell,
  Check,
  Trash2,
  Loader2,
} from "lucide-react";
import { formatDateTime, formatDate } from "@/lib/utils";
import { NOTIFICATION_TYPES } from "../constants";
import {
  useDeleteAllNotifications,
  useDeleteNotification,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from "../hooks/useNotifications";

function groupByDate(notifications) {
  const groups = {};
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  notifications.forEach((notif) => {
    const date = new Date(notif.date);
    const dateKey = formatDate(date);
    const isToday = date.toDateString() === today.toDateString();
    const isYesterday = date.toDateString() === yesterday.toDateString();

    let label;
    if (isToday) label = "Today";
    else if (isYesterday) label = "Yesterday";
    else label = dateKey;

    if (!groups[label]) groups[label] = [];
    groups[label].push(notif);
  });

  return groups;
}

export default function NotificationsPage() {
  const [filter, setFilter] = useState("all");

  const { data, isLoading, isError, refetch, isFetching } = useNotifications({
    limit: 50,
    unreadOnly: filter === "unread",
  });

  const markAsRead = useMarkNotificationRead();
  const markAllAsRead = useMarkAllNotificationsRead();
  const deleteNotification = useDeleteNotification();
  const deleteAllNotifications = useDeleteAllNotifications();

  const notifications = data?.notifications ?? [];
  const unreadCount = data?.unreadCount ?? 0;
  const groupedNotifications = groupByDate(notifications);

  const handleMarkAsRead = (id) => {
    markAsRead.mutate(id);
  };

  const handleMarkAllAsRead = () => {
    if (unreadCount === 0) return;
    markAllAsRead.mutate();
  };

  const handleDeleteNotification = (id) => {
    deleteNotification.mutate(id);
  };

  const handleDeleteAll = () => {
    if (notifications.length === 0) return;

    if (confirm("Are you sure you want to clear all notifications?")) {
      deleteAllNotifications.mutate(notifications.map((notification) => notification.id));
    }
  };

  const isMutating =
    markAsRead.isPending ||
    markAllAsRead.isPending ||
    deleteNotification.isPending ||
    deleteAllNotifications.isPending;

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#1e293b]">Notifications</h1>
          <p className="text-sm text-[#64748b] mt-1">
            {isLoading
              ? "Loading notifications..."
              : `You have ${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0 || isMutating}
            className="flex items-center gap-2 px-4 py-2.5 border border-[#eaeaea] rounded-lg text-sm font-medium text-[#64748b] hover:bg-[#f8fafc] hover:text-[#1e293b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {markAllAsRead.isPending ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
            Mark All Read
          </button>
          <button
            onClick={handleDeleteAll}
            disabled={notifications.length === 0 || isMutating}
            className="flex items-center gap-2 px-4 py-2.5 border border-[#eaeaea] rounded-lg text-sm font-medium text-[#64748b] hover:bg-[#ffebeb] hover:text-[#dc3545] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {deleteAllNotifications.isPending ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
            Clear All
          </button>
        </div>
      </div>

      <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-1">
        {[
          { key: "all", label: "All Notifications" },
          { key: "unread", label: "Unread" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filter === tab.key
                ? "bg-[#044b3b] text-white"
                : "bg-white text-[#64748b] border border-[#eaeaea] hover:bg-[#f8fafc]"
            }`}
          >
            {tab.label}
            {tab.key === "unread" && unreadCount > 0 && (
              <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${filter === "unread" ? "bg-white/20" : "bg-[#f8fafc]"}`}>
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {isLoading ? (
          <div className="text-center py-12">
            <Loader2 size={28} className="animate-spin mx-auto mb-3 text-[#044b3b]" />
            <p className="text-sm text-[#64748b]">Fetching your notifications...</p>
          </div>
        ) : isError ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-[#ffebeb] flex items-center justify-center mx-auto mb-4">
              <Bell size={24} className="text-[#dc3545]" />
            </div>
            <p className="text-sm text-[#64748b] mb-3">Could not load notifications.</p>
            <button
              onClick={() => refetch()}
              className="text-sm font-medium text-[#044b3b] hover:underline"
            >
              Try again
            </button>
          </div>
        ) : Object.entries(groupedNotifications).length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-[#f8fafc] flex items-center justify-center mx-auto mb-4">
              <Bell size={24} className="text-[#9e9e9e]" />
            </div>
            <p className="text-sm text-[#64748b]">
              {filter === "unread" ? "No unread notifications." : "No notifications to display."}
            </p>
          </div>
        ) : (
          Object.entries(groupedNotifications).map(([dateLabel, items]) => (
            <div key={dateLabel}>
              <h3 className="text-xs font-semibold text-[#64748b] uppercase tracking-wider mb-3 sticky top-16 bg-white py-2">
                {dateLabel}
              </h3>
              <div className="space-y-2">
                {items.map((notification) => {
                  const typeConfig = NOTIFICATION_TYPES[notification.type] || NOTIFICATION_TYPES.system;
                  const TypeIcon = typeConfig.icon;

                  return (
                    <div
                      key={notification.id}
                      className={`group flex flex-col sm:flex-row items-start gap-3 sm:gap-4 p-4 rounded-lg border transition-all ${
                        notification.read
                          ? "bg-white border-[#eaeaea]"
                          : "bg-[#f8fafc] border-[#044b3b]/20 shadow-sm"
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${typeConfig.color}`}>
                        <TypeIcon size={18} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {!notification.read && (
                            <span className="w-2 h-2 rounded-full bg-[#044b3b] flex-shrink-0" />
                          )}
                          <h4 className={`text-sm font-semibold ${notification.read ? "text-[#1e293b]" : "text-[#044b3b]"}`}>
                            {notification.title}
                          </h4>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#f8fafc] text-[#64748b] border border-[#eaeaea]">
                            {typeConfig.label}
                          </span>
                        </div>
                        <p className="text-sm text-[#64748b] mb-2">{notification.message}</p>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-[#9e9e9e]">{formatDateTime(notification.date)}</span>
                          {notification.action && (
                            <Link
                              to={notification.action}
                              onClick={() => {
                                if (!notification.read) {
                                  handleMarkAsRead(notification.id);
                                }
                              }}
                              className="text-xs text-[#044b3b] font-medium hover:underline"
                            >
                              {notification.actionLabel}
                            </Link>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity self-end sm:self-auto">
                        {!notification.read && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            disabled={isMutating}
                            className="p-1.5 text-[#9e9e9e] hover:text-[#00d67f] hover:bg-[#ebfcf5] rounded-md transition-colors disabled:opacity-50"
                            title="Mark as read"
                          >
                            <Check size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteNotification(notification.id)}
                          disabled={isMutating}
                          className="p-1.5 text-[#9e9e9e] hover:text-[#dc3545] hover:bg-[#ffebeb] rounded-md transition-colors disabled:opacity-50"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {isFetching && !isLoading && (
        <p className="text-xs text-[#9e9e9e] text-center mt-4">Syncing notifications...</p>
      )}
    </div>
  );
}
