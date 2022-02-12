//cimport  postgres pool (method buat nampung koneksi dari pengguna)
const {Pool} = require('pg')

// object destructing = memecah properti dari sebuah objek

//setup connection pool
const dbPool = new Pool({
    database : 'personal-web-siang',
    port : 5000,
    user : 'postgres',
    password : 'kaito1412' //based on password @ pg
})

// export db pool
module.exports = dbPool