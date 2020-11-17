'use strict';

var response = require('./res');
var connection = require('./connection');
const path = require('path');

exports.index = function (req, res) {
    response.ok("Aplikasi REST API berjalan!", 200, res);
}

// menampilkan semua data mahasiswa
exports.showAllMahasiswa = function (req, res) {
    connection.query('SELECT * FROM mahasiswa', (error, values, fields) => {
        if (error) {
            response.failed("Bad Request!", 400, res);
            connection.log(error);
        } else {
            response.ok(values, 200, res);
        }
    });
}

// menampilkan semua data mahasiswa berdasarkan id
exports.showMahasiswaById = function (req, res) {
    let id = req.params.id;

    console.log(typeof id);

    connection.query('SELECT * FROM mahasiswa WHERE id_mahasiswa = ?', [id],
        (error, values, fields) => {
            if (error) {
                response.failed("Bad Request!", 400, res);
                connection.log(error);
            } else {
                if (values == 0) {
                    response.failed("Data tidak ditemukan", 404, res);
                } else {
                    response.ok(values, 200, res);
                }
            }
        }
    )
}

// menambahkan data mahasiswa
exports.addMahasiswa = (req, res) => {    
    let nim = req.body.nim;
    let nama = req.body.nama;
    let jurusan = req.body.jurusan;

    connection.query('INSERT INTO mahasiswa (nim, nama, jurusan) VALUES (?, ?, ?)',
        [nim, nama, jurusan], (error, values, fields) => {
            if (error) {
                response.failed("Bad Request!", 400, res);
                connection.log(error);
            } else {
                response.ok("Berhasil menambahkan data mahasiswa!", 201, res);
            }
        });
}

// mengubah data mahasiswa berdasarkan id
exports.editMahasiswa = function (req, res) {
    let id = req.params.id;
    let nim = req.body.nim;
    let nama = req.body.nama;
    let jurusan = req.body.jurusan;
    let images = req.file;

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

    if (images) {
        queries = 'UPDATE mahasiswa SET images = ? WHERE id_mahasiswa = ?';
        data = [`uploads/${images.filename}`, id];
    }

    connection.query(queries, data, (error, values, fields) => {
        if (error) {
            response.failed("Bad Request!", 400, res);
            // connection.log(error);
        } else {
            let message = values.changedRows;

            if (message === 0) {
                response.failed("Tidak ada perubahan pada data mahasiswa", 404, res);
            } else {
                response.ok("Data Mahasiswa Berhasil Diubah", 200, res);
            }
        }
    });
}

// menghapus data mahasiswa berdasarkan id
exports.deleteMahasiswa = function (req, res) {
    let id = req.params.id;

    connection.query('DELETE FROM mahasiswa WHERE id_mahasiswa = ?', [id],
        (error, values, fields) => {
            if (error) {
                response.failed("Bad Request!", 400, res);
                connection.log(error);
            } else {
                if (values.affectedRows === 0) {
                    response.failed("Data mahasiswa tidak ada di database", res);
                } else {
                    response.ok("Data mahasiswa berhasil dihapus!", res);
                }
            }
        }
    );
}

// menampilkan data krs yang dimiliki mahasiswa
exports.showKrs = function (req, res) {
    connection.query('SELECT mahasiswa.id_mahasiswa, mahasiswa.nim, mahasiswa.nama, mahasiswa.jurusan, matakuliah.matakuliah, matakuliah.sks FROM krs JOIN mahasiswa USING(id_mahasiswa) JOIN matakuliah USING(id_matakuliah) ORDER BY mahasiswa.id_mahasiswa',
        (error, values, fields) => {
            if (error) {
                connection.log(error);
                response.failed("Bad Request!", 400, res);
            } else {
                response.nestedJSON(values, res);
            }
        });
}