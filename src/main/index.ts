/**
 * electron 主文件
 */
import path,{ join } from 'path'
import { app, BrowserWindow, ipcMain, dialog, Menu } from 'electron'
import is_dev from 'electron-is-dev'
import dotenv from 'dotenv'
// import express from 'express';
// const server = express();

const isMac = process.platform === 'darwin';

let win: any = null;

const template:any = [
  // { role: 'appMenu' }
  ...(isMac ? [{
    label: app.name,
    submenu: [
      { role: 'about' },
      { type: 'separator' },
      { role: 'services' },
      { type: 'separator' },
      { role: 'hide' },
      { role: 'hideothers' },
      { role: 'unhide' },
      { type: 'separator' },
      { role: 'quit' }
    ]
  }] : []),
  // { role: 'fileMenu' }
  {
    label: '关卡',
    submenu: [
      {
        label: '新建关卡',
        accelerator: 'CmdOrCtrl+N',
        click: async () => {
          // ipcMain.emit("CREATE_LEVEL", "CREATE_LEVEL");
          console.log("[Menu] [new level]")
          win.webContents.send("CREATE_LEVEL", "whooo")
        }
      },
      {
        label: '导出关卡',
        accelerator: 'CmdOrCtrl+E',
        click: async () => {
          console.log("[Menu] [new level]")
        }
      },
      {
        label: '运行关卡',
        accelerator: 'CmdOrCtrl+G',
        click: async () => {
          console.log("[Menu] [new level]")
        }
      },
    ]
  },
  // { role: 'editMenu' }
  {
    label: 'Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      ...(isMac ? [
        { role: 'pasteAndMatchStyle' },
        { role: 'delete' },
        { role: 'selectAll' },
        { type: 'separator' },
        {
          label: 'Speech',
          submenu: [
            { role: 'startspeaking' },
            { role: 'stopspeaking' }
          ]
        }
      ] : [
        { role: 'delete' },
        { type: 'separator' },
        { role: 'selectAll' }
      ])
    ]
  },
  // { role: 'viewMenu' }
  {
    label: 'View',
    submenu: [
      { role: 'reload' },
      { role: 'forcereload' },
      { role: 'toggledevtools' },
      { type: 'separator' },
      { role: 'resetzoom' },
      { role: 'zoomin' },
      { role: 'zoomout' },
      { type: 'separator' },
      { role: 'togglefullscreen' }
    ]
  },
  // { role: 'windowMenu' }
  {
    label: 'Window',
    submenu: [
      { role: 'minimize' },
      { role: 'zoom' },
      ...(isMac ? [
        { type: 'separator' },
        { role: 'front' },
        { type: 'separator' },
        { role: 'window' }
      ] : [
        { role: 'close' }
      ])
    ]
  },
  {
    role: 'help',
    submenu: [
     
    ]
  }
];

const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)

dotenv.config({ path: join(__dirname, '../../.env') })



function createWin() {
  // 创建浏览器窗口
  win = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      nodeIntegration: true,
    },
  })

  new Menu()

// server.use(express.static(path.join(__dirname, 'simulator')));
// server.listen(8088);
// server.listen(3000);


  //获取根资源路径
  let rootFile = '';
  ipcMain.on('get-rootfile', (event, arg) => {
    rootFile = arg;
    // if(rootFile) {
    //   server.use('/level_res/',
    //   express.static(path.resolve(rootFile + "/level_res")));
    //   server.use('/editor_res/',
    //   express.static(path.resolve(rootFile + "/editor_res")));
    //   server.use('/dev_run/',
    //   express.static(path.resolve(rootFile)));
    // }
    
  })

  //
  //更新资源地址
  ipcMain.on('change-rootfile', (event) => {
    console.log('[app] [index.ts] [change-rootfile]');
    event.returnValue = "ok";
    if (!win) {
      return;
    }
    dialog.showOpenDialog(win, {
      properties: ['openFile', 'openDirectory']
    }).then(result => {
      event.sender.send('change-rootfile', result.filePaths);
    }).catch(err => {
      console.log(err)
    })

  })

  const URL = is_dev
  ? `http://localhost:${process.env.PORT}` // vite 启动的服务器地址
  : `file://${join(__dirname, '../render/index.html')}` // vite 构建后的静态文件地址

  win.loadURL(URL)
}

app.whenReady().then(createWin)
