const {Rive} = require('rive-js');
const {exec} = require("child_process");
const $ = require('jquery');
const ioClient = require("socket.io-client");

function closeNotifyWindow() {
    remote.getCurrentWindow().close();
}

ipcRenderer.on('notify-args', (event, args) => {
    try {
        switch (args.notifyType) {
            case "azan":
                document.getElementById('notify-bg').classList.add('islamic-bg');
                document.getElementById('notify-body').innerHTML = '<div class="d-flex flex-grow-1 justify-content-center align-items-center h-100"><canvas id="text-riv"></canvas></div>';
                runRive('../assets/azan.riv', '4s');
                enableSound === '1' && playSound('/sounds/azan.mp3', true);
                break;
            case "message":
                document.getElementById('notify-body').innerHTML = `<div class="p-1 pt-2 d-flex flex-column h-100">
                                                                                <h6 class="dm-h fs-14 text-center clr-secondary">${args.withReply ? 'رسالة جديدة من' : 'رد من'} ${args.senderName}</h6>
                                                                                <hr class="hr-awesome">
                                                                                <h6 class="message-content dm-h fs-14 text-center flex-grow-1">${args.message}</h6>
                                                                                <hr class="hr-awesome">
                                                                                ${args.withReply ? '<input id="reply-msg" class="form-control dm-input direction-rtl px-2 py-1" type="text" placeholder="إرسال رد"><hr class="hr-awesome">' : ''}
                                                                                <div class="row">
                                                                                    <h6 class="col dm-h fs-12 text-right direction-ltr clr-secondary">${args.date}</h6>
                                                                                    <h6 class="col dm-h fs-12 clr-secondary">${args.senderPc}</h6>
                                                                                </div>
                                                                            </div>`;
                $("#reply-msg").keyup(function (event) {
                    if (event.keyCode === 13) {
                        const replyInput = document.getElementById('reply-msg');
                        if (replyInput && replyInput.value.trim()) {
                            try {
                                const socket = ioClient(`http://${args.senderPc}:5001`);
                                socket.emit("message", {
                                    senderName: args.receiverName,
                                    senderPc: args.receiverPc,
                                    receiverName: args.senderName,
                                    receiverPc: args.senderPc,
                                    date: moment().format('DD-MM-YYYY hh:mm A'),
                                    message: replyInput.value,
                                    withReply: false,
                                });
                                socket.on("received", data => {
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
                enableSound === '1' && playSound(args.withReply ? '/sounds/notification.mp3' : '/sounds/reply.mp3', false);
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

function playSound(src, closeAfter) {
    try {
        const exePath = appDir + '/exec/cmdmp3win.exe';
        const soundPath = appDir + src;
        exec(`${exePath} "${soundPath}"`, (error, stdout, stderr) => {
            closeAfter && closeNotifyWindow();
        });
    } catch (e){
        closeAfter && closeNotifyWindow();
    }
}