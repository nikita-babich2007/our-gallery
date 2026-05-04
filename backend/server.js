const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config();

const webpush = require('web-push');

// Настройка ключей web-push
webpush.setVapidDetails(
    process.env.VAPID_SUBJECT,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
);

const app = express();

app.use(cors());
app.use(express.json());

// --- 1. Настройка Cloudinary ---
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// --- 2. Настройка хранилища Multer для Cloudinary ---
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'our_gallery', // Так будет называться папка внутри твоего Cloudinary
        allowedFormats: ['jpeg', 'png', 'jpg', 'webp'],
    },
});
const upload = multer({ storage });

// --- 3. Подключение к БД ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('📦 База данных MongoDB успешно подключена!'))
    .catch((err) => console.log('❌ Ошибка подключения к БД:', err));

const photoSchema = new mongoose.Schema({
    imageUrl: { type: String, required: true },
    caption: { type: String },
    createdAt: { type: Date, default: Date.now }
});

const Photo = mongoose.model('Photo', photoSchema);

const subscriptionSchema = new mongoose.Schema({
    endpoint: String,
    expirationTime: Number,
    keys: {
        p256dh: String,
        auth: String
    }
});
const Subscription = mongoose.model('Subscription', subscriptionSchema);

// --- 4. МАРШРУТЫ ---

// ПОЛУЧЕНИЕ ФОТО ПОРЦИЯМИ (ПАГИНАЦИЯ)
app.get('/api/photos', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1; 
        const limit = parseInt(req.query.limit) || 12; 
        
        const skip = (page - 1) * limit;

        const photos = await Photo.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalPhotos = await Photo.countDocuments();

        res.json({
            photos: photos,
            hasMore: skip + photos.length < totalPhotos
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post('/api/photos', upload.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Файл не загружен' });
    }

    const imageUrl = req.file.path; 

    const photo = new Photo({
        imageUrl: imageUrl,
        caption: req.body.caption
    });

    try {
        const newPhoto = await photo.save();
        // --- РАССЫЛКА ПУШЕЙ ВСЕМ ПОДПИСЧИКАМ ---
        try {
            const subscriptions = await Subscription.find();
            const payload = JSON.stringify({
                title: 'Новое воспоминание! ❤️',
                body: 'Только что добавлено новое фото. Заходи посмотреть!',
                icon: '/icon-heart-192x192.png', // Наше красивое сердечко
                url: '/' // Куда перекинет при клике на уведомление
            });

            // Отправляем пуш каждому телефону в базе
            subscriptions.forEach(sub => {
                webpush.sendNotification(sub, payload).catch(err => {
                    // Если телефон недоступен или удалил приложение — удаляем его из базы
                    if (err.statusCode === 410) {
                        Subscription.deleteOne({ endpoint: sub.endpoint }).exec();
                    }
                });
            });
        } catch (pushErr) {
            console.error('Ошибка при рассылке:', pushErr);
        }
        // ----------------------------------------
        res.status(201).json(newPhoto);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// СОХРАНЕНИЕ ПОДПИСКИ НА УВЕДОМЛЕНИЯ
app.post('/api/subscribe', async (req, res) => {
    try {
        const subscription = req.body;
        
        // Проверяем, есть ли уже такой телефон в базе, чтобы не спамить
        const existing = await Subscription.findOne({ endpoint: subscription.endpoint });
        if (!existing) {
            await new Subscription(subscription).save();
        }
        res.status(201).json({ message: 'Подписка оформлена!' });
    } catch (error) {
        console.error('Ошибка подписки:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.delete('/api/photos/:id', async (req, res) => {
    try {
        const photoId = req.params.id; 
        const deletedPhoto = await Photo.findByIdAndDelete(photoId);

        if (!deletedPhoto) {
            return res.status(404).json({ message: 'Фото не найдено' });
        }
        res.json({ message: 'Воспоминание успешно удалено!' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.put('/api/photos/:id', async (req, res) => {
  try {
    const { caption } = req.body;
    const updatedPhoto = await Photo.findByIdAndUpdate(
      req.params.id,
      { caption: caption },
      { new: true }
    );
    res.json(updatedPhoto);
  } catch (error) {
    console.error('Ошибка при редактировании:', error);
    res.status(500).json({ message: 'Ошибка сервера при обновлении' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Сервер летит на порту ${PORT}`);
});