const {Rive} = require('rive-js');
const $ = require('jquery');
const schedule = require('node-schedule');
const chokidar = require('chokidar');
const os = require('os');

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
    if (dataExists()) {
        renderCorona();
        renderWeather();
        renderCurrency();
        renderPrayer();
        renderFootball();
        renderLastUpdateDate();
    } else {
        showSnackbarWithType('مجلد البيانات غير موجود', SnackbarType.WRONG);
    }
})();

function minimizeWindowToTray() {
    ipcRenderer.send('hide-to-tray');
}

function reloadMainWindow() {
    ipcRenderer.send('re-render-main');
}

function minimizeWindow() {
    ipcRenderer.send('minimize-main-window');
}

function openAboutWindow() {
    ipcRenderer.send('open-about-window');
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
        console.log(e);
        writeLog(e);
        showSnackbarWithType('خطأ فى كتابة بيانات الكورونا', SnackbarType.WRONG);
    }
}

function renderWeather() {
    try {
        const data = getWeatherFromJson();
        let today = data[0];
        for (const day of data) {
            if (moment(moment(day.dt * 1000).format('YYYY-MM-DD')).isSame(moment().format('YYYY-MM-DD'))) {
                today = day;
            }
        }
        $('#today-temp').html(`<sub> ${~~today.temp.min}° / </sub> ${~~today.temp.max}°`);
        $('#today-description').text(today.weather[0].description);
        const sunriseTime = moment.utc(today.sunrise * 1000).add({"h": 2}).format('hh:mm A');
        const sunsetTime = moment.utc(today.sunset * 1000).add({"h": 2}).format('hh:mm A');
        $('#today-sunrise').text(sunriseTime);
        $('#today-sunset').text(sunsetTime);
        $('#today-weather-icon').attr('src', `../assets/weather/${today.weather[0].icon}.png`);
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
        createScheduleJob(fajrTime.hours(), fajrTime.minutes());
        const dhuhrTime = moment(data.times.Dhuhr, 'HH:mm');
        createScheduleJob(dhuhrTime.hours(), dhuhrTime.minutes());
        const asrTime = moment(data.times.Asr, 'HH:mm');
        createScheduleJob(asrTime.hours(), asrTime.minutes());
        const maghribTime = moment(data.times.Maghrib, 'HH:mm');
        createScheduleJob(maghribTime.hours(), maghribTime.minutes());
        const ishaTime = moment(data.times.Isha, 'HH:mm');
        createScheduleJob(ishaTime.hours(), ishaTime.minutes());
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
                                    <h6 class="dm-h p-1 m-auto clr-primary fs-12">${fixture.time}</h6>
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
        const {today} = getFootballFromJson();
        $('#football-content').html(today.length ? '' : '<h6 class="dm-h fs-12">لا يوجد مباريات اليوم</h6>');
        for (const league of today) {
            $('#football-content').append(leagueWidget(league.leagueName, league.fixtures));
        }
    } catch (e) {
        writeLog(e);
        showSnackbarWithType('خطأ فى كتابة بيانات المباريات', SnackbarType.WRONG);
    }
}
function renderLastUpdateDate(){
    $('#last-update-date').text(`أخر تحديث: ${getLastModifiedDateOfData()}`);
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

function createScheduleJob(hour, min) {
    try {
        const azanRule = new schedule.RecurrenceRule();
        azanRule.dayOfWeek = [0, 1, 2, 3, 4, 5, 6];
        azanRule.hour = hour;
        azanRule.minute = min;
        schedule.scheduleJob(azanRule, function () {
            ipcRenderer.send('open-notify-window', {notifyType: 'azan'});
        });
        const refreshRule = new schedule.RecurrenceRule();
        refreshRule.dayOfWeek = [0, 1, 2, 3, 4, 5, 6];
        refreshRule.hour = 21;
        refreshRule.minute = 0;
        schedule.scheduleJob(refreshRule, function () {
            configActionOnWatching();
            reloadMainWindow();
        });
    } catch (e) {
        writeLog('cannot create schedule job ' + e);
    }
}

watchData();

function watchData() {
    try {
        const watcher = chokidar.watch(appDir + '\\data', {
            persistent: true,
            awaitWriteFinish: true,
            ignoreInitial: true,
            usePolling: true,
        });
        watcher
            .on('add', path => reloadMainWindow())
            .on('change', path => reloadMainWindow());
    } catch (e) {
        writeLog('data watcher error ' + e);
    }
}

watchMessages();

function watchMessages() {
    try {
        const watcher = chokidar.watch(appDir + '\\message\\message.json', {
            persistent: true,
            awaitWriteFinish: true,
            ignoreInitial: true,
            usePolling: true,
        });
        watcher
            .on('add', path => openMessageWindow())
            .on('change', path => openMessageWindow());
    } catch (e) {
        writeLog('message watcher error ' + e);
    }
}

function openMessageWindow() {
    const data = fse.readJsonSync(appDir + '/message/message.json');
    console.log(data);
    if (os.hostname() === data.receiverPc) {
        ipcRenderer.send('open-notify-window', {notifyType: 'message', ...data});
    }
}

watchConfig();

function watchConfig() {
    try {
        const watcher = chokidar.watch(appDir + '\\config\\config.json', {
            persistent: true,
            awaitWriteFinish: true,
            ignoreInitial: true,
            usePolling: true,
        });
        watcher
            .on('add', path => configActionOnWatching())
            .on('change', path => configActionOnWatching());
    } catch (e) {
        writeLog('config watcher error ' + e);
    }
}

function configActionOnWatching() {
    const data = fse.readJsonSync(appDir + '/config/config.json');
    if (data.closeApp == 1)
        ipcRenderer.send('close-app');
}