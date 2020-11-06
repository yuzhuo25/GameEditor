<template>

    <a-layout-sider width="200" style="background: #fff">
        <TreeSprites />
    </a-layout-sider>
    <a-layout>
        <a-layout-content>
            <div class="topHanbur">
                <a-radio-group style="float:left" :value="scene_tab" @change="handleSizeChange">
                    <a-radio-button value="sprite">
                    编辑精灵
                    </a-radio-button>
                    <a-radio-button value="stage">
                    编辑场景
                    </a-radio-button>
                </a-radio-group>
                <LevelMap />
            
            </div>
            <!-- 头部菜单 -->
             <Stage :isCurrentTab="tabKey === 'scene'" />
        </a-layout-content>
    </a-layout>
 
</template>

<script>
import TreeSprites from "./TreeSprites.vue";
import Stage from "./Stage.vue";
import LevelMap from "./LevelMap.vue";

export default {
  components: {
    TreeSprites,
    Stage,
    LevelMap
  },
  props: ["tabKey"],

  data() {
    return {
      visible: false,
      scene_tab: 'sprite'
    };
  },
  created() {},
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
    reloadData() {
      //关闭对话框
      this.visible = false;
      //todo
      //重新加载编辑器数据
    },
    /**
     * 
     */
    handleSizeChange(e) {
        this.scene_tab = e.target.value;
    }
  }
};
</script>
<style>
.topHanbur {
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: space-between;
}
</style>


