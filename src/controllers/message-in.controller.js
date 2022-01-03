const os = require('os');
const $ = require('jquery');
const ioClient = require("socket.io-client");
const data = fse.readJsonSync(appDir + '/config/devices.json');

function closeWindow() {
    remote.getCurrentWindow().close();
}

function sendMessage() {
    try {
        const pc = document.getElementById('computer').value.trim();
        const name = document.getElementById('username').value.trim();
        const msg = document.getElementById('msg').value.trim();
        if (pc.length && msg.length && name.length) {
            saveDevice(name, pc);
            const socket = ioClient(`http://${pc}:30000`);
            socket.emit("message", {
                senderName: getNameFromPc(os.hostname()),
                senderPc: os.hostname(),
                receiverName: name,
                receiverPc: pc,
                date: moment().format('DD-MM-YYYY hh:mm A'),
                message: msg,
                withReply: true,
            });
            socket.on("received", data => {
                socket.disconnect();
                closeWindow();
            });
        }
    } catch (e) {
        console.log(e);
        writeLog('error on send message ' + e);
        closeWindow();
    }
}

function getNameFromPc(pc) {
    for (const user of data) {
        if (user.pc == pc)
            return user.name;
    }
    return pc;
}

function saveDevice(name, pc) {
    try {
        let flag = false;
        for (const user of data) {
            if (user.pc == pc) {
                flag = true;
                user.name = name;
                user.pc = pc;
            }
        }
        if (!flag)
            data.push({
                name: name,
                pc: pc
            });
        fse.writeJsonSync(appDir + '/config/devices.json', data);
    } catch (e) {
        writeLog('error on saving device ' + e);
    }
}

setAutoCompleteList();
searchInList('#username', '#username-list', '#computer');
searchInList('#computer', '#computer-list', '#username');

function setAutoCompleteList() {
    for (const user of data) {
        $('#username-list').append(`<span>${user.name}</span>`);
        $('#computer-list').append(`<span>${user.pc}</span>`);
    }
}

function searchInList(inputSelector, listSelector, anotherInput) {
    $(document).on('dblclick', inputSelector, function (event) {
        event.preventDefault();
        var str = $(this).val();
        $(`${listSelector} span`).each(function (k, obj) {
            if ($(this).html().toLowerCase().indexOf(str.toLowerCase()) < 0) {
                $(this).hide();
            }
        })
        $(listSelector).toggle(100);
        $(this).focus();
    })

    $(document).on('blur', inputSelector, function (event) {
        event.preventDefault();
        setTimeout(function () {
            $(listSelector).hide(100);
        }, 100);
    })

    $(document).on('click', `${listSelector} span`, function (event) {
        event.preventDefault();
        const item = $(this).html();
        $(inputSelector).val(item);
        anotherInput && $(anotherInput).val(getPcOrName(item));
        $(listSelector).hide(100);
    })

    $(document).on('keyup', inputSelector, function (event) {
        event.preventDefault();
        if (event.which === 27) { // esc
            $(listSelector).hide(200);
            $(this).focus();
        } else if (event.which === 13) { // enter
            if ($(`${listSelector} span:visible`).length === 1) {
                const str = $(`${listSelector} span:visible`).html();
                $(inputSelector).val(str);
                $(listSelector).hide(100);
            }
        } else if (event.which === 9) { // tab
            $(listSelector).hide();
        } else {
            $(listSelector).show(100);
            const str = $(this).val();
            $(`${listSelector} span`).each(function () {
                if ($(this).html().toLowerCase().indexOf(str.toLowerCase()) < 0) {
                    $(this).hide(200);
                } else {
                    $(this).show(200);
                }
            })
        }
    })
}

function getPcOrName(name) {
    for (const user of data) {
        if (user.name == name)
            return user.pc;
        else if (user.pc == name) {
            return user.name;
        }
    }
    return '';
}