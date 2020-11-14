'use strict';

module.exports = function (app) {
    var myJson = require('./controller');

    app.route('/')
        .get(myJson.index);
    
    app.route('/showMahasiswas')
        .get(myJson.showAllMahasiswa);
    
    app.route('/showMahasiswas/:id')
        .get(myJson.showMahasiswaById);
}