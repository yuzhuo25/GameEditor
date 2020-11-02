<template>
    <a-button :click="sendUpdateRootfile" type="primary">
        导入资源
    </a-button>
</template>

<script>
import { ipcRender } from "electron";
import { onMounted } from "vue";

function getRootFile() {
  if (localStorage.getItem("rootFile")) {
    ipcRenderer.sendSync("get-rootfile", localStorage.getItem("rootFile"));
  } else {
    // this.$warning({
    //   title: "提示",
    //   content: "请先导入资源文件！"
    // });
    this.sendUpdateRootfile();
  }
}
export default {
  setup() {},

  onMounted() {
    getRootFile();
    ipcRender.on("update-rootfile", (event, arg) => {
        onUpdateRootfile();
    })
  },

  methods: {
      //向主进程发送导入|更新资源事件
      sendUpdateRootfile() {
          ipcRender.sendSync("update-rootfile");
      },
      /**
       * 得到主进程的资源路径
       * 刷新窗口
       */
      onUpdateRootfile(){
        const files = arg[0] + '/';///Users/welcome/kkcode_live_game_client/bin/
        localStorage.setItem("rootFile", files);
        console.log('[GetRootFile] [onUpdateRootfile] [资源地址]',files);
        ipcRenderer.sendSync('get-rootfile', localStorage.getItem("rootFile") || files);
        //重载页面
        window.location.reload();
      }
  }
};
</script>

