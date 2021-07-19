const $ = require('jquery');
let azkarData;

function closeWindow() {
    remote.getCurrentWindow().close();
}

const azkarWidget = (text, delay) => {
    return `<div class="card-awesome text-right my-1 animate__animated animate__zoomIn" style="animation-duration: ${delay}ms">
            <h6 class="dm-h p-2 fs-14" style="line-height: 1.7">
                ${text.replaceAll('\n', '<br>')}
            </h6>
        </div>`;
}
(() => {
    try {
        azkarData = fse.readJsonSync(appDir + '/data/azkar.json');
        renderAzkarData(azkarData.sabah);
    } catch (e) {
        writeLog(e);
    }
})();

function openAzkarSabah() {
    if (!$('#sabah-btn').hasClass('active')) {
        $('#azkar-content').scrollTop(0);
        $('#masaa-btn').removeClass('active');
        $('#sabah-btn').addClass('active');
        renderAzkarData(azkarData.sabah);
    }
}

function openAzkarMasaa() {
    if (!$('#masaa-btn').hasClass('active')) {
        $('#azkar-content').scrollTop(0);
        $('#sabah-btn').removeClass('active');
        $('#masaa-btn').addClass('active');
        renderAzkarData(azkarData.masaa);
    }
}

function renderAzkarData(data) {
    const azkarBody = $('#azkar-content');
    azkarBody.html('');
    for (const [i, zekr] of data.entries()) {
        console.log(zekr);
        azkarBody.append(azkarWidget(zekr, i > 6 ? 1500 : (i + 1) * 300));
    }
}