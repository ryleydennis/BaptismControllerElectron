const { app, BrowserWindow, screen, ipcMain} = require('electron')
var ATEM = require('applest-atem');
var controller = require('panasonic-camera-controller');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

const proP = 9;
const cam = 6;

var atem = new ATEM();
atem.connect('192.168.66.9');
var camera = new controller.Camera('192.168.66.13');

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({
    width: 830,
    height: 815,
    webPreferences: {
      nodeIntegration: true
    }
  })

  // const { width, height } = screen.getPrimaryDisplay().workAreaSize
  // win = new BrowserWindow({
  // width: width,
  // height: height,
  // webPreferences: {
  //   nodeIntegration: true
  // }
  // })


  // and load the index.html of the app.
  win.loadFile('BaptismController.html')

  // Open the DevTools.
  // win.webContents.openDevTools()

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
ipcMain.on('autoTransition', (event, arg) => {
  console.log("TRANSITION" + arg)
  atem.autoTransition(arg);
})

ipcMain.on('reconnect', (event, arg) => {
  atem = new ATEM();
  atem.connect('192.168.66.9');
  camera = new controller.Camera('192.168.66.13');
})

ipcMain.on('checkConnection', (event, arg) => {
  if (atem.connectionState == 2) {
    event.returnValue = true
  } else {
    event.returnValue = false
  }
})


ipcMain.on('stepOneIsReady', (event, arg) => {
  // if (checkProgramStatus(proP, 0) 
  //     && checkPreviewStatus(cam, 0)
  //     && checkProgramStatus(cam, 1)
  //     && checkPreviewStatus(proP,1)) {
  //     event.returnValue = true;
  // } else {
  //     event.returnValue = false;
  // }
  return true;
})

ipcMain.on('moveCamToPreset', (event, arg) => {
  camera.moveToPreset(arg)
})

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

ipcMain.on('reset', (event, arg) => {
  camera.moveToPreset(1);

  atem.changeProgramInput(cam,0);
  atem.changePreviewInput(proP,0);
    
  atem.changeProgramInput(proP,1);
  atem.changePreviewInput(cam,1);
})