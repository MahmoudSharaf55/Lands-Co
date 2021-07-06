const { MSICreator } = require('electron-wix-msi');

const APP_DIR = 'C:\\Users\\gnozom\\WebstormProjects\\Lands-Co\\dist\\win\\Lands-Co-win32-x64';
const OUT_DIR = 'C:\\Users\\gnozom\\WebstormProjects\\Lands-Co\\dist\\installer';

const msiCreator = new MSICreator({
    appDirectory: APP_DIR,
    outputDirectory: OUT_DIR,
    description: 'Lands-Co',
    exe: 'Lands-Co',
    name: 'Lands-Co',
    defaultInstallMode: 'perUser',
    manufacturer: 'Ma7MOoOD SHaRaF',
    version: '1.0.0',
    appIconPath: 'C:\\Users\\gnozom\\WebstormProjects\\Lands-Co\\src\\assets\\lands-co.ico',
    programFilesFolderName: "Lands-Co",
    ui: {
        chooseDirectory: true,
    },
});
msiCreator.create().then(function () {
    msiCreator.compile();
});