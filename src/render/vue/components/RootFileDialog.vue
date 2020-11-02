<template>
   <a-modal visible title="选择资源文件" @ok="handleOk" >
      <a-row>
            <a-col span={12}>
                选择文件地址:
            </a-col>
            <a-col span={12}>
                <a-input @click="sendUpdateRootfile" :value="value"  placeholder="" />
            </a-col>
        </a-row>    
    </a-modal>
</template>

<script>
const { ipcRenderer } = require('electron')

export default {
    data(){
        return {
            visible: true,
            value: ''
        }
    },
    created(){
        this.value = localStorage.getItem("rootFile") || "";
        //监听资源路径导入
        ipcRenderer.on("change-rootfile", (event, arg)=>{
            const files = arg[0] + '/';///Users/welcome/kkcode_live_game_client/bin/
            this.value = files;
        })
    },
    methods: {
        /**
         * 向主进程发送导入|更新资源事件
         */
        sendUpdateRootfile() {
            ipcRenderer.sendSync("change-rootfile");
        },

        /**
         * 保存当前静态地址
         * 关闭dialog
         */
        handleOk() {
            localStorage.setItem("rootFile", this.value);
            console.log("[GetRootFile] [onUpdateRootfile] [资源地址]",this.value);
            ipcRenderer.send("get-rootfile", localStorage.getItem("rootFile") || this.value);
            this.$emit("change-hasroot");
        }
    }
};
</script>

