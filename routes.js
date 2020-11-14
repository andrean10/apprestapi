'use strict';

module.exports = function (app) {
    var myJson = require('./controller');

    app.route('/')
        .get(myJson.index);
    
    app.route('/showmahasiswa')
        .get(myJson.showAllMahasiswa);
    
    app.route('/showmahasiswa/:id')
        .get(myJson.showMahasiswaById);
    
    app.route('/tambahmahasiswa')
        .post (myJson.addMahasiswa);
}