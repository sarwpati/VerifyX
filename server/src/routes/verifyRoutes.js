const express = require('express');
const router = express.Router();
const verifyController = require('../controllers/verifyController');
const { uploadMemory } = require('../middleware/upload');

// Public verification routes
router.get('/online/:id', verifyController.verifyOnline);
router.post('/pdf-inspect', uploadMemory.single('pdfFile'), verifyController.verifyPdfFile);

module.exports = router;
