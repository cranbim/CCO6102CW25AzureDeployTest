const express= require('express')
const app=express()
const path=require('path')

const posts=require('./models/posts.js')
const userModel=require('./models/users.js')

const dotenv=require('dotenv').config()

const port = process.env.PORT || 3000

const secret=process.env.davesecret
console.log(secret)

app.listen(port, ()=>{
    console.log('listening on port', port)
})

app.use(express.static('public'))

app.use(express.urlencoded({extended: false}))

app.get('/app', (request, response)=>{
    response.sendFile(path.join(__dirname, '/views', 'app.html'))
})

app.get('/getposts', (request, response)=>{
    response.json({posts:posts.getPosts()})
})

app.post('/newpost', (request, response)=>{
    posts.addPost(request.body.message, "userX")
    response.sendFile(path.join(__dirname, '/views', 'app.html'))
})

app.get('/login', (request, response)=>{
    response.sendFile(path.join(__dirname, '/views', 'login.html'))
})

app.post('/login', (request, response)=>{
    if(userModel.checkUser(request.body.username, request.body.password)){
        response.sendFile(path.join(__dirname, '/views', 'app.html'))
    } else {
        response.sendFile(path.join(__dirname, '/views', 'notloggedin.html'))
    }
})

app.get('/register', (request, response)=>{
    response.sendFile(path.join(__dirname, '/views', 'register.html'))
})

app.post('/register', (request, response)=>{
    if(userModel.addUser(request.body.username, request.body.password)){
        response.sendFile(path.join(__dirname, '/views', 'login.html'))
    } else {
        response.sendFile(path.join(__dirname, '/views', 'registration_failed.html'))
    }
})

app.get('/logout', (request, response)=>{
    response.sendFile(path.join(__dirname, '/views', 'logout.html'))
})

