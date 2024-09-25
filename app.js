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
        const timestamp = Date.now();
        cb(null, `${timestamp}_${file.originalname}`);
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

// File to store descriptions
const descriptionsFilePath = path.join(__dirname, 'descriptions.json');

// Function to read descriptions from file
const readDescriptions = () => {
    if (fs.existsSync(descriptionsFilePath)) {
        const data = fs.readFileSync(descriptionsFilePath);
        return JSON.parse(data);
    }
    return {}; // Return an empty object if the file does not exist
};

// Function to write descriptions to file
const writeDescriptions = (descriptions) => {
    fs.writeFileSync(descriptionsFilePath, JSON.stringify(descriptions, null, 2));
};

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
        const description = req.body.description || ''; // Use empty string if description is undefined
        const filename = req.file.filename;

        // Read existing descriptions
        const descriptions = readDescriptions();

        // Save new description
        descriptions[filename] = description;

        // Write updated descriptions back to the file
        writeDescriptions(descriptions);

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
    const descriptions = readDescriptions(); // Read descriptions from file
    res.json({ description: descriptions[filename] || '' }); // Return description from file
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
