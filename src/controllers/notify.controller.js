const {Rive} = require('rive-js');
const {exec} = require("child_process");

function closeNotifyWindow() {
    remote.getCurrentWindow().close();
}
document.getElementById('notify-bg').classList.add('notify-bg-dm');
document.getElementById('notify-body').innerHTML = `<div class="p-1 pt-2 d-flex flex-column h-100">
                                                                                <h6 class="dm-h fs-15 text-center">رسالة جديدة من args.senderName</h6>
                                                                                <hr class="hr-awesome">
                                                                                <h6 class="message-content dm-h fs-14 text-center flex-grow-1">لوريم إيبسوم
                                                                                (Lorem Ipsum) هو ببساطة نص شكلي (بمعنى أن الغاية هي الشكل وليس المحتوى) ويُستخدم في صناعات المطابع ودور النشر. كان لوريم إيبسوم ولايزال المعيار للنص الشكلي منذ القرن الخامس عشر عندما قامت مطبعة مجهولة برص مجموعة من الأحرف بشكل عشوائي أخذتها من نص، لتكوّن كتيّب بمثابة دليل أو مرجع شكلي لهذه الأحرف. خمسة قرون من الزمن لم تقضي على هذا النص، بل انه حتى صار مستخدماً وبشكله الأصلي في الطباعة والتنضيد الإلكتروني. انتشر بشكل كبير في ستينيّات هذا القرن مع إصدار رقائق "ليتراسيت" (Letraset) البلاستيكية تحوي مقاطع من هذا النص، وعاد لينتشر مرة أخرى مؤخراَ مع ظهور برامج النشر الإلكتروني مثل "ألدوس بايج مايكر" (Aldus PageMaker) والتي حوت أيضاً على نسخ من نص لوريم إيبسوم.
                                                                                </h6>
                                                                                <hr class="hr-awesome">
                                                                                <div class="row">
                                                                                    <h6 class="col dm-h fs-14 text-right direction-ltr">args.date</h6>
                                                                                    <h6 class="col dm-h fs-14">args.senderPc</h6>
                                                                                </div>
                                                                            </div>`;
ipcRenderer.on('notify-args', (event, args) => {
    try {
        switch (args.notifyType) {
            case "azan":
                runRive('../assets/azan.riv', '4s');
                enableSound === '1' && playSound('/sounds/azan.mp3');
                break;
            case "message":
                document.getElementById('notify-bg').classList.add('notify-bg-dm');
                document.getElementById('notify-body').innerHTML = `<div class="p-1 pt-2 d-flex flex-column h-100">
                                                                                <h6 class="dm-h fs-15 text-center">رسالة جديدة من ${args.senderName}</h6>
                                                                                <hr class="hr-awesome">
                                                                                <h6 class="dm-h fs-14 text-center flex-grow-1">${args.message}</h6>
                                                                                <hr class="hr-awesome">
                                                                                <div class="row">
                                                                                    <h6 class="col dm-h fs-14 text-right direction-ltr">${args.date}</h6>
                                                                                    <h6 class="col dm-h fs-14">${args.senderPc}</h6>
                                                                                </div>
                                                                            </div>`;
                break;
        }
    } catch (e) {
        writeLog(e);
    }
});

function runRive(src, animation) {
    new Rive({
        src: src,
        canvas: document.getElementById('text-riv'),
        autoplay: true,
        animations: animation,
        onstop: event => {
            enableSound === '0' && closeNotifyWindow();
        }
    });
}

function playSound(src) {
    const exePath = appDir + '/exec/bg-sound.exe';
    const soundPath = appDir + src;
    exec(`${exePath} "${soundPath}"`, (error, stdout, stderr) => {
        closeNotifyWindow();
    });
}