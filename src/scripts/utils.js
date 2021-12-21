const remote = require("@electron/remote");
const {ipcRenderer} = require('electron');
const fse = require('fs-extra');
const moment = require('moment');
const path = require('path');
const appDir = !remote.app.isPackaged ? path.resolve('./') : path.dirname(process.execPath);
let darkMode = localStorage.getItem('lands_darkMode');
let enableSound = localStorage.getItem('enable_sound') ?? '1';
const darkModeToggle = document.querySelector('#dark-mode-toggle');
const enableDarkMode = () => {
    const btn = document.getElementById('dark-mode-btn-img');
    btn && (btn.src = '../assets/sun.png');
    document.body.classList.add('dark-mode');
    localStorage.setItem('lands_darkMode', 'enabled');
};
const disableDarkMode = () => {
    const btn = document.getElementById('dark-mode-btn-img');
    btn && (btn.src = '../assets/moon.png');
    document.body.classList.remove('dark-mode');
    localStorage.setItem('lands_darkMode', null);
};
if (darkMode === 'enabled') {
    enableDarkMode();
    const btn = document.getElementById('dark-mode-btn-img');
    btn && (btn.src = '../assets/sun.png');
} else {
    disableDarkMode();
    const btn = document.getElementById('dark-mode-btn-img');
    btn && (btn.src = '../assets/moon.png');
}
darkModeToggle && darkModeToggle.addEventListener('click', () => {
    darkMode = localStorage.getItem('lands_darkMode');
    if (darkMode !== 'enabled') {
        enableDarkMode();
        document.getElementById('dark-mode-btn-img').src = '../assets/sun.png';
    } else {
        disableDarkMode();
        document.getElementById('dark-mode-btn-img').src = '../assets/moon.png';
    }
});

function setSoundIcon() {
    document.getElementById('sound-icon').src = enableSound === '1' ? '../assets/sound.png' : '../assets/no-sound.png';
}

function toggleSoundIcon() {
    enableSound = enableSound === '1' ? '0' : '1';
    document.getElementById('sound-icon').src = enableSound === '1' ? '../assets/sound.png' : '../assets/no-sound.png';
    localStorage.setItem('enable_sound', enableSound);
}

const SnackbarType = {
    SUCCESS: 'success',
    WRONG: 'wrong',
    SMILE: 'smile',
}

function showSnackbarWithType(msg, sType) {
    const bar = document.getElementById("snackbar");
    bar.classList.contains('show') && (bar.classList.remove('show'));
    switch (sType) {
        case SnackbarType.SUCCESS:
            bar.innerHTML = ` <img src="../assets/correct.png" alt=""> ${msg} `;
            break;
        case SnackbarType.WRONG:
            bar.innerHTML = ` <img src="../assets/wrong.png" alt=""> ${msg} `;
            break;
        default:
            bar.innerHTML = ` ${msg} `;
            break;
    }
    bar.classList.add('show');
    setTimeout(() => bar.classList.remove('show'), 3000);
}

function toggleButtonLoader(button) {
    button.classList.toggle('active');
}

const JsonType = {
    CORONA: 'CORONA',
    WEATHER: 'WEATHER',
    CURRENCY: 'CURRENCY',
    PRAYER: 'PRAYER',
    FOOTBALL: 'FOOTBALL',
    ALL: 'ALL'
}

function getCoronaFromJson() {
    return fse.readJsonSync(appDir + '/data/corona.json');
}

function getWeatherFromJson() {
    return fse.readJsonSync(appDir + '/data/weather.json');
}

function getCurrencyFromJson() {
    return fse.readJsonSync(appDir + '/data/currency.json');
}

function getPrayerFromJson() {
    return fse.readJsonSync(appDir + '/data/prayer.json');
}

function getFootballFromJson() {
    return fse.readJsonSync(appDir + '/data/football.json');
}

function getLastModifiedDateOfData() {
    const coronaStat = fse.statSync(appDir + '/data/corona.json');
    const weatherStat = fse.statSync(appDir + '/data/weather.json');
    const currencyStat = fse.statSync(appDir + '/data/currency.json');
    const prayerStat = fse.statSync(appDir + '/data/prayer.json');
    const footballStat = fse.statSync(appDir + '/data/football.json');
    let max = coronaStat.mtimeMs;
    let maxModifiedDate = coronaStat.mtime;
    for (const date of [weatherStat, currencyStat, prayerStat, footballStat]) {
        if (date.mtimeMs > max) {
            max = date.mtimeMs;
            maxModifiedDate = date.mtime;
        }
    }
    return moment(maxModifiedDate);
}

function writeLog(text) {
    try {
        fse.outputFileSync(appDir + '/log.txt', `-------------- ${moment().format('DD/MM/YYYY hh:mm A')} --------------\r\n${text}\r\n`, {
            flag: 'a'
        });
    } catch (e) {
        console.log(e);
    }
}

function dataExists() {
    return fse.pathExistsSync(appDir + '/data');
}

ipcRenderer.on('checkLastUpdate', () => {
    try {
        let lastUpdateDate = localStorage.getItem('last-update');
        let dataUpdateDate = getLastModifiedDateOfData();
        if (lastUpdateDate == null || +lastUpdateDate < dataUpdateDate.valueOf()) {
            ipcRenderer.send('re-render-main');
            localStorage.setItem('last-update', moment().valueOf().toString());
        }
        const data = fse.readJsonSync(appDir + '/config/config.json');
        if (+data.closeApp === 1)
            ipcRenderer.send('close-app');
        if (+data.testAzan === 1)
            ipcRenderer.send('open-notify-window', {notifyType: 'azan'});
    } catch (e) {
        writeLog('check update error ' + e);
    }
});