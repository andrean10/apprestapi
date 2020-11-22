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
    let images = req.file;

    console.log(images);

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
                    // delete images if data is exists
                    deleteImages(images.filename, next);

                    return response.failed("Data Sudah Ada di Database", 409, res);
                } else {
                    let pathImages = `uploads/${images.filename}`;

                    connection.query('INSERT INTO mahasiswa (nim, nama, jurusan, images) VALUES (?, ?, ?, ?)',
                        [nim, nama, jurusan, pathImages], (error) => {
                            if (error) {
                                deleteImages(images.filename, next);
                                return response.failed("Your sent a request that this server could not understand!, Check your send body.", 400, res);
                            } else {
                                response.ok("Berhasil menambahkan data mahasiswa!", res, 201);
                            }
                        });
                }
            }
        }
    );
}

// method put mengubah semua data berdasarkan id
exports.editAllDataMahasiswa = (req, res, next) => {
    let id = req.params.id;
    let nim = req.body.nim;
    let nama = req.body.nama;
    let jurusan = req.body.jurusan;
    let images = req.file;

    if (!nim || !nama || !jurusan || !images) {
        if (images) {
            deleteImages(images.filename, next);
        }
        return response.failed("Your sent a request that this server could not understand!, Check your send body.", 400, res);
    }

    console.log(`Filename Images: ${images.filename}`);

    // check id is exist in database or not
    connection.query('SELECT * FROM mahasiswa WHERE id_mahasiswa = ?', [id],
        (error, values, fields) => {
            if (error) {
                console.log(`Message error : ${error}`);
                deleteImages(images.filename, next);

                return response.failed("Bad Request!", 400, res);
            } else {
                // datannya ada
                if (values && values.length > 0) {
                    let pathImages = `uploads/${images.filename}`;

                    connection.query('UPDATE mahasiswa SET nim = ?, nama = ?, jurusan = ?, images = ? WHERE id_mahasiswa = ?',
                        [nim, nama, jurusan, pathImages, id], (error) => {
                            if (error) {
                                next(error);
                                return response.failed("Bad Request!", 400, res);
                            } else {
                                const pathFileDb = values[0].images;
                                fs.unlink(path.join(__dirname, pathFileDb), (error) => {
                                    if (error) {
                                        console.log(`Unlink Error: ${error}`);
                                    }
                                });

                                response.ok("Data Mahasiswa Berhasil Diubah", res);
                            }
                        });
                } else {
                    // delete images if data exists
                    deleteImages(images.filename, next);
                    return response.failed("Data tidak ditemukan!", 404, res);
                }
            }
        });
}

// method patch mengubah data mahasiswa berdasarkan id
exports.editMahasiswa = (req, res, next) => {
    let id = req.params.id;
    let nim = req.body.nim;
    let nama = req.body.nama;
    let jurusan = req.body.jurusan;
    let images = req.file;

    let queries;
    let data;

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

    connection.query('SELECT * FROM mahasiswa WHERE id_mahasiswa = ?', [id],
        (error, values) => {
            if (error) {
                console.log(`Message error : ${error}`);
                deleteImages(images.filename, next);

                return response.failed("Bad Request!", 400, res);
            } else {
                // datannya ada
                if (values && values.length > 0) {
                    // if data same in another data in db response 409 conflict
                    connection.query('SELECT * FROM mahasiswa WHERE nim = ?', [nim], (error, values) => {
                        // data nim sama dengan data yang ada di db
                        if (error) {
                            console.log(error);
                            next(error);

                            return response.failed('Bad Request!', 400, res);
                        } else {
                            if (values && values.length) {
                                return response.failed("Data sudah ada di database", 409, res);
                            } else {
                                // let pathImages = `uploads/${images.filename}`;

                                connection.query(queries, data, (error, values) => {
                                    if (error) {
                                        return response.failed("Bad Request!", 400, res);
                                        // connection.log(error);
                                    } else {
                                        let message = values.changedRows;

                                        if (message === 0) {
                                            response.failed("Tidak ada perubahan pada data mahasiswa", 404, res);
                                        } else {
                                            response.ok("Data Mahasiswa Berhasil Diubah", res);
                                        }
                                    }
                                });
                            }
                        }
                    });
                } else {
                    // delete images if data don't exists
                    deleteImages(images.filename, next);
                    return response.failed("Data tidak ditemukan!", 404, res);
                }
            }
        });
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