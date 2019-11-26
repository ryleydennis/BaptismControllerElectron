var options = [document.getElementById("option1"),
document.getElementById("option2"),
document.getElementById("option3"),
document.getElementById("option4")];
var statusIcon = document.getElementById("connectionStatus");

const { ipcRenderer } = require('electron')

var connected = false;
var suspended = false;
var currentStep = 0;

checkConnection();
setInterval(checkConnection, 1000);
colorOptions(currentStep, false)

async function optionClicked(choice) {
 
    if (suspended == false && connected == true) {
        switch (choice) {
            case 1:
                if (stepOneIsReady && currentStep == 0) {
                    beginNewStep();
    
                    autoTransition(0);
    
                    await wait(1000);
                    moveCamToPreset(3);
    
                    await wait(2300);
                    endStep();
                } 
                break;
            case 2:
                if (currentStep == 1) {
                    beginNewStep();
    
                    autoTransition(0);
                    autoTransition(1);
    
                    await wait (1000);
                    endStep();
                }
                break;
            case 3:
                if (currentStep == 2) {
                    beginNewStep();
    
                    autoTransition(0);
                    autoTransition(1);
    
                    await wait (1000);
                    endStep();
                }
                break;
            case 4:
                if (currentStep == 3) {
                    beginNewStep();
                    moveCamToPreset(1);
    
                    await wait(2300);
                    autoTransition(0);
    
                    await wait(1000)
                    beginNewStep();
                }
                break;
            case 5:
                currentStep = 0
                suspended = true
                colorOptions(currentStep, true)
                reset()
    
                await wait(2300)
                endStep();
                break;
        }
    }
}

function autoTransition(me) {
    ipcRenderer.send('autoTransition', me)
}

function moveCamToPreset(cam) {
    ipcRenderer.send('moveCamToPreset', cam)
}

function reset() {
    ipcRenderer.send('reset')
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
        optionClicked(5);
    }
}

function stepOneIsReady() {
    var r = ipcRenderer.sendSync('stepOneIsReady');
    return r;
}

function reconnect() {
    ipcRenderer.send('reconnect');
}

function checkConnection() {
    connected = ipcRenderer.sendSync('checkConnection');
    statusIcon.src = connected ? "images/status green.svg" : "images/status red.svg";
    return connected;
}

