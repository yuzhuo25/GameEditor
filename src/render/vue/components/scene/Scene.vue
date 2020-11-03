<template>

    <a-layout-sider width="200" style="background: #fff">
        <TreeSprites />
    </a-layout-sider>
    <a-layout>
        <a-layout-content style="height:calc(100%-200px);width:calc(100%-64px)">
            <Stage :isCurrentTab="tabKey === 'scene'" />
        </a-layout-content>
    </a-layout>
 
</template>

<script>
import TreeSprites from './TreeSprites.vue'
import Stage from './Stage.vue'

export default {
    components: {
        TreeSprites,
        Stage,
    }, 
    props: ['tabKey'],
    
    data(){
        return {
            visible: false,
        }
    },
    created(){    },
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

