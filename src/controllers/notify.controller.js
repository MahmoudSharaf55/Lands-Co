const {Rive} = require('rive-js');
const {exec} = require("child_process");

function closeNotifyWindow() {
    remote.getCurrentWindow().close();
}

ipcRenderer.on('notify-args', (event, args) => {
    try {
        switch (args.notifyType) {
            case "azan":
                runRive('../assets/azan.riv', '4s');
                enableSound === '1' && playSound('/sounds/azan.mp3');
                break;
            case "message":
                document.getElementById('notify-bg').classList.add('notify-bg-dm');
                document.getElementById('notify-body').innerHTML = `<div class="p-1 pt-2">
                                                                                <h6 class="dm-h fs-15 text-center">رسالة جديدة من ${args.sender}</h6>
                                                                                <hr class="hr-awesome">
                                                                                <h6 class="dm-h fs-14 text-center">${args.msg}</h6>
                                                                            </div>`;
                break;
        }
    } catch (e) {
        writeLog(e);
    }
});

function runRive(src, animation) {
    new Rive({
        src: src,
        canvas: document.getElementById('text-riv'),
        autoplay: true,
        animations: animation,
        onstop: event => {
            enableSound === '0' && closeNotifyWindow();
        }
    });
}

function playSound(src) {
    const exePath = appDir + '/exec/bg-sound.exe';
    const soundPath = appDir + src;
    exec(`${exePath} "${soundPath}"`, (error, stdout, stderr) => {
        closeNotifyWindow();
    });
}