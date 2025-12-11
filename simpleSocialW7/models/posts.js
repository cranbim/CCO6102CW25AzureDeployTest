// let nextPostID=3

// let postData=[
//     {
//         postid: 0,
//         message:"Hi it's Dave",
//         user:"Dave"
//     },{
//         postid: 1,
//         message:"Glad it's Thursday",
//         user:"Julie"
//     },{
//         postid: 2,
//         message:"I am a post",
//         user:"Noodle"
//     }
// ]

const mongoose=require('mongoose')

const {Schema, model} = mongoose

const postSchema=new Schema({
    user: String,
    message: String,
    likes: Number,
    time: Date
})

const postData=model('postsDave', postSchema)

function getPosts(){
    return postData.slice()
}

async function getLatestNPosts(n=3){
    // return postData.slice(-n).reverse()
    let foundData=[]
    foundData=await postData.find({}).sort({'time':-1}).limit(n).exec()
    return foundData
}

function addPost(message, user){
    let newPost={
        // postid: nextPostID++,
        message: message,
        user: user,
        likes: 0,
        time: Date.now()
    }
    postData.create(newPost)
    .catch(err=>{
        console.log("Error",err)
    })
}

module.exports={
    getPosts,
    addPost,
    getLatestNPosts
}