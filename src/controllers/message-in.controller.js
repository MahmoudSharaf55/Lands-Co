const os = require('os');
function closeWindow() {
    remote.getCurrentWindow().close();
}

function sendMessage() {
    try {
        const pc = document.getElementById('computer').value;
        const msg = document.getElementById('msg').value;
        if (pc.length && msg.length) {
            fse.writeJsonSync(appDir + '/message/message.json', {
                computer: pc,
                sender: os.hostname(),
                message: msg,
            });
            closeWindow();
        }
    } catch (e) {
        console.log(e);
        writeLog('error on send message ' + e);
        closeWindow();
    }
}