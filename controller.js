'use strict';

var response = require('./res');
var connection = require('./connection');

exports.index = function (req, res) {
    response.ok("Aplikasi REST API berjalan!", res);
}

// menampilkan semua data mahasiswa
exports.showAllMahasiswa = function (req, res) {
    connection.query('SELECT * FROM mahasiswa', (error, values, fields) => {
        if (error) {
            connection.log(error);
        } else {
            response.ok(values, res);
        }
    });
}

// menampilkan semua data mahasiswa berdasarkan id
exports.showMahasiswaById = function (req, res) {
    let id = req.params.id;
    connection.query('SELECT * FROM mahasiswa WHERE id_mahasiswa = ?', [id],
        (error, values, fields) => {
            if (error) {
                connection.log(error);
            } else {
                response.ok(values, res);
            }
        }
    )
}

// menambahkan data mahasiswa
exports.addMahasiswa = function (req, res) {
    let nim = req.body.nim;
    let nama = req.body.nama;
    let jurusan = req.body.jurusan;

    connection.query('INSERT INTO mahasiswa (nim, nama, jurusan) VALUES (?, ?, ?)',
        [nim, nama, jurusan], (error, values, fields) => {
            if (error) {
                connection.log(error);
            } else {
                response.ok("Berhasil menambahkan data!", res);
            }
        }   
    )
}