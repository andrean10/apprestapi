'use strict';

module.exports = function (app) {
    var myJson = require('./controller');

    app.route('/')
        .get(myJson.index);
    
    app.route('/mahasiswas')
        .get(myJson.showAllMahasiswa)
        .post(myJson.addMahasiswa);
    
    app.route('/mahasiswas/:id')
        .get(myJson.showMahasiswaById)
        .patch(myJson.editMahasiswa)
        .delete(myJson.deleteMahasiswa);
    
    app.route('/krs')
        .get(myJson.showKrs);
}