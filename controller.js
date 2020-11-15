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
            response.failed(error, res);
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
                response.failed(error, res);
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
                response.failed("error", res);
                connection.log(error);
            } else {
                response.ok("Berhasil menambahkan data mahasiswa!", res);
            }
        }   
    )
}

// mengubah data mahasiswa berdasarkan id
exports.editMahasiswa = function (req, res) {
    let id = req.params.id;
    let nim = req.body.nim;
    let nama = req.body.nama;
    let jurusan = req.body.jurusan;

    var queries;
    var data;

    if (nim) {
        queries = 'UPDATE mahasiswa SET nim = ? WHERE id_mahasiswa = ?';
        data = [nim, id];
    }

    if (nama) {
        queries = 'UPDATE mahasiswa SET nama = ? WHERE id_mahasiswa = ?';
        data = [nama, id];
    }

    if (jurusan) {
        queries = 'UPDATE mahasiswa SET jurusan = ? WHERE id_mahasiswa = ?';
        data = [jurusan, id];
    }

    connection.query(queries, data, (error, values, fields) => {
            if (error) {
                response.failed(error, res);
                connection.log(error);
            } else {
                let message = values.changedRows;

                if (message === 0) {
                    response.ok("Tidak ada perubahan pada data mahasiswa", res);
                } else {
                    response.ok("Data Mahasiswa Berhasil Diubah", res);
                }
            }
        });
}

exports.deleteMahasiswa = function (req, res) {
    let id = req.params.id;

    connection.query('DELETE FROM mahasiswa WHERE id_mahasiswa = ?', [id],
        (error, values, fields) => {
            if (error) {
                response.failed(error, res);
                connection.log(error);
            } else {
                response.ok("Data mahasiswa berhasil dihapus!", res);
            }
        }
    );
}