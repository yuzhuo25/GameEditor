<template>
  <a-dropdown style="float:left">
    <a
        class="ant-dropdown-link"
        @click="e => e.preventDefault()"
        style="display:inline-block;margin-right: 20px;"
        >
       <SettingOutlined />
    </a>
    <template v-slot:overlay>
      <a-menu>
        <a-menu-item>
          <a @click="setRootFile" href="javascript:;">导入静态资源</a>
        </a-menu-item>
      </a-menu>
    </template>
  </a-dropdown>
  <RootFileDialog v-if="visible" @change-hasroot="reloadData" />
</template>

<script>
const { ipcRenderer } = require('electron')
const { SettingOutlined } = require('@ant-design/icons-vue')
import RootFileDialog from '../RootFileDialog.vue'

export default {
    components: {
        SettingOutlined,
        RootFileDialog
    }, 
    
    data(){
        return {
            visible: false,
        }
    },
    created(){
    },
    methods: {
        /**
         * 向主进程发送导入|更新资源事件
         */
        setRootFile() {
            this.visible = true;
        },

        /**
         * 导入静态资源回调
         */
        reloadData(){
            //关闭对话框
            this.visible = false
            //todo
            //重新加载编辑器数据
        }
    }
};
</script>

