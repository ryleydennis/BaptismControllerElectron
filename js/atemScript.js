var options = [document.getElementById("option1"),
document.getElementById("option2"),
document.getElementById("option3"),
document.getElementById("option4")];
var statusIcon = document.getElementById("connectionStatus");

const { ipcRenderer } = require('electron')

//connection state & enabledAtStep
var connected = false;
var suspended = false;
var currentStep = 0;
var previousStep = -1;

//enabled choies for each step
let step0 = [1,5]
let step1 = [2,5]
let step2 = [3,5]
let step3 = [2,4,5]
let enabledAtStep = [step0, step1, step2, step3]


checkConnection();
setInterval(checkConnection, 1000);
colorOptions(currentStep, false)

async function optionClicked(choice) {

    if (!suspended && choiceIsAvailable(choice)) {
        beginNewStep(choice);
        switch (choice) {
            //Prepare camera on batism
            case 1:
                autoTransition(0);

                await sleep(1000);
                moveCamToPreset(3);

                await sleep(2300);

                break;
            //Auto transition both inputs to show baptism
            case 2:
                autoTransition(0);
                autoTransition(1);

                await sleep(1000);
                break;
            //Auto transition both inputs to hide baptism
            case 3:
                autoTransition(0);
                autoTransition(1);

                await sleep(1000);
                break;
            //Move camera away from baptism and show slides on main
            case 4:
                //step 4 resets the options, going back to 0
                moveCamToPreset(1);

                await sleep(2300);
                autoTransition(0);

                await sleep(1000);

                reset();

                await sleep(2300);
                break;

            case 5:
                currentStep = 0;
                reset();
    
                await sleep(2300);
                break;

        }
        endStep();
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

function choiceIsAvailable(choice) {
    return enabledAtStep[currentStep].includes(choice)
}

function beginNewStep(choice) {
    if (choice >= 4) {
        currentStep = 0
    } else {
        currentStep = choice
    }
    suspended = true
    console.log("suspended: " + suspended)
    colorOptions(currentStep, suspended)
}

function endStep() {
    suspended = false
    console.log("suspended: " + suspended)
    colorOptions(currentStep, suspended)
}

function colorOptions(selectedStep, suspended) {
    let enabledSteps = enabledAtStep[selectedStep]
    for (i = 1; i <= options.length; i++) {
        //Select dark (enabled) or light (disabled) image
        //If App is suspended all options are disabled
        if (suspended || !enabledSteps.includes(i)) {
            var loc = getImageLocation(false, i);
            options[i - 1].src = loc;
        } else {
            var enabled = true
            var loc = getImageLocation(enabled, i);
            options[i - 1].src = loc;
        }

        //Draw border around last successfully selected step
        if (selectedStep == i) {
            options[i - 1].className = "optionSelected"
        } else {
            options[i - 1].className = "option"
        }
    };
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

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

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
    return true
    // connected = ipcRenderer.sendSync('checkConnection');
    // statusIcon.src = connected ? "images/status green.svg" : "images/status red.svg";
    // return connected;
}

