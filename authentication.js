const express = require("express");
const fs = require("fs");
const jwt = require('jsonwebtoken');

require("dotenv").config();

const PORT = 8081;

let app = express();
app.use(express.static(__dirname + '/public'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


app.post("/login",(req,res) =>{
    let name = req.body.name;
    let password = req.body.password;
    if(name == "1234" && password == "1234"){
        const token = jwt.sign({name, password}, process.env.APP_TOKEN);
        return res.json({auth: true, token: token});
    }
    res.status(500).json({message: "Invalid Login"});
});

app.listen(PORT, console.log(`AuthServer running at port ${PORT} ...`));