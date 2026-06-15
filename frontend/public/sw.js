// Слушаем событие push — когда сервер присылает уведомление
self.addEventListener('push', function(event) {
    const data = event.data.json();
    
    const options = {
        body: data.body,
        icon: data.icon || '/icon-heart-192x192.png',
        badge: '/icon-heart-192x192.png', // Маленькая иконка для панели уведомлений
        data: {
            url: data.url // Ссылка, которую мы передали с сервера
        }
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// Слушаем клик по уведомлению — чтобы открывался наш сайт
self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    event.waitUntil(
        clients.openWindow(event.notification.data.url)
    );
});