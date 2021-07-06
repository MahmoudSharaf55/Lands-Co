const fs = require('fs');
let darkMode = localStorage.getItem('lands_darkMode');
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
    const rawData = fs.readFileSync('data/corona.json', 'utf8');
    return JSON.parse(rawData);
}

function getWeatherFromJson() {
    const rawData = fs.readFileSync('data/weather.json', 'utf8');
    return JSON.parse(rawData);
}

function getCurrencyFromJson() {
    const rawData = fs.readFileSync('data/currency.json', 'utf8');
    return JSON.parse(rawData);
}

function getPrayerFromJson() {
    const rawData = fs.readFileSync('data/prayer.json', 'utf8');
    return JSON.parse(rawData);
}

function getFootballFromJson() {
    const rawData = fs.readFileSync('data/football.json', 'utf8');
    return JSON.parse(rawData);
}

function writeLog(text) {
    try {
        fs.appendFileSync('log.txt', `-------------- ${moment().format('DD/MM/YYYY HH:mm A')} --------------\r\n${text}\r\n`);
    } catch (e) {
        console.log(e);
    }
}