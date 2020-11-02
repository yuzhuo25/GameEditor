<template>
  <!-- <GetRootFile /> -->
  <MainPage v-if="hasRootFileRef" />
</template>

<script>
import MainPage from './pages/MainPage.vue'
import GetRootFile from './component/GetRootFile.vue'

import {ipcRender} from 'electron'

//判断是否有静态资源路径
function getRootFile() {
    let hasRootFileRef = false;
    if(localStorage.getItem('rootFile')){
        ipcRenderer.sendSync('get-rootfile', localStorage.getItem("rootFile"));
        hasRootFileRef = true;
    }
    return hasRootFileRef
}

//监听资源路径导入
ipcRender.on('update-rootfile', (event, arg)=>{
    const files = arg[0] + '/';///Users/welcome/kkcode_live_game_client/bin/
    localStorage.setItem("rootFile", files);
    console.log('[GetRootFile] [onUpdateRootfile] [资源地址]',files);
    ipcRenderer.sendSync('get-rootfile', localStorage.getItem("rootFile") || files);
    //重载页面
    window.location.reload();
})

export default {
  setup(){
    const hasRootFileRef = getRootFile();
    return {
      hasRootFileRef
    }
  },
  data() {
    return 
  },

  created (){
    //判断是否需要导入静态资源路径
    if(this.hasRootFileRef) {

    }
  },

  name: 'App',
  components: {
    MainPage
  }
}
</script>

<style>
</style>
