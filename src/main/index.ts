/**
 * electron 主文件
 */
import { join } from 'path'
import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import is_dev from 'electron-is-dev'
import dotenv from 'dotenv'


dotenv.config({ path: join(__dirname, '../../.env') })

let win: any = null;



function createWin() {
  // 创建浏览器窗口
  win = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      nodeIntegration: true,
    },
  })

  //获取根资源路径
  let rootFile = '';
  ipcMain.on('get-rootfile', (event, arg) => {
    rootFile = arg;
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
