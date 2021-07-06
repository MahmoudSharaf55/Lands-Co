const {app, BrowserWindow, ipcMain, Tray, Menu, screen} = require('electron');
require('electron-reload')(__dirname);
let mainWindow;
let aboutWindow;
let detailWindow;
let notifyWindow;
let tray = null;
let firstMini = true;
let display;


function createMainWindow() {
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 600,
        center: true,
        roundedCorners: true,
        autoHideMenuBar: true,
        resizable: false,
        closable: false,
        transparent: true,
        frame: false,
        icon: __dirname + '/assets/lands-co.ico',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            devTools: true,
        }
    });
    mainWindow.loadFile(__dirname + "/views/index.html");
}

function createAboutWindow() {
    aboutWindow = new BrowserWindow({
        width: 600,
        height: 300,
        center: true,
        autoHideMenuBar: true,
        resizable: false,
        closable: false,
        transparent: true,
        frame: false,
        modal: true,
        show: false,
        icon: __dirname + '/assets/lands-co.ico',
        parent: mainWindow,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
    });
    aboutWindow.loadFile(__dirname + "/views/about.html");

    aboutWindow.once("ready-to-show", () => {
        aboutWindow.show();
    });
}

function createDetailWindow(screen) {
    detailWindow = new BrowserWindow({
        width: 950,
        height: 550,
        center: true,
        autoHideMenuBar: true,
        resizable: false,
        closable: false,
        transparent: true,
        frame: false,
        modal: true,
        show: false,
        icon: __dirname + '/assets/lands-co.ico',
        parent: mainWindow,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
    });
    detailWindow.loadFile(__dirname + `/views/${screen}.html`);

    detailWindow.once("ready-to-show", () => {
        detailWindow.show();
    });
}

function createNotifyWindow(notifyType) {
    notifyWindow = new BrowserWindow({
        width: 300,
        height: 150,
        x: display.bounds.width - 300,
        y: display.bounds.height - 190,
        autoHideMenuBar: true,
        resizable: false,
        closable: false,
        transparent: true,
        alwaysOnTop: true,
        frame: false,
        show: false,
        icon: __dirname + '/assets/lands-co.ico',
        parent: mainWindow,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
    });
    notifyWindow.loadFile(__dirname + `/views/notify.html`);

    notifyWindow.once("ready-to-show", () => {
        notifyWindow.show();
        notifyWindow.webContents.send('notify-type', {notifyType});
    });
}

function minimizeAllWindows() {
    if (firstMini) {
        tray.displayBalloon({
            title: 'Lands-Co',
            content: "Ok, I'm Here.",
            icon: __dirname + '/assets/lands-co.ico',
        });
        firstMini = false;
    }
    if (mainWindow != null && mainWindow.isVisible())
        mainWindow.hide();
    if (aboutWindow != null && aboutWindow.isVisible())
        aboutWindow.hide();
    if (detailWindow != null && detailWindow.isVisible())
        detailWindow.hide();
}

function maximizeAllWindows() {
    if (mainWindow != null && !mainWindow.isVisible())
        mainWindow.show();
    if (aboutWindow != null && !aboutWindow.isVisible())
        aboutWindow.show();
    if (detailWindow != null && !detailWindow.isVisible())
        detailWindow.show();
}

ipcMain.on('minimize-main-window', (event, arg) => {
    mainWindow.minimize();
});
ipcMain.on("open-about-window", (event, arg) => {
    createAboutWindow();
});
ipcMain.on("close-about-window", (event, arg) => {
    aboutWindow.hide();
    aboutWindow.close();
    aboutWindow.destroy();
    aboutWindow = null;
});
ipcMain.on("open-details", (event, arg) => {
    createDetailWindow(arg.screen);
});
ipcMain.on("close-details", (event, arg) => {
    detailWindow.hide();
    detailWindow.close();
    detailWindow.destroy();
    detailWindow = null;
});

ipcMain.on("open-notify-window", (event, arg) => {
    notifyWindow == null && createNotifyWindow(arg.notifyType);
});
ipcMain.on("close-notify-window", (event, arg) => {
    notifyWindow.hide();
    notifyWindow.close();
    notifyWindow.destroy();
    notifyWindow = null;
});

ipcMain.on("hide-to-tray", (event, arg) => {
    minimizeAllWindows();
});

app.whenReady().then(() => {
    display = screen.getPrimaryDisplay();
    tray = new Tray(__dirname + '/assets/lands-co.ico');
    const contextMenu = Menu.buildFromTemplate([
        {label: 'تكبير', type: 'normal', click: () => maximizeAllWindows()},
        {label: 'تصغير', type: 'normal', click: () => minimizeAllWindows()},
        {type: 'separator'},
        {label: 'إغلاق نهائياً', type: 'normal', click: () => app.exit(0)},
    ]);
    tray.setToolTip('Lands-Co');
    tray.setTitle("Lands-Co");
    tray.setContextMenu(contextMenu);
    tray.on('double-click', event => {
        if (mainWindow.isVisible()) {
            minimizeAllWindows();
        } else {
            maximizeAllWindows();
        }
    });
    createMainWindow();
});