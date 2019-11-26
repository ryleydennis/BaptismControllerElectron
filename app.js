var express = require('express');
var app = express();
var bodyParser = require('body-parser')
var path = require('path');
var ATEM = require('applest-atem');
var controller = require('panasonic-camera-controller');

const proP = 9;
const cam = 6;

var atem = new ATEM();
atem.connect('192.168.66.9');

var camera = new controller.Camera('192.168.66.13');

// parse application/json
app.use(bodyParser.json())
app.use(express.static('public'))

// viewed at http://localhost:8080
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/BaptismController.html'));
});

app.post("/AutoTransition0", function(request, response) {
    atem.autoTransition(0);
    response.status(200).end();
});

app.post("/AutoTransition1", function(request, response) {
    atem.autoTransition(1);
    response.status(200).end();
});

app.post("/AutoTransitionBoth", function(request, response) {
    atem.autoTransition(0);
    atem.autoTransition(1);
    response.status(200).end();
});


app.post("/MoveCamera1", function(request, response) {
    camera.moveToPreset(1);
    response.status(200).end();
});

app.post("/MoveCamera3", function(request, response) {
    camera.moveToPreset(3);
    response.status(200).end();
});

app.post("/Reset", function(request, response) {
    camera.moveToPreset(1);

    atem.changeProgramInput(proP,1);
    atem.changePreviewInput(cam,1);
    
    atem.changeProgramInput(cam,0);
    atem.changePreviewInput(proP,0);
    response.status(200).end();
});

app.get("/status", function(request, response) {
    response.status(200).end();
});

app.listen(3000);
