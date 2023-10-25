// main.js


// Modules pour controler la vie de l'application et créer une fenêtre de navigation native
const { app, BrowserWindow,Menu, MenuItem } = require('electron')
const path = require('path')
const { ipcMain, dialog } = require('electron')
const electron = require('electron')
var screenElectron = electron.screen;

const isMac = process.platform === 'darwin'

// Menu de l'application Mac OS et PC
const template = [
  ...(isMac ? [{
    label: 'Trombi',
    submenu : [
      { role: 'about',label: 'À propos de Trombi' },
      { type: 'separator' },
      { role: 'services' },
      { type: 'separator' },
      { role: 'hide',label:'Masquer Trombi' },
      { role: 'hideothers',label:'Masquer les autres' },
      { role: 'unhide',label:'Tout afficher' },
      { type: 'separator' },
      { role: 'quit',label:'Quitter Trombi' }
    ]
  }] : 
  [{  
    label: 'Fichier',
    submenu: [
      { role: 'quit',label:'Quitter Trombi' }
    ]
  },
  {
    id: 'MenuAide',
    label: 'Aide',
    submenu: [
      { role: 'about',label: 'À propos de Trombi' },  ]
}])
]

// Ouverture d'un boite de dialogue pour choisir un dossier
ipcMain.on('dialog_ouvrir', (event, arg) => {
  const options = {
    title: 'Choix',
    buttonLabel: 'Choisir',
    properties: ['openDirectory', 'createDirectory'],
  };
  dialog.showOpenDialog(options).then(result => {
    if (result.canceled === false) {
      event.sender.send("selected-directory", result.filePaths)
      mainWindow.setSize(1024, 1024)
    }
  }).catch(err => {
    console.log(err)
  })
})

ipcMain.on('trombi_btn', (event, arg) => {
  creatChild()
  child.loadFile('apercu.html')
  child.once('ready-to-show', () => {
  child.show()
  })
})

ipcMain.on('source',  (event, arg) => {
  child.webContents.send('source', arg);
});

ipcMain.on('close-child-window', () => {
  if (child) {
    child.hide()
  }
})

function creatChild()
{
  child = new BrowserWindow({
    parent: mainWindow,
    modal: true,
    show: false,
    width: 945,
    height: 900,
    webPreferences: {    
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    }
  })
  child.setMenuBarVisibility(false)

}
function createWindow() {
  // Créer la fenêtre de navigation.

   mainWindow = new BrowserWindow({
    width: 1024,
    height: 300,
    x:centre,
    y:0,
    icon: 'images/trombi.png',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
  
      enableRemoteModule: true
    }
  })
  mainWindow.setMenuBarVisibility(false)
  // et charger l'index.html de l'application.
  mainWindow.loadFile('index.html')
  creatChild()
  // Ouvrir les outils de développement.
   //mainWindow.webContents.openDevTools()



}

// Cette méthode sera appelée quand Electron aura fini
// de s'initialiser et sera prêt à créer des fenêtres de navigation.
// Certaines APIs peuvent être utilisées uniquement quant cet événement est émit.
app.whenReady().then(() => {
  
  var mainScreen = screenElectron.getPrimaryDisplay();
  var dimensions = mainScreen.size;
  centre=(dimensions.width-1024)/2
  createWindow()
  const menu = Menu.buildFromTemplate(template)  
  Menu.setApplicationMenu(menu)

  app.on('activate', function () {
    // Sur macOS il est d'usage de recréer une fenêtre dans l'application quand
    // l'icône du dock est cliquée et qu'il n'y a pas d'autre fenêtre ouverte.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

})

// Quitter quand toutes les fenêtres sont fermées, sauf sur macOS. Sur macOS, il est courant
// pour les applications et leur barre de menu de rester actives jusqu’à ce que l’utilisateur quitte
// explicitement avec Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// Dans ce fichier, vous pouvez inclure le reste du code spécifique du
// processus principal de votre application. Vous pouvez également le mettre dans des fichiers séparés et les inclure ici.


