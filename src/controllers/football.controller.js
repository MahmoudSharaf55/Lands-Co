const $ = require('jquery');
let footballData;

function closeWindow() {
    remote.getCurrentWindow().close();
}

const leagueWidget = (leagueName, fixtures) => {
    let fixturesList = '';
    for (const [i, fixture] of fixtures.entries())
        fixturesList += `<div class="card-awesome mx-auto mt-1 p-1 animate__animated animate__zoomIn" style="animation-duration: ${i > 6 ? 1500 : (i + 1) * 300}ms"">
                                    <div class="row d-flex">
                                        <div class="col box-awesome p-0 flex-grow-1 d-flex">
                                            <h6 class="dm-h py-2 m-auto">${fixture.team1}</h6>
                                        </div>
                                        <div class="box-awesome p-0 mx-1 d-flex">
                                            <h6 class="dm-h p-2 m-auto clr-primary">${fixture.time}</h6>
                                        </div>
                                        <div class="col box-awesome p-0 flex-grow-1 d-flex">
                                            <h6 class="dm-h py-2 m-auto">${fixture.team2}</h6>
                                        </div>
                                    </div>
                                </div>`;
    return `<div class="box-awesome mt-1 pb-1">
            <h6 class="dm-h my-1 text-right">
                <img src="../assets/ball.png" alt="" width="20" height="20" class="ml-1"> ${leagueName} </h6>
            <hr class="hr-awesome-right w-25">
            ${fixturesList}
        </div>`;
}
(() => {
    try {
        footballData = fse.readJsonSync(appDir + '/data/football.json');
        renderFootballData(footballData.today);
    } catch (e) {
        writeLog(e);
    }
})();

function openTodayMatches() {
    if (!$('#today-matches-btn').hasClass('active')) {
        $('#matches-content').scrollTop(0);
        $('#tomorrow-matches-btn').removeClass('active');
        $('#today-matches-btn').addClass('active');
        renderFootballData(footballData.today);
    }
}

function openTomorrowMatches() {
    if (!$('#masaa-btn').hasClass('active')) {
        $('#matches-content').scrollTop(0);
        $('#today-matches-btn').removeClass('active');
        $('#tomorrow-matches-btn').addClass('active');
        renderFootballData(footballData.tomorrow);
    }
}

function renderFootballData(data) {
    try {
        $('#matches-content').html(data.length ? '' : '<h6 class="dm-h fs-14 text-center">لا يوجد مباريات</h6>');
        for (const league of data) {
            $('#matches-content').append(leagueWidget(league.leagueName, league.fixtures));
        }
    } catch (e) {
        writeLog(e);
    }
}