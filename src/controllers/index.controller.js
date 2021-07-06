const {ipcRenderer} = require('electron');
const {Rive} = require('rive-js');
const $ = require('jquery');
const moment = require('moment');
const schedule = require('node-schedule');
const rive = new Rive({
    src: '../assets/mosque.riv',
    canvas: document.getElementById('mosque-riv'),
    autoplay: true,
    animations: 'anime',
    onstop: event => {
        rive.play('anime', true);
    },
});
const rive1 = new Rive({
    src: '../assets/ball.riv',
    canvas: document.getElementById('football-riv'),
    autoplay: true,
    animations: 'anime',
    onstop: event => {
        rive1.play('anime', true);
    },
});

(() => {
    renderCorona();
    renderWeather();
    renderCurrency();
    renderPrayer();
    renderFootball();
})();

function minimizeWindowToTray() {
    ipcRenderer.send('hide-to-tray');
}

function minimizeWindow() {
    ipcRenderer.send('minimize-main-window');
}

function openAboutWindow() {
    ipcRenderer.send('open-about-window');
}

function openNotifyWindow() {
    ipcRenderer.send('open-notify-window', {notifyType: 'azan'});
}

function renderCorona() {
    try {
        const data = getCoronaFromJson();
        $('#todayCases').text(data.egypt.todayCases);
        $('#todayDeath').text(data.egypt.todayDeaths);
        $('#todayRecovered').text(data.egypt.todayRecovered);
        $('#allCases').text(data.egypt.cases);
        $('#allDeaths').text(data.egypt.deaths);
        $('#allRecovered').text(data.egypt.recovered);
    } catch (e) {
        writeLog(e);
        showSnackbarWithType('خطأ فى كتابة بيانات الكورونا', SnackbarType.WRONG);
    }
}

function renderWeather() {
    try {
        const data = getWeatherFromJson();
        $('#today-temp').html(`<sub> ${~~data[0].temp.min}° / </sub> ${~~data[0].temp.max}°`);
        $('#today-description').text(data[0].weather[0].description);
        const sunriseTime = moment.utc(data[0].sunrise * 1000).add({"h": 2}).format('hh:mm A');
        const sunsetTime = moment.utc(data[0].sunset * 1000).add({"h": 2}).format('hh:mm A');
        $('#today-sunrise').text(sunriseTime);
        $('#today-sunset').text(sunsetTime);
        $('#today-weather-icon').attr('src', `../assets/weather/${data[0].weather[0].icon}.png`);
    } catch (e) {
        writeLog(e);
        showSnackbarWithType('خطأ فى كتابة بيانات الطقس', SnackbarType.WRONG);
    }
}

function renderCurrency() {
    try {
        const currencyWidget = (name, value) => {
            return `<div class="box-awesome text-right m-0 mt-1 px-1">
                        <h6 class="dm-h fs-13 my-1">${name} = ${value} جنيه</h6>
                    </div>`;
        }
        const data = getCurrencyFromJson();
        $('#currency-content').html(currencyWidget(data.usd.name, data.usd.value))
            .append(currencyWidget(data.gbp.name, data.gbp.value))
            .append(currencyWidget(data.eur.name, data.eur.value))
            .append(currencyWidget(data.sar.name, data.sar.value))
            .append(currencyWidget(data.aed.name, data.aed.value))
            .append(currencyWidget(data.kwd.name, data.kwd.value));
    } catch (e) {
        writeLog(e);
        showSnackbarWithType('خطأ فى كتابة بيانات العملات', SnackbarType.WRONG);
    }
}

function renderPrayer() {
    try {
        const data = getPrayerFromJson();
        const fajrTime = moment(data.times.Fajr, 'HH:mm');
        createScheduleJob(fajrTime.hours(),fajrTime.minutes());
        const dhuhrTime = moment(data.times.Dhuhr, 'HH:mm');
        createScheduleJob(dhuhrTime.hours(),dhuhrTime.minutes());
        const asrTime = moment(data.times.Asr, 'HH:mm');
        createScheduleJob(asrTime.hours(),asrTime.minutes());
        const maghribTime = moment(data.times.Maghrib, 'HH:mm');
        createScheduleJob(maghribTime.hours(),maghribTime.minutes());
        const ishaTime = moment(data.times.Isha, 'HH:mm');
        createScheduleJob(ishaTime.hours(),ishaTime.minutes());
        $('#fajr-time').text(fajrTime.format('hh:mm A'));
        $('#dhuhr-time').text(dhuhrTime.format('hh:mm A'));
        $('#asr-time').text(asrTime.format('hh:mm A'));
        $('#maghrib-time').text(maghribTime.format('hh:mm A'));
        $('#isha-time').text(ishaTime.format('hh:mm A'));
    } catch (e) {
        writeLog(e);
        showSnackbarWithType('خطأ فى كتابة بيانات مواقيت الصلاة', SnackbarType.WRONG);
    }
}

function renderFootball() {
    try {
        const leagueWidget = (leagueName, fixtures) => {
            let fixturesList = '';
            for (const fixture of fixtures)
                fixturesList += `<div class="card-awesome mx-auto mt-1 p-1">
                            <div class="d-flex">
                                <div class="box-awesome p-0 flex-grow-1 d-flex">
                                    <h6 class="dm-h p-1 fs-12 m-auto">${fixture.team1}</h6>
                                </div>
                                <div class="box-awesome p-0 mx-1 d-flex">
                                    <h6 class="dm-h p-1 m-auto clr-primary fs-14">${fixture.time}</h6>
                                </div>
                                <div class="box-awesome p-0 flex-grow-1 d-flex">
                                    <h6 class="dm-h p-1 fs-12 m-auto">${fixture.team2}</h6>
                                </div>
                            </div>
                        </div>`;
            return `<div class="box-awesome mt-1 pb-1">
                        <h6 class="dm-h fs-13 my-1 text-right"><img src="../assets/ball.png" alt="" width="16" height="16" class="ml-1"> ${leagueName} </h6>
                        <hr class="hr-awesome-right">
                        ${fixturesList}
                    </div>`;
        }
        const data = getFootballFromJson();
        $('#football-content').html('');
        for (const league of data) {
            $('#football-content').append(leagueWidget(league.leagueName, league.fixtures));
        }
    } catch (e) {
        writeLog(e);
        showSnackbarWithType('خطأ فى كتابة بيانات المباريات', SnackbarType.WRONG);
    }
}

function noMoreData() {
    showSnackbarWithType('لا يوجد');
}

function developerToast() {
    showSnackbarWithType('Developed By: Ma7MOoOD SHaRaF');
}

function showDetailScreen(screen) {
    ipcRenderer.send('open-details', {screen: screen});
}

function closeDetailScreen(screen) {
    ipcRenderer.send('close-details', {screen: screen});
}

function createScheduleJob(hour, min) {
    const rule = new schedule.RecurrenceRule();
    rule.dayOfWeek = [0, 1, 2, 3, 4, 5, 6];
    rule.hour = hour;
    rule.minute = min;
    schedule.scheduleJob(rule, function () {
        writeLog(`job invoked in ${hour}:${min} and next invoke in ${rule.nextInvocationDate()}`);
        ipcRenderer.send('open-notify-window', {notifyType: 'azan'});
    });
}