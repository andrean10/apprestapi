const mysql = require('mysql');
const md5 = require('md5');
const jwt = require('jsonwebtoken');
const ip = require('ip');
const connection = require('../connection');
const response = require('../res');
const config = require('../config/secret');

// controller for register user
exports.register = (req, res) => {
    const post = {
        username: req.body.username,
        email: req.body.email,
        password: md5(req.body.password),
        role: req.body.role,
        tanggal_daftar: new Date()
    }

    let query = 'SELECT email from ?? WHERE ?? = ?';
    const table = ['user', 'email', post.email];

    query = mysql.format(query, table);
    connection.query(query, (error, values) => {
        if (error) {
            console.log(error);
            return response.failed("Request body must set values!", 400, res)
        } else {
            if (values.length === 0) {
                let query = 'INSERT INTO ?? SET ?';
                const table = ['user'];

                query = mysql.format(query, table);
                connection.query(query, post, (error) => {
                    if (error) {
                        console.log(error);
                        return response.failed("Request body must set values!", 400, res);
                    } else {
                        response.ok("Berhasil registrasi user", res);
                    }
                });
            } else {
                response.ok("Email sudah terdaftar!", res);
            }
        }
    });
}

exports.login = (req, res) => {
    const post = {
        email: req.body.email,
        password: req.body.password
    }

    let query = 'SELECT * FROM ?? WHERE ?? = ? AND ?? = ?';
    const table = ['user', 'email', post.email, 'password', md5(post.password)];

    query = mysql.format(query, table);
    connection.query(query, (error, values) => {
        if (error) {
            console.log(error);
            return response.failed("Request body must set values!", 400, res);
        } else {
            if (values.length === 1) {
                const token = jwt.sign({values}, config.secrets, {
                    expiresIn: '1h'
                });
                const id = values[0].id;

                const data = {
                    id_user: id,
                    access_token: token,
                    ip_address: ip.address()
                }

                let query = 'INSERT INTO ?? SET ?';
                const table = ['akses_token'];

                query = mysql.format(query, table);
                connection.query(query, data, (error) => {
                   if (error) {
                       console.log(error);
                       return response.failed("Gagal menambahkan data!", 400, res);
                   } else {
                       res.json({
                           succes: true,
                           message: "Token JWT tergenerate!",
                           token: token,
                           currUser: data.id_user
                       });
                   } 
                });
            } else {
                res.json({
                    error: true,
                    message: "Email atau password yang anda masukkan salah!"
                 });
            }
        }
    });
}