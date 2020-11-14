'use strict';

var response = require('./res');
var connection = require('./connection');

exports.index = function (req, res) {
    response.ok("Aplikasi REST API berjalan!", res);
}

exports.showAllMahasiswa = function (req, res) {
    connection.query('SELECT * FROM mahasiswa', (error, values, fields) => {
        if (error) {
            connection.log(error);
        } else {
            response.ok(values, res);
        }
    });
}