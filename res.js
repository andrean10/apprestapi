'use strict';

exports.ok = function (values, res, code) {
    const codeResponse = code ? code : 200;
    
    var data = {
        'status': codeResponse,
        'values': values
    };

    res.status(codeResponse);
    res.json(data);
    res.end()
}

exports.failed = (values, code, res) => {
    var data = {
        'status': code,
        'values': values
    }

    res.status(code);
    res.json(data);
    res.end();
}

exports.serverError = (values, res) => {
    var data = {
        'status': 500,
        'values': values
    }

    res.status(500);
    res.json(data);
    res.end();
}

exports.nestedJSON = (values, res) => {
    // lakukan akumulasi
    const result = values.reduce((acc, item) => {
        acc.forEach(v => {
            console.log(`Acc ${acc}`);
        });

        console.log(`item Nama : ${item.nama}`);
        
        // tentukan key group
        if (acc[item.nama]) {
            // buat variabel group nama mahasiswa
            const group = acc[item.nama];
        
            console.log(`group matkul sebelum : ${group.matakuliah}`);
            // cek jika isi array adalah matakuliah
            if (Array.isArray(group.matakuliah)) {
                // tambahkan value baru ke dalam group matakuliah
                group.matakuliah.push(item.matakuliah);
            } else {
                group.matakuliah = [group.matakuliah, item.matakuliah];
            }
            console.log(`group matkul setelah di ubah : ${group.matakuliah}`);
        } else {
            acc[item.nama] = item;
            console.log(acc[item.nama]);
        }
        return acc;
    }, {});

    var data = {
        'status': 200,
        'values': result
    }

    res.status(200);
    res.json(data);
    res.end();
}