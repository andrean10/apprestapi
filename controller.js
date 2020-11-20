'use strict';

const response = require('./res');
const connection = require('./connection');
const fs = require('fs');
const path = require('path');

exports.index = function (req, res) {
    response.ok("Aplikasi REST API berjalan!", res);
}

// menampilkan semua data mahasiswa
exports.showAllMahasiswa = function (req, res) {
    connection.query('SELECT * FROM mahasiswa', (error, values) => {
        if (error) {
            response.failed("Bad Request!", 400, res);
            connection.log(error);
        } else {
            if (values.length > 0) {
                response.ok(values, res);
            } else {
                response.failed("Tidak Ada Data!", 404, res);
            }
        }
    });
}

// menampilkan semua data mahasiswa berdasarkan id
exports.showMahasiswaById = function (req, res) {
    let id = req.params.id;

    connection.query('SELECT * FROM mahasiswa WHERE id_mahasiswa = ?', [id],
        (error, values) => {
            if (error) {
                response.failed("Bad Request!", 400, res);
                connection.log(error);
            } else {
                if (values && values.length > 0) {
                    response.ok(values, res);
                } else {
                    response.failed("Data tidak ditemukan", 404, res);
                }
            }
        }
    )
}

// menambahkan data mahasiswa
exports.addMahasiswa = (req, res, next) => {

    let nim = req.body.nim;
    let nama = req.body.nama;
    let jurusan = req.body.jurusan;
    let profileMahasiswa = req.file;

    console.log(profileMahasiswa);

    // upload(req, res, (error) => {
    //     if (req.fileValidationError) {
    //         return res.send(req.fileValidationError);
    //     } else if (error instanceof multer.MulterError) {
    //         return res.send(error);
    //     } else if (error) {
    //         return res.send(error);
    //     }
    // });

    // check if exist data in db mahasiswa
    connection.query('SELECT * FROM mahasiswa WHERE nim = ? OR nama = ?', [nim, nama],
        (error, values) => {
            if (error) {
                console.log(`Message error : ${error}`);
            } else {
                console.log(values);

                if (values && values.length > 0) {
                    response.failed("Data Sudah Ada di Database", 409, res);

                    // delete images if data is exists
                    deleteImages(profileMahasiswa.filename, next);
                } else {
                    let pathImages = `uploads/${profileMahasiswa.filename}`;

                    connection.query('INSERT INTO mahasiswa (nim, nama, jurusan, images) VALUES (?, ?, ?, ?)',
                        [nim, nama, jurusan, pathImages], (error) => {
                            if (error) {
                                response.failed("Your sent a request that this server could not understand!, Check your send body.", 400, res);
                                deleteImages(profileMahasiswa.filename, next);

                            } else {
                                response.ok("Berhasil menambahkan data mahasiswa!", res, 201);
                            }
                        });
                }
            }
        }
    );
}

// mengubah data mahasiswa berdasarkan id
exports.editMahasiswa = function (req, res) {
    let id = req.params.id;
    let nim = req.body.nim;
    let nama = req.body.nama;
    let jurusan = req.body.jurusan;
    let images = req.file;

    console.log(`${id}, ${nim}, ${nama}, ${jurusan}, ${images}`);

    // var queries;
    // var data;

    // if (nim) {
    //     queries = 'UPDATE mahasiswa SET nim = ? WHERE id_mahasiswa = ?';
    //     data = [nim, id];
    // }

    // if (nama) {
    //     queries = 'UPDATE mahasiswa SET nama = ? WHERE id_mahasiswa = ?';
    //     data = [nama, id];
    // }

    // if (jurusan) {
    //     queries = 'UPDATE mahasiswa SET jurusan = ? WHERE id_mahasiswa = ?';
    //     data = [jurusan, id];
    // }

    // if (images) {
    //     queries = 'UPDATE mahasiswa SET images = ? WHERE id_mahasiswa = ?';
    //     data = [`uploads/${images.filename}`, id];
    // }

    // connection.query(queries, data, (error, values, fields) => {
    //     if (error) {
    //         response.failed("Bad Request!", 400, res);
    //         // connection.log(error);
    //     } else {
    //         let message = values.changedRows;

    //         if (message === 0) {
    //             response.failed("Tidak ada perubahan pada data mahasiswa", 404, res);
    //         } else {
    //             if (images) {
    //                 upload.single('profileMahasiswa');
    //             }

    //             response.ok("Data Mahasiswa Berhasil Diubah", res);
    //         }
    //     }
    // });
}

// menghapus data mahasiswa berdasarkan id
exports.deleteMahasiswa = (req, res) => {
    let id = req.params.id;

    // get name file in db to remove images in folder uploads
    connection.query('SELECT * FROM mahasiswa WHERE id_mahasiswa = ?', [id],
        (error, values) => {
            console.log(values);
            if (error) {
                console.log(`Query error: ${error}`);
            } else {
                const fileName = values[0].images;

                connection.query('DELETE FROM mahasiswa WHERE id_mahasiswa = ?', [id],
                    (error, values) => {
                        if (error) {
                            response.failed("Bad Request!", 400, res);
                            // connection.log(error);
                        } else {
                            if (values.affectedRows === 0) {
                                response.failed("Data mahasiswa tidak ada di database", 404, res);
                            } else {
                                response.ok("Data mahasiswa berhasil dihapus!", res);
                                fs.unlink(path.join(__dirname, fileName), (error) => {
                                    if (error) {
                                        console.log(`Unlink Error: ${error}`);
                                    }
                                });
                            }
                        }
                    }
                );
            }
        });
}

// menampilkan data krs yang dimiliki mahasiswa
exports.showKrs = function (req, res) {
    connection.query('SELECT mahasiswa.id_mahasiswa, mahasiswa.nim, mahasiswa.nama, mahasiswa.jurusan, matakuliah.matakuliah, matakuliah.sks FROM krs JOIN mahasiswa USING(id_mahasiswa) JOIN matakuliah USING(id_matakuliah) ORDER BY mahasiswa.id_mahasiswa',
        (error, values) => {
            if (error) {
                connection.log(error);
                response.failed("Bad Request!", 400, res);
            } else {
                response.nestedJSON(values, res);
            }
        });
}

const deleteImages = (fileName, next) => {
    fs.unlink(path.join(__dirname, '/uploads', fileName), (error) => {
        if (error) {
            console.log(`Unlink Error: ${error}`);
            next(error);
        }
    });
}