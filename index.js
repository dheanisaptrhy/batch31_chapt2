//panggil package express
const { response } = require('express')
const express = require('express')
// import  express  from 'express' (samimawon)
const db = require('./connection/db.js')
// import db from '.connection/db.js'
const flash = require('express-flash')
const session = require('express-session')
const bcrypt = require('bcrypt')
//import package bcrypt
// const client = require('pg/lib/native/client')
// const { MemoryStore } = require('express-session')
const app = express()
app.use(flash())
// setup session middleware
app.use(
    session({
        cookie:{
            maxAge: 1000*60*60*2, 
            //durasi 2 jam => mili, detik, menit, jam
            secure: false,
            httpOnly: true
        },
        store: new session.MemoryStore(),
        saveUninitialized: true,
        resave: false,
        secret: "secretValue"
    })
)
// const isLogin = true
// app.get
// konfigurasi port aplikasi
const port = 4000 
//ibarat jalanan yg dilalui nodejs, nilainya biasanya diatas 3000
app.listen(port, function (){
    console.log(`Albedo running on port ${port}`)
})

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
    let query = 'select * from tb_blog order by id desc'
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
                    isLogin:req.session.isLogin,
                    posted_at: getFullTime(blog.posted_at),
                    post_age: getDistanceDay(blog.posted_at),
                    user : req.session.user
                }
            })
            res.render('blog', {isLogin:isLogin, 
                                blogs:data, 
                                post_age:data})
        })  
    })

})

app.get('/add-blog', function(req, res){
    res.render('form-blog')
    
})

//kapan params: mengacu pada parameter yg dikirimkan 
// kapan body: ketika data dihandle, tanpa melalui parameter
// ada session

app.post('/blog', function(req,res){
    let {title, content} = req.body
    // app.
    let blog = {
        title,
        content,
        image : 'image.png'
    }

    db.connect((err, client, done)=>{
        if (err) throw err
        let query = `insert into tb_blog(title, content, image) values ($1, $2, $3)`
        let query_value = [blog.title, blog.content, blog.image]
        client.query(query, query_value, (err, result)=>{
            done()
            if(err) throw err
            res.redirect('/blog')
        })
    })
    res.redirect('/blog')
})

app.get('/blog/:id', function(req, res){
    let{id} = req.params

    db.connect((err, client, done)=>{
        if (err) throw err

        let query = `select * from tb_blog where id=$1`
        query_value = [id]
        client.query(query, query_value, (err, result)=>{
            done()
            if(err) throw err
            let data = result.rows[0]
            console.log(result)

            res.render('blog-detail', {blog : data})
        })
    })
})

app.get('/contact-me', function(req, res){
    res.render('contact')
    
})

app.get('/delete-post/:id', function(req, res){
    let {id} = req.params
    let query = `delete from tb_blog where id=$1`
    let query_value = [id]
    db.connect((err, client, done)=>{
        if(err) throw err
        client.query(query, query_value, (err, result)=>{
            done()
            res.redirect('/blog')
        })
    })
})

app.get('/update-post/:id', (req,res)=>{
    let{id} = req.params

    db.connect((err, client, done)=>{
        if(err) throw err

        let query = `select * from tb_blog where id=$1`
        query_value = [id]
        client.query(query, query_value, (err, result)=>{
            done()
            if(err) throw err
            let data = result.rows[0]

            res.render('update-blog', {blog : data})
        })
    })
})

app.post('/update-post/:id', (req,res)=>{
    let {id} = req.params
    let {title, content} = req.body
    let query = `update tb_blog set title='${title}', content='${content}' where id=${id}`
    // let query_value = [title, content, id]
    db.connect((err, client, done)=>{
        if(err) throw err

        client.query(query, (err, result)=>{
            done()
            if(err) throw err
            res.redirect('/blog')
        })
    })
})

app.get('/register', (req, res)=>{
    res.render('register')
})
app.post('/register', (req, res)=>{
    let {name, email, password} = req.body
    //salt : terkait kebutuhan algoritma, pengulangan ganti2 algoritma?
    let hashPassword = bcrypt.hashSync(password, 10)
    let data = {
        name, email, password, hashPassword
    }
    db.connect((err, client, done)=>{
        if(err) throw err
        let query = `insert into tb_user(name, email, password) values('${name}', '${email}', '${hashPassword}')`
        client.query(query, (err, result)=>{
            done()
            if(err) throw err
            req.flash('success', 'Account successfully registered')
            res.redirect('/login')
        })
    })
})

app.get('/login', (req, res)=>{
    res.render('login')
})
app.post('/login', (req, res)=>{
    let{email, password} = req.body

    db.connect((err, client, done)=>{
        if(err) throw err
        let query= `select * from tb_user where email='${email}'`
        client.query(query, (err, result)=>{
            done()
            if(err) throw err
            if(result.rowCount==0){
                req.flash('danger','Email and Password doesnt match')
                return res.redirect('/login')
            } 
            let isMatch = bcrypt.compareSync(password, result.rows[0].password)
            //sifatnya boolean
            if(isMatch){
                req.session.isLogin = true
                req.session.user ={
                    id: result.rows[0].id,
                    email: result.rows[0].email,
                    name: result.rows[0].name

                }
                req.flash('success','Login Success')
                res.redirect('/blog')
            } else{
                req.flash('danger','Email and Password doesnt match')
                res.redirect('/login')
            }
        })
    })
})

app.get('/logout', (req, res)=>{
    req.session.destroy()
    res.redirect('/home')
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

function getDistanceDay(start){
    const countStart = new Date(start)
    const countEnd = new Date()

    const miliseconds = 1000
    const secondsInMinute = 60
    const minuteInHours =  60
    const secondsInHour = secondsInMinute * minuteInHours
    const hoursInDay = 23

    const distance = countEnd - countStart
    const dayDistance = distance / (miliseconds*secondsInHour*hoursInDay)
    // const monthDistance = dayDistance / MonthInDay

    if (dayDistance>=1){
        return `${Math.floor(dayDistance)} hari`
    } else{
        return ""
    }
}