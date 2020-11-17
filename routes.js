'use strict';

module.exports = function (app) {
    const myJson = require('./controller');
    const multer = require('multer');

    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, './uploads');
        },
        filename: (req, file, cb) => {
            cb(null, new Date().toISOString().replace(/:/g, '-') + file.originalname);
        }
    });

    // filter image extension
    const fileFilter = (req, file, cb) => {
        // reject a file
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
            cb(null, true);
        } else {
            cb(null, false);
        }
    }

    // options upload images
    const upload = multer({
        storage: storage,
        limits: {
            fileSize: 1024 * 1024 * 4
        },
        fileFilter: fileFilter
    });

    app.route('/')
        .get(myJson.index);

    app.route('/mahasiswas')
        .get(myJson.showAllMahasiswa)
        .post(upload.single('profileMahasiswa'), myJson.addMahasiswa);

    app.route('/mahasiswas/:id')
        .get(myJson.showMahasiswaById)
        .patch(upload.single('profileMahasiswa'), myJson.editMahasiswa)
        .delete(myJson.deleteMahasiswa);

    app.route('/krs')
        .get(myJson.showKrs);
}