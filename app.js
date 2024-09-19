const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();

// Serve static files from 'public' and 'uploads' directories
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// Set up storage destination and file naming
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Save with timestamp
    }
});

// Set up file type filter for images and videos
const fileFilter = (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|mp4|webm|ogg/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb('Error: Only images and videos are allowed!');
    }
};

// Initialize multer with the storage and file filter options
const upload = multer({
    storage: storage,
    fileFilter: fileFilter
}).single('file');

// Object to store descriptions
const descriptions = {};

// Home route
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// Upload route
app.post('/upload', (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            return res.status(400).send(err);
        }
        const description = req.body.description;
        const filename = req.file.filename;

        // Save description
        descriptions[filename] = description;

        res.json({ imageUrl: `/uploads/${filename}` });
    });
});

// API to get list of files in the 'uploads' folder
app.get('/uploads', (req, res) => {
    fs.readdir('uploads', (err, files) => {
        if (err) {
            return res.status(500).send('Unable to scan directory');
        }
        res.json(files);
    });
});

// API to get description for a specific file
app.get('/description/:filename', (req, res) => {
    const filename = req.params.filename;
    res.json({ description: descriptions[filename] || '' });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

