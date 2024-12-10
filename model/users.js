const mongoose=require('mongoose')
const Schema=mongoose.Schema

const userSchema=new Schema({
    firstname:{
        type:String,
        required:true
    },
    lastname:{
        type:String,
        required:true
    },password:{
        type:String,
        required:true
    },email:{
        type:String,
        required:true
    },items:{
        type:[String],
        required:false
    }
},
)
module.exports=mongoose.model('users',userSchema)