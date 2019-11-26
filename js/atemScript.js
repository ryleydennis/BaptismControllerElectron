var options = [document.getElementById("option1"),
document.getElementById("option2"),
document.getElementById("option3"),
document.getElementById("option4")];
var statusIcon = document.getElementById("connectionStatus");

var ATEM = require('applest-atem');
var controller = require('panasonic-camera-controller');

const proP = 9;
const cam = 6;

var atem = new ATEM();
atem.connect('192.168.66.9');

var camera = new controller.Camera('192.168.66.13');

var connected = false;
var suspended = false;
var currentStep = 0;

checkConnection();
setInterval(checkConnection, 1000);
colorOptions(currentStep, false)

async function optionClicked(choice) {
 
    if (suspended == false) {
        switch (choice) {
            case 1:
                if (stepOneIsReady && currentStep == 0) {
                    beginNewStep();
    
                    atem.autoTransition(0);
    
                    await wait(1000);
                    camera.moveToPreset(3);
    
                    await wait(2300);
                    endStep();
                } 
                break;
            case 2:
                if (currentStep == 1) {
                    beginNewStep();
    
                    atem.autoTransition(0);
                    atem.autoTransition(1);
    
                    await wait (1000);
                    endStep();
                }
                break;
            case 3:
                if (currentStep == 2) {
                    beginNewStep();
    
                    atem.autoTransition(0);
                    atem.autoTransition(1);
    
                    await wait (1000);
                    endStep();
                }
                break;
            case 4:
                if (currentStep == 3) {
                    beginNewStep();
                    camera.moveToPreset(1);
    
                    await wait(2300);
                    atem.autoTransition(0);
    
                    await wait(1000)
                    beginNewStep();
                }
                break;
            case 5:
                currentStep = 0
                suspended = true
                colorOptions(currentStep, true)
                camera.moveToPreset(1);
    
                atem.changeProgramInput(proP,1);
                atem.changePreviewInput(cam,1);
        
                atem.changeProgramInput(cam,0);
                atem.changePreviewInput(proP,0);
    
                await wait(2300)
                endStep();
                break;
        }
    }
}

function beginNewStep() {
    if (currentStep <= 3) {
        currentStep += 1
        suspended = true
        
    } else {
        currentStep = 0
        suspended = false
    }
    console.log("suspended: " + suspended)
    colorOptions(currentStep, suspended)
}

function endStep() {
    suspended = false
    console.log("suspended: " + suspended)
    colorOptions(currentStep, suspended)
}

function colorOptions(step, suspended) {
    for (i = 1; i <= options.length; i++) {
        //Select dark (enabled) or light (disabled) image
        //If App is suspended all options are disabled
        if (suspended) {
            var loc = getImageLocation(false, i);
            options[i - 1].src = loc;
        } else {
            var enabled = i == getNextStep(step);
            var loc = getImageLocation(enabled, i);
            options[i - 1].src = loc;
        }

        //Draw border around last successfully selected step
        if (step == i) {
            options[i - 1].className = "optionSelected"
        } else {
            options[i - 1].className = "option"
        }
    };
}

function getNextStep(step) {
    if (step <= 3) {
        return step + 1;
    } else {
        return 0;
    }
}

function getImageLocation(isEnabled, val) {
    var prefix = "images/step ";
    var enabled = " enabled.svg";
    var disabled = " disabled.svg";

    if (isEnabled) {
        return prefix + val.toString() + enabled;
    } else {
        return prefix + val.toString() + disabled;
    }
}

var wait = ms => new Promise((r, j) => setTimeout(r, ms))

function confirmReset() {
    var response = confirm("Are you sure you want to reset?");
    if (response == true) {
        optionClicked(5)
    }
}

function stepOneIsReady() {
    return true;
    // if (checkProgramStatus(proP, 0) 
    //     && checkPreviewStatus(cam, 0)
    //     && checkProgramStatus(cam, 1)
    //     && checkPreviewStatus(proP,1)) {
    //     return true;
    // } else {
    //     return false;
    // }
}

function checkProgramStatus(source, me) {
    if (connected 
        && atem.state.topology.numberOfMEs > me 
        && atem.state.topology.numberOfSources > source
        && atem.video.ME[me].programInput == source) {
            return true
    } else { 
        return false
    }
}

function checkPreviewStatus(source, me) {
    if (connected
        && atem.state.topology.numberOfMEs > me 
        && atem.state.topology.numberOfSources > source
        && atem.video.ME[me].previewInput == source) {
            return true
    } else { 
        return false
    }
}

function reconnect() {
    var atem = new ATEM();
    atem.connect('192.168.66.9');
    
    var camera = new controller.Camera('192.168.66.13');
}

function checkConnection() {
    if (typeof atem.connectionState.Established !== 'undefined' &&
        atem.connectionState == ATEM.connectionState.Established) {
        connected = true
        statusIcon.src = "images/status green.svg"
    } else {
        connected = false
        statusIcon.src = "images/status red.svg"
    }

    // atem.on('ping', (err, state) => {
        
    // });

    // try {
    //     var response = await getData(urlprefix + 'status');
    //     if (response.status == 200) {
    //         statusIcon.src = "/images/status green.svg"
    //     } else {
    //         statusIcon.src = redStatusImage
    //     }
    // } catch (error) {
    //     statusIcon.src = redStatusImage
    // }
}

