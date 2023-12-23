export const unreadNotificationsFunction = (notifications) => {
    return notifications.filter(n => n.isRead === false);
};