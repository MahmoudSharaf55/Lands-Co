const {ipcRenderer} = require('electron');
const {Rive} = require('rive-js');

function closeNotifyWindow() {
    ipcRenderer.send('close-notify-window');
}

ipcRenderer.on('notify-type', (event, args) => {
    console.log(args);
    try {
        switch (args.notifyType) {
            case "azkar":
                runRive('../assets/azkar.riv', '3s');
                playSound('../assets/sounds/azkar.mp3');
                break;
            case "azan":
                runRive('../assets/azan.riv', '4s');
                playSound('../assets/sounds/azan.mp3');
                break;
        }
    }catch (e) {
        writeLog(e);
    }
});

function runRive(src, animation) {
    new Rive({
        src: src,
        canvas: document.getElementById('text-riv'),
        autoplay: true,
        animations: animation,
    });
}

function playSound(src) {
    const player = document.getElementById("player");
    player.src = src;
    player.volume = 1;
    player.play();
}