const {Rive} = require('rive-js');
const {exec} = require("child_process");
const $ = require('jquery');
const ioClient = require("socket.io-client");

function closeNotifyWindow() {
    remote.getCurrentWindow().close();
}

let receiverName = '';
let receiverPc = '';
ipcRenderer.on('notify-args', (event, args) => {
    try {
        switch (args.notifyType) {
            case "azan":
                runRive('../assets/azan.riv', '4s');
                enableSound === '1' && playSound('/sounds/azan.mp3');
                break;
            case "message":
                receiverName = args.receiverName;
                receiverPc = args.receiverPc;
                document.getElementById('notify-bg').classList.add('notify-bg-dm');
                document.getElementById('notify-body').innerHTML = `<div class="p-1 pt-2 d-flex flex-column h-100">
                                                                                <h6 class="dm-h fs-15 text-center">رسالة جديدة من ${args.senderName}</h6>
                                                                                <hr class="hr-awesome">
                                                                                <h6 class="message-content dm-h fs-14 text-center flex-grow-1">${args.message}</h6>
                                                                                <hr class="hr-awesome">
                                                                                ${args.withReply ? '<input id="reply-msg" class="form-control dm-input direction-rtl px-2 py-1" type="text" placeholder="إرسال رد"><hr class="hr-awesome">' : ''}
                                                                                <div class="row">
                                                                                    <h6 class="col dm-h fs-14 text-right direction-ltr">${args.date}</h6>
                                                                                    <h6 class="col dm-h fs-14">${args.senderPc}</h6>
                                                                                </div>
                                                                            </div>`;
                $("#reply-msg").keyup(function (event) {
                    if (event.keyCode === 13) {
                        const replyInput = document.getElementById('reply-msg');
                        if (replyInput && replyInput.value.trim()) {
                            try {
                                const socket = ioClient(`http://${receiverPc}:30000`);
                                socket.emit("message", {
                                    senderName: receiverName,
                                    senderPc: receiverPc,
                                    date: moment().format('DD-MM-YYYY hh:mm A'),
                                    message: replyInput.value,
                                    withReply: false,
                                });
                                socket.on("received", data => {
                                    console.log("received");
                                    socket.disconnect();
                                    closeNotifyWindow();
                                });
                            } catch (e) {
                                console.log(e);
                                writeLog('error on reply message ' + e);
                            }
                        }
                    }
                });
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