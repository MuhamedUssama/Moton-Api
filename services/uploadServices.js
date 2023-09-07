const multer = require('multer')
const path = require('path')

exports.uploadPdfMiddleware = multer({
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(pdf)$/))
            return cb(new Error('Please upload a PDF'))
        cb(null, true)
    },
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            const fullPath = path.join(__dirname, '../uploads/pdfs')
            cb(null, fullPath)
        },
        filename: (req, file, cb) => {
            const fileName = `pdf-${Date.now()}${path.extname(file.originalname)}`;
            cb(null, fileName)
        }
    }),
})

exports.uploadPdfController = async (req, res, next) => {
    if (req.file)
        res.status(201).json({
            ok: true,
            code: 201,
            message: "Pdf uploaded successfully",
            filename: req.file.filename
        });
    else
        res.status(400).json({
            ok: false,
            code: 400,
            message: "No pdf uploaded"
        });
}