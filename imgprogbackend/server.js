const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();

// Enable CORS for all routes
app.use(cors());

// Configure storage
const storage = multer.diskStorage({
  destination: './uploads',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// API to upload image
app.post('/upload', upload.single('image'), (req, res) => {
  res.json({ message: 'Image uploaded successfully!', filePath: `/uploads/${req.file.filename}` });
});

// API to get all images
app.get('/images', (req, res) => {
  fs.readdir('./uploads', (err, files) => {
    if (err) {
      res.status(500).json({ message: 'An error occurred.' });
    } else {
      res.json(files.map(file => `/uploads/${file}`));
    }
  });
});

// To serve images
app.use('/uploads', express.static('uploads'));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});