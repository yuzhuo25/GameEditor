interface Antd{
    [x: string] :any
}

import { createApp } from 'vue'
import App from './vue/App.vue'
// vite 会编译 import 的形式；所以 electron 及 node.js 内置模块用 require 形式
const { ipcRenderer } = require('electron')
// import { store, isdev } from '/utils/index'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/antd.css';

console.log('ipcRenderer:', ipcRenderer);
// console.log('Store', store)
// console.log('electron is dev', isdev)

createApp(App as any)
.use(Antd)
.mount('#app')
