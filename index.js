const express= require('express')
const app=express()
const path=require('path')

const posts=require('./models/posts.js')
const userModel=require('./models/users.js')

const sessions=require('express-session')
const cookieParser=require('cookie-parser')

const threeMinutes= 3*60*1000
const oneHour = 1*60*60*1000

const dotenv=require('dotenv').config()
const daveSecret=process.env.daveSecret
console.log("Secret: ", daveSecret)
const mongoDBUsername=process.env.mongoDBUsername
const mongoDBPassword=process.env.mongoDBPassword
const mongoAppName=process.env.mongoAppName
// console.log(mongoDBUsername, mongoDBPassword, mongoAppName)
const connectionString=`mongodb+srv://${mongoDBUsername}:${mongoDBPassword}@cluster0.lpfnqqx.mongodb.net/${mongoAppName}?retryWrites=true&w=majority`

const mongoose=require('mongoose')
mongoose.connect(connectionString)

app.use(sessions({
    secret:"my own secret phrase",
    cookie: {maxAge: threeMinutes},
    resave: false,
    saveUninitialized: false
}))

app.set('view engine','ejs')


app.listen(3000, ()=>{
    console.log('listening on port 3000')
})

app.use(express.static('public'))

app.use(express.urlencoded({extended: false}))


function checkLoggedIn(request, response, nextAction){
    if(request.session){
        if(request.session.username){
            nextAction()
        } else {
            request.session.destroy()
            response.sendFile(path.join(__dirname, '/views', 'notloggedin.html'))
        }
    } else {
        request.session.destroy()
        response.sendFile(path.join(__dirname, '/views', 'notloggedin.html'))
    }
}

function checkLoggedInState(request){
    return request.session && request.session.username
}

app.get('/app', checkLoggedIn, async (request, response)=>{
    // response.sendFile(path.join(__dirname, '/views', 'app.html'))
    response.render('pages/app',{
        isLoggedIn: checkLoggedInState(request),
        username: request.session.username,
        posts: await posts.getLatestNPosts(3)
    })
})

app.get('/profile', checkLoggedIn, (request, response)=>{
    response.sendFile(path.join(__dirname, '/views', 'profile.html'))
})

app.get('/getposts', async (request, response)=>{
    response.json({posts: await posts.getLatestNPosts(3)})
})

app.post('/newpost', async (request,  response)=>{
    posts.addPost(request.body.message, request.session.username)
    // response.sendFile(path.join(__dirname, '/views', 'app.html'))
    response.render('pages/app',{
        isLoggedIn: checkLoggedInState(request),
        username: request.session.username,
        posts: await posts.getLatestNPosts(3)
    })
})

app.get('/login', (request, response)=>{
    // response.sendFile(path.join(__dirname, '/views', 'login.html'))
    response.render('pages/login.ejs',{isLoggedIn: checkLoggedInState(request)})
})

app.post('/login', async (request, response)=>{
    if(await userModel.checkUser(request.body.username, request.body.password)){
        request.session.username=request.body.username
        // response.sendFile(path.join(__dirname, '/views', 'app.html'))
        response.render('pages/app',{
            isLoggedIn: checkLoggedInState(request),
            username: request.session.username,
            posts: await posts.getLatestNPosts(3)
        })
    } else {
        response.sendFile(path.join(__dirname, '/views', 'notloggedin.html'))
    }
})

app.get('/register', (request, response)=>{
    response.sendFile(path.join(__dirname, '/views', 'register.html'))
})

app.post('/register', async (request, response)=>{
    if(await userModel.addUser(request.body.username, request.body.password)){
        response.sendFile(path.join(__dirname, '/views', 'login.html'))
    } else {
        response.sendFile(path.join(__dirname, '/views', 'registration_failed.html'))
    }
})

app.get('/logout', checkLoggedIn, (request, response)=>{
    response.sendFile(path.join(__dirname, '/views', 'logout.html'))
})

app.post('/logout', (request, response)=>{
    request.session.destroy()
    response.redirect('/')
})

