const $ = require('jquery');

function closeWindow() {
    remote.getCurrentWindow().close();
}

(() => {
    renderFootballData();
})();

function renderFootballData() {
    try {
        const leagueWidget = (leagueName, fixtures) => {
            let fixturesList = '';
            for (const fixture of fixtures)
                fixturesList += `<div class="card-awesome mx-auto mt-1 p-1">
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
        const data = getFootballFromJson();
        $('#matches-content').html('');
        for (const league of data) {
            $('#matches-content').append(leagueWidget(league.leagueName, league.fixtures));
        }
    } catch (e) {
        writeLog(e);
    }
}