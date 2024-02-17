const mongoose = require("mongoose");


const expenseSchema = new mongoose.Schema({
    amount:{
        type:Number,
        require:true,
    },
    name:{
        type:String,
        require:true
    },
    remark:{
        type:String,
    },
    category:{
        type:String,
        // enum:["food","groceries","travel","shopping","medical","education"],
        require:true,
    },
    users:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }],
    paymentmode:{
        type:String,
        enum:["cash","online","check"]
    },
   
},
{ timestamps: true }
)

module.exports = mongoose.model("expense",expenseSchema);