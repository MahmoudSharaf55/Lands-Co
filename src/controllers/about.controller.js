const {ipcRenderer} = require('electron');

function closeAboutWindow() {
    ipcRenderer.send('close-about-window');
}