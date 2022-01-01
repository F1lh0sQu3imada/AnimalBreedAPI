const express = require("express");
const fs = require("fs");
require("dotenv").config();
const PORT = process.env.PORT || 8080;

let { incrementCounter } = require("./counter");
let updtDt = require("./updatedata");
let app = express();
app.use(express.static(__dirname + '/public'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

let breeds, animaltypes = null;

while (!breeds || !animaltypes) {
    try {
        breeds = JSON.parse(fs.readFileSync("data/breeds.json", "utf-8"));
        animaltypes = JSON.parse(fs.readFileSync("data/animaltypes.json", "utf-8"));
    } catch (err) {
        updtDt.updateData();
    }
}

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

app.use("/api", (req, res, next) => {
    let api_key = req.headers.api_key || req.headers.API_KEY;
    if(!!api_key && process.env.API_KEY == api_key){
        incrementCounter();
        next();
    }else{
        res.status(403).send("Access Denied - No API_KEY received")
    }
})

app.get("/api/types/:id?", (req, res) => {
    let response = [];
    let begin_date = Date.now();
    animaltypes.collection.forEach(element => {
        if (!req.params.id && !req.body.type) {
            response.push({ "id": element.resource.id, "type": element.resource.slug })
        } else if (!req.params.id ^ !req.body.type) {
            if (!!req.params.id && req.params.id == element.resource.id) {
                response.push({ "id": element.resource.id, "type": element.resource.slug })
            }
            if (!!req.body.type && req.body.type == element.resource.slug) {
                response.push({ "id": element.resource.id, "type": element.resource.slug })
            }
        }
    });
    res.send(prettyJSON(response, Date.now() - begin_date));
});

app.get("/api/breeds/:id?", (req, res) => {
    let response = [];
    let begin_date = Date.now();
    breeds.collection.forEach(element => {
        if (!!req.params.id ^ !!req.body.breed ^ !!req.body.type) { //if only one is not undefined or not null
            if (element.resource.lib == req.body.breed) {
                response.push({ "id": element.resource.id, "breed": element.resource.lib, "type": element.resource.type.slug });
            } else if (element.resource.type.slug == req.body.type) {
                response.push({ "id": element.resource.id, "breed": element.resource.lib, "type": element.resource.type.slug });
            } else if (element.resource.id == req.params.id) {
                response.push({ "id": element.resource.id, "breed": element.resource.lib, "type": element.resource.type.slug });
            }
        } else { //if id is not undefined or null
            response.push({ "id": element.resource.id, "breed": element.resource.lib, "type": element.resource.type.slug });
        }
    });

    res.send(prettyJSON(response, Date.now() - begin_date));
});

function prettyJSON(response, responseTime) {
    return {
        "response": response,
        "res_size": response.length,
        "res_time": responseTime + "ms"
    }
}

updtDt.updateData();
setInterval(updtDt.updateData, 399900099); //runs every 4 ⅗ days 

app.listen(PORT, console.log(`Server running at port ${PORT}...`));