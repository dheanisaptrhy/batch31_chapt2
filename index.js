//panggil package express
const express = require('express')
// import  express  from 'express' (samimawon)

const app = express()

// set endpoint
app.get('/', function(request, response){
    response.send("Hello World")
})

// konfigurasi port aplikasi
const port = 5000 
//ibarat jalanan yg dilalui nodejs, nilainya biasanya diatas 3000
app.listen(port, function (){
    console.log(`jempol kuda running on port ${port}`)
})


