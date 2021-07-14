const $ = require('jquery');

function closeWindow() {
    remote.getCurrentWindow().close();
}

(() => {
    renderWeatherData();
})();

function renderWeatherData() {
    try {
        const weatherCardWidget = (min, max, description, icon, date) => {
            return `<div class="col weather-widget text-center mx-1 py-3">
                <h6 class="text-white"> ${date} </h6>
                <hr class="hr-awesome">
                <img src="../assets/weather/${icon}.png" alt="" height="50" class="m-2">
                <h3 class="text-white my-1">
                    <sub> ${min}° / </sub> ${max}°
                </h3>
                <h6 class="text-white fs-14 my-1">${description}</h6>
            </div>`;
        }
        const data = getWeatherFromJson();
        $('#today-weather-icon').attr('src', `../assets/weather/${data[0].weather[0].icon}.png`);
        $('#today-temp').text(`${~~data[0].temp.max}`);
        $('#today-humidity').text(`${~~data[0].humidity}%`);
        $('#today-description').text(data[0].weather[0].description);
        let sunriseTime = moment.utc(data[0].sunrise * 1000).add({"h": 2}).format('hh:mm A');
        let sunsetTime = moment.utc(data[0].sunset * 1000).add({"h": 2}).format('hh:mm A');
        let todayDate = moment.utc(data[0].dt * 1000).add({"h": 2});
        $('#today-sunrise').text(sunriseTime);
        $('#today-sunset').text(sunsetTime);
        $('#today-weather-date').text(todayDate.locale('ar').format("dddd، DD MMMM YYYY"));
        $('#today-min-max-temp').text(`${~~data[0].temp.max}° / ${~~data[0].temp.min}°`);
        $('#weather-timeline-content').html('');
        let date;
        data.shift();
        for (const day of data) {
            date = moment.utc(day.dt * 1000).add({"h": 2});
            $('#weather-timeline-content').append(weatherCardWidget(~~day.temp.min, ~~day.temp.max, day.weather[0].description, day.weather[0].icon,date.format('YYYY-MM-DD')));
        }
    } catch (e) {
        writeLog(e);
    }
}
