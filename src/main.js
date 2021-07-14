const {app, BrowserWindow, ipcMain, Tray, Menu, screen, dialog, globalShortcut} = require('electron');
const AutoLaunch = require('auto-launch');
// require('electron-reload')(__dirname);
let mainWindow;
let aboutWindow;
let detailWindow;
let notifyWindow;
let messageInWindow;
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
        transparent: true,
        frame: false,
        icon: __dirname + '/assets/lands-co.ico',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
            devTools: true,
        }
    });
    mainWindow.loadFile(__dirname + "/views/index.html");
    mainWindow.once("ready-to-show", () => {
        mainWindow.show();
    });
    mainWindow.on('close', (e) => {
        let options = {
            type: 'question',
            buttons: ["لا", "تصغير بجوار الساعة", "نعم"],
            title: 'إغلاق نهائياً',
            message: "هل تريد إغلاق التطبيق نهائياً؟",
        };

        const res = dialog.showMessageBoxSync(mainWindow, options);
        if (res === 0 || res === 1) {
            e.preventDefault();
            if (res === 1) {
                firstMini = true;
                minimizeAllWindows();
            }
        }
    });
    mainWindow.on('closed', () => {
        mainWindow.destroy();
        mainWindow = null;
    });
}

function createAboutWindow() {
    aboutWindow = new BrowserWindow({
        width: 600,
        height: 300,
        autoHideMenuBar: true,
        roundedCorners: true,
        resizable: false,
        transparent: true,
        frame: false,
        modal: true,
        show: false,
        icon: __dirname + '/assets/lands-co.ico',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
            devTools: true,
        },
    });
    aboutWindow.loadFile(__dirname + "/views/about.html");
    aboutWindow.once("ready-to-show", () => {
        aboutWindow.show();
    });
    aboutWindow.on('close', () => {
        aboutWindow.destroy();
        aboutWindow = null;
    });
}

function createDetailWindow(screen) {
    detailWindow = new BrowserWindow({
        width: 950,
        height: 550,
        autoHideMenuBar: true,
        roundedCorners: true,
        resizable: false,
        transparent: true,
        frame: false,
        show: false,
        icon: __dirname + '/assets/lands-co.ico',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
            devTools: true,
        },
    });
    detailWindow.loadFile(__dirname + `/views/${screen}.html`);

    detailWindow.once("ready-to-show", () => {
        detailWindow.show();
    });
    detailWindow.on('close', () => {
        detailWindow.destroy();
        detailWindow = null;
    });
}

function createNotifyWindow(args) {
    notifyWindow = new BrowserWindow({
        width: 300,
        height: 150,
        x: display.bounds.width - 300,
        y: display.bounds.height - 190,
        autoHideMenuBar: true,
        roundedCorners: true,
        resizable: false,
        transparent: true,
        alwaysOnTop: true,
        frame: false,
        show: false,
        icon: __dirname + '/assets/lands-co.ico',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
            devTools: true,
        },
    });
    notifyWindow.loadFile(__dirname + `/views/notify.html`);
    notifyWindow.once("ready-to-show", () => {
        notifyWindow.show();
        notifyWindow.webContents.send('notify-args', args);
    });
    notifyWindow.on('close', () => {
        notifyWindow.destroy();
        notifyWindow = null;
    });
}

function createMessageInWindow() {
    messageInWindow = new BrowserWindow({
        width: 400,
        height: 200,
        autoHideMenuBar: true,
        roundedCorners: true,
        resizable: false,
        transparent: true,
        frame: false,
        show: false,
        icon: __dirname + '/assets/lands-co.ico',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
            devTools: true,
        },
    });
    messageInWindow.loadFile(__dirname + `/views/message-in.html`);
    messageInWindow.once("ready-to-show", () => {
        messageInWindow.show();
    });
    messageInWindow.on('close', () => {
        messageInWindow.destroy();
        messageInWindow = null;
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
    if (messageInWindow != null && messageInWindow.isVisible())
        messageInWindow.hide();
}

function maximizeAllWindows() {
    if (mainWindow != null && !mainWindow.isVisible())
        mainWindow.show();
    if (aboutWindow != null && !aboutWindow.isVisible())
        aboutWindow.show();
    if (detailWindow != null && !detailWindow.isVisible())
        detailWindow.show();
    if (messageInWindow != null && !messageInWindow.isVisible())
        messageInWindow.show();
}

ipcMain.on('minimize-main-window', (event, arg) => {
    mainWindow.minimize();
});
ipcMain.on("open-about-window", (event, arg) => {
    createAboutWindow();
});
ipcMain.on("open-details", (event, arg) => {
    if (detailWindow) {
        if (detailWindow.isMinimized()) detailWindow.restore();
        detailWindow.focus();
    } else
        createDetailWindow(arg.screen);
});
ipcMain.on("open-notify-window", (event, arg) => {
    createNotifyWindow(arg);
});
ipcMain.on("hide-to-tray", (event, arg) => {
    minimizeAllWindows();
});
ipcMain.on("close-app", (event, arg) => {
    app.exit(0);
});
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
    app.quit();
} else {
    app.on('second-instance', (event, commandLine, workingDirectory) => {
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.focus();
        }
    });
    app.whenReady().then(() => {
        display = screen.getPrimaryDisplay();
        tray = new Tray(__dirname + '/assets/lands-co.ico');
        globalShortcut.register('CommandOrControl+M', () => {
            if (messageInWindow) {
                if (messageInWindow.isMinimized()) messageInWindow.restore();
                messageInWindow.focus();
            } else
                createMessageInWindow();
        });
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
        const autoLaunch = new AutoLaunch({
            name: 'Lands-Co',
            path: app.getPath('exe'),
        });
        autoLaunch.isEnabled().then((isEnabled) => {
            if (!isEnabled) autoLaunch.enable();
        });
    });
}