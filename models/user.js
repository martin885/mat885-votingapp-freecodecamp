const mongoose=require('mongoose');
const Schema=mongoose.Schema;

const UserSchema=new Schema({
name:{
    type:String,
    required:true,
    unique:true
},
password:{
    type:String,
    required:true
},

});

const User=mongoose.model('User',UserSchema);



UserSchema.pre('save',function(){
console.log('Estamos por guardar');
})
UserSchema.post('save',function(){
    console.log('Ya guardamos');
    })
module.exports=User;