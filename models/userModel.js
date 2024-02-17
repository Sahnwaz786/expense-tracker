const mongoose = require("mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/expense")
const plm = require("passport-local-mongoose")

const userSchema = new mongoose.Schema({
    username:{
        type:String,
        require:true,
        unique:true
    },
    password:{
        type:String,
    },
    email:{
        type:String,
        require:true,
        unique:true
    },
    token:{
        type:Number,
        default:-1
    },
    expenses:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"expense"
    }],
    fullname:String
})
userSchema.plugin(plm);
module.exports = mongoose.model("User",userSchema);