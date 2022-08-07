const mongoose = require("mongoose");

//Connecting mogo database

mongoose.connect("mongodb://localhost:27017/dpHandMade",{
    useNewUrlParser:true,
    useUnifiedTopology:true
}).then(()=>{
    console.log("connection Successful");
}).catch((e)=>{
    console.log(e);
})
