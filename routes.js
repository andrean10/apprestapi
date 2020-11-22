'use strict';

module.exports = function (app) {
    const myJson = require('./controller');
    const multer = require('multer');

    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, './uploads');
        },
        filename: (req, file, cb) => {
            cb(null, new Date().toISOString().replace(/:/g, '-') + file.originalname.replace(/ /g, '-'));
        }
    });

    // filter image extension
    const fileFilter = (req, file, cb) => {
        // reject a file
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
            cb(null, true);
        } else {
            req.fileValidationError = 'Only image files are allowed';
            cb(new Error('Only image files are allowed'), false);
        }
    }

    // options upload images
    const upload = multer({
        storage: storage,
        limits: {
            fileSize: 1024 * 1024 * 4
        },
        fileFilter: fileFilter,
        onError: (error, next) => {
            console.log('Error multer: ' + error);
            next(error);
        }
    });

    app.route('/')
        .get(myJson.index);

    app.route('/mahasiswas')
        .get(myJson.showAllMahasiswa)
        .post(upload.single('profileMahasiswa'), myJson.addMahasiswa);

    app.route('/mahasiswas/:id')
        .get(myJson.showMahasiswaById)
        .put(upload.single('profileMahasiswa'), myJson.editAllDataMahasiswa)
        .patch(myJson.editMahasiswa)
        .delete(myJson.deleteMahasiswa);

    app.route('/krs')
        .get(myJson.showKrs);
}