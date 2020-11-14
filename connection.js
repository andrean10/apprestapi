var mysql = require('mysql');

// buat koneksi database
const conn = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "dbrestapi"
});

conn.connect((err) => {
    if (err) {
        console.log(`Error connection: ${err.stack}`);
        return;
    }
    console.log('succes');
});

module.exports = conn;