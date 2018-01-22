const mongoose=require('mongoose');
const Schema=mongoose.Schema;

const PollsSchema=new Schema({
name:{
    type:String,
    required:true
},
options:[{
    name:{



        





        type:String,
        required:true 
    },
    votes:{
        type:Number,
        default:0
    }
}
],
createdAt:{
    type:Date,
    default:Date.now()
},
owner:{
    type:String,
    required:true
}
});

const Polls=mongoose.model('Poll',PollsSchema);
module.exports=Polls;