const { Router } = require('express');
const { uploadPdfController, uploadPdfMiddleware } = require('../services/uploadServices');

const router = Router();

router.post('/pdf', uploadPdfMiddleware.single('pdf'), uploadPdfController)

module.exports = router;