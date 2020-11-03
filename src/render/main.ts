interface Antd{
    [x: string] :any
}

import { createApp } from 'vue'
import App from './vue/App.vue'
const { ipcRenderer } = require('electron') //vite 会编译 import 的形式；所以 electron 及 node.js 内置模块用 require 形式
// import { store, isdev } from './vue/store/index'
import {provideStore} from './vue/store/shareData'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/antd.css';

const app = createApp(App as any);

provideStore(app);

app.use(Antd).mount('#app')
