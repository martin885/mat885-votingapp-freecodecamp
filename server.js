const express=require('express');
const morgan =require('morgan');
const mongoose=require('mongoose');
const bodyParser=require('body-parser');
const dotenv=require('dotenv');
const app=express();

var dburl='mongodb://localhost/freecodecampvoting'||process.env.MONGOURI;
const port=Number(process.env.PORT || 8080);

dotenv.config();

mongoose.connect(dburl,function(err){
if(err){
    console.log(err);
}


});

mongoose.connection.on('connected',function(){
    console.log('Connected');
});

mongoose.connection.on('disconnected',function(){
    console.log('Disconnected');
})
mongoose.connection.on('error',function(){
    console.log('An has occurred');
});

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(express.static(__dirname+'./public'));
app.get('*',function(res,res){
    res.sendFile(__dirname+'/public/index.html');
});

app.listen(port,function(){
    console.log('Listening on port: '+port);
})
