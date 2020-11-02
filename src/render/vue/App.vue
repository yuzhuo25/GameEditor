<template>
  <RootFileDialog v-if="!hasRootFileRef" @change-hasroot="hasRootFileRef=!hasRootFileRef" />
  <MainPage v-if="hasRootFileRef" />
</template>

<script>
import MainPage from './pages/MainPage.vue'
import RootFileDialog from './components/RootFileDialog.vue'

const { ipcRenderer } = require('electron')

export default {
 
  data() {
    return {
      hasRootFileRef: false
    }
  },

  created (){
    if(localStorage.getItem("rootFile")){
        ipcRenderer.send("get-rootfile", localStorage.getItem("rootFile"));
        this.hasRootFileRef = true;
    }
    console.log("[App] [hasRootFileRef]", this.hasRootFileRef)
  },

  name: 'App',
  components: {
    MainPage,
    RootFileDialog
  }
}
</script>

<style>
</style>
