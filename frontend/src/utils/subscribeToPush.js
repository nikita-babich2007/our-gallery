// Функция для конвертации ключа (просто скопируй её)
function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export async function subscribeUserToPush() {
    // 1. Проверяем, поддерживает ли браузер сервис-воркеры
    if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;

        // 2. Подписываем пользователя
        const vapidPublicKey = 'BL_Xdg3x1bEOsBwu5yCcliuk-Gy7ejIrr8poqyT83OxFG_mLCiMCCUihwltZtXTtYKV-hYSbilApBXTS0AU68-o'; 
        const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: convertedVapidKey
        });

        // 3. Отправляем подписку на бэкенд
        await fetch('https://our-gallery-backend.onrender.com/api/subscribe', {
            method: 'POST',
            body: JSON.stringify(subscription),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Пользователь успешно подписан на пуши!');
    }
}