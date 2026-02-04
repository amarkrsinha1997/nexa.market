self.addEventListener('push', function (event) {
    if (!event.data) return;

    const data = event.data.json();
    const title = data.title || 'Nexa Market';
    const options = {
        body: data.body,
        icon: '/nexa-logo.png', // Fallback to provided logo
        badge: '/nexa-logo.png', // Using existing logo as badge for now
        data: {
            url: data.url || '/'
        }
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function (event) {
    event.notification.close();

    if (event.notification.data && event.notification.data.url) {
        event.waitUntil(
            clients.openWindow(event.notification.data.url)
        );
    }
});
