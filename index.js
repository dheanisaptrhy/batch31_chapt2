//panggil package express
const { response } = require('express')
const express = require('express')
// import  express  from 'express' (samimawon)
const db = require('./connection/db.js')
// import db from '.connection/db.js'

const app = express()

const isLogin = true

let month = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember'
]

const blogs= [
    {
        title:"hemelekete",
        content: "heheheh",
        author: "Albedo",
        posted_at: "12-03-1997"
    }
]

// set template engine
app.set('view engine','hbs')

// set endpoint
app.use('/public',express.static(__dirname+'/public'))
app.use(express.urlencoded({extended:false}))

app.get('/', function(request, response){
    response.send("Hello World")
})

app.get('/home', function(req, res){
    res.render('index')
    
})

app.get('/blog', function(req, res){
    let query = 'select * from tb_blog'
    db.connect((err, client,done)=>{
        if(err) throw err
        client.query(query, (err,result)=>{
            done()

            if(err) throw err
            let data = result.rows

            console.log(data)

            data = data.map((blog)=>{
                return {
                    ...blog,
                    isLogin:isLogin,
                    posted_at: getFullTime(blog.posted_at)
                }
            })
            res.render('blog', {isLogin:isLogin, blogs:data})
        })  
    })

    // console.log(blogs)
    // let dataBlogs = blogs.map(function(data){
    //     return {
    //         ...data,
    //         isLogin:isLogin
    //     }
    // })
    // res.render('blog', {isLogin:isLogin, blogs:dataBlogs})
})

app.get('/add-blog', function(req, res){npm 
    res.render('form-blog')
    
})

//kapan params: mengacu pada parameter yg dikirimkan 
// kapan body: ketika data dihandle, tanpa melalui parameter
// ada session

app.post('/blog', function(req,res){
    let title = req.body.title
    let content = req.body.content
    let date= new Date()
    // app.
    let blog = {
        title,
        content,
        author: "Albedo",
        posted_at: getFullTime(date)
    }

    blogs.push(blog)
    // console.log(blogs)

    res.redirect('/blog')
})

app.get('/blog/:id', function(req, res){
    let id = req.params.id
    console.log(`id dari client : ${id}`)
    res.render('blog-detail', {id : id})
})

app.get('/contact-me', function(req, res){
    res.render('contact')
    
})

app.get('/delete-post/:index', function(req, res){
    let index = req.params.index
    blogs.splice(index,1)
    console.log(`index data: ${index}`)
})

// app.get

// konfigurasi port aplikasi
const port = 4000 
//ibarat jalanan yg dilalui nodejs, nilainya biasanya diatas 3000
app.listen(port, function (){
    console.log(`Albedo running on port ${port}`)
})


function getFullTime(time){
    let date= time.getDate()
    let monthIndex = time.getMonth()
    let year= time.getFullYear()
    let hours= time.getHours()
    let minutes= time.getMinutes()
    console.log(time);

    if (minutes <10){
        minutes='0'+minutes
    }

    return `${date} ${month[monthIndex]} ${year} ${hours}:${minutes} WIB`
}