const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config();

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

// --- 4. МАРШРУТЫ ---

app.get('/api/photos', async (req, res) => {
    try {
        const photos = await Photo.find().sort({ createdAt: -1 }); 
        res.json(photos);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Загрузка фото ТЕПЕРЬ В ОБЛАКО
app.post('/api/photos', upload.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Файл не загружен' });
    }

    // ВАЖНО: Cloudinary сам генерирует ссылку на фото в интернете
    const imageUrl = req.file.path; 

    const photo = new Photo({
        imageUrl: imageUrl,
        caption: req.body.caption
    });

    try {
        const newPhoto = await photo.save();
        res.status(201).json(newPhoto);
    } catch (err) {
        res.status(400).json({ message: err.message });
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

// ОБНОВЛЕНИЕ ТЕКСТА ФОТОГРАФИИ
app.put('/api/photos/:id', async (req, res) => {
  try {
    const { caption } = req.body; // ИЗМЕНИЛИ text на caption
    const updatedPhoto = await Photo.findByIdAndUpdate(
      req.params.id,
      { caption: caption },       // ИЗМЕНИЛИ text на caption
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