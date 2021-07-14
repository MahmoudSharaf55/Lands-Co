const {Chart} = require('chart.js');
const $ = require('jquery');

function closeWindow() {
    remote.getCurrentWindow().close();
}

(() => {
    renderCoronaData();
})();

function renderCoronaData() {
    try {
        const data = getCoronaFromJson();
        $('#egypt-today-cases').text(data.egypt.todayCases);
        $('#egypt-today-deaths').text(data.egypt.todayDeaths);
        $('#egypt-today-recovered').text(data.egypt.todayRecovered);
        $('#egypt-total-cases').text(data.egypt.cases);
        $('#egypt-total-deaths').text(data.egypt.deaths);
        $('#egypt-total-recovered').text(data.egypt.recovered);
        $('#world-today-cases').text(data.world.todayCases);
        $('#world-today-deaths').text(data.world.todayDeaths);
        $('#world-today-recovered').text(data.world.todayRecovered);
        $('#world-total-cases').text(data.world.cases);
        $('#world-total-deaths').text(data.world.deaths);
        $('#world-total-recovered').text(data.world.recovered);
        $('#countries-table-body').html('');
        for (const country of data.countries) {
            $('#countries-table-body').append(`<tr>
                                            <td>${country.countryName}</td>
                                            <td>${country.cases}</td>
                                            <td>${country.deaths}</td>
                                            <td>${country.recovered}</td>
                                        </tr>`);
        }
        const lastDate = new moment(Object.keys(data.egyptTimeline.cases).pop(), 'M/D/YY');
        const chartLabels = [lastDate.format('D/M')];
        for (let i = 0; i < 3; i++) {
            chartLabels.unshift(lastDate.add({'d': -1}).format('D/M'));
        }
        const casesData = Object.values(data.egyptTimeline.cases);
        const deathsData = Object.values(data.egyptTimeline.deaths);
        const recoveredData = Object.values(data.egyptTimeline.recovered);
        const chartCasesData = [], chartDeathsData = [], chartRecoveredData = [];
        for (let i = 1; i < casesData.length; i++) {
            chartCasesData.push(casesData[i] - casesData[i - 1]);
            chartDeathsData.push(deathsData[i] - deathsData[i - 1]);
            chartRecoveredData.push(recoveredData[i] - recoveredData[i - 1]);
        }
        buildChart(chartLabels, chartCasesData, chartDeathsData, chartRecoveredData);
    } catch (e) {
        writeLog(e);
    }
}

function buildChart(labels, casesData, deathsData, recoveredData) {
    const data = {
        labels: labels,
        datasets: [{
            label: 'المصابين',
            backgroundColor: '#ff4a4a',
            borderColor: '#ff4a4a',
            data: casesData,
        }, {
            label: 'الوفيات',
            backgroundColor: '#bd7734',
            borderColor: '#bd7734',
            data: deathsData,
        }, {
            label: 'المتعافين',
            backgroundColor: '#4bc730',
            borderColor: '#4bc730',
            data: recoveredData,
        }]
    };
    const config = {
        type: 'line',
        data,
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                },
            },
            interaction: {
                mode: 'index',
                intersect: false,
            },
        }
    };
    new Chart(document.getElementById('line-chart'), config);
}