const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();

// Enable CORS for all routes
app.use(cors());

// Debugging test route
app.get('/test', (req, res) => {
  res.json({ message: 'Server is running' });
});

// Configure storage
const storage = multer.diskStorage({
  destination: './uploads',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
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

// API to delete image
app.delete('/delete/uploads/:filename', (req, res) => {
  const filename = req.params.filename;

  // Check for any '..' in the path to prevent directory traversal attacks
  if (filename.includes('..')) {
    res.status(400).json({ message: 'Bad request' });
    return;
  }

  const filePath = path.join(__dirname, 'uploads', filename);
  fs.unlink(filePath, (err) => {
    if (err) {
      res.status(500).json({ message: 'An error occurred while deleting the image.' });
    } else {
      res.json({ message: 'Image deleted successfully!' });
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
