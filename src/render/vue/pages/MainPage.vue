<template>
  <a-layout id="components-layout-demo-top-side-2">
    <a-layout-header class="header">
      <Sets />
      <a-menu
        theme="dark"
        mode="horizontal"
        :default-selected-keys="['scene']"
        :style="{ lineHeight: '64px' }"
        @click="changeTab"
      >
        <a-menu-item key="scene">
          舞台配置
        </a-menu-item>
        <a-menu-item key="code">
          代码配置
        </a-menu-item>
        <a-menu-item key="info">
          信息配置
        </a-menu-item>
      </a-menu>
    </a-layout-header>
    <a-layout  v-if="currentTab==='scene'">
      <!-- 树形结构 start -->
    
      <!-- 树形结构 end -->
       <Scene />
    </a-layout>
    <a-layout v-if="currentTab==='code'">
      <a-layout-content
          :style="{ background: '#fff', padding: '24px', margin: 0, minHeight: '280px' }"
        >
          Content
        </a-layout-content>
    </a-layout>
    <a-layout v-if="currentTab==='info'">
      <a-layout-content
          :style="{ background: '#fff', padding: '24px', margin: 0, minHeight: '280px' }"
        >
          Content
        </a-layout-content>
    </a-layout>
  </a-layout>
</template>
<script>
import Thumbnail from "../common/Thumbnail.vue";
import Sets from "../components/globalCommponents/Sets.vue";
import Scene from "../components/scene/Scene.vue"

export default {
  components: {
    Thumbnail,
    Sets,
    Scene
  },
  data() {
    return {
      collapsed: false,
      currentTab: "scene"
    };
  },
  methods: {
    changeTab(e) {
      this.currentTab = e.key;
      //显隐舞台
      this.toggleStage();
    },

    toggleStage() {
      const canvasDiv = document.getElementById("layaContainer");
      canvasDiv.style.display = this.currentTab=="scene" ? "block" : "none";
    }
  }
};
</script>

<style>
#components-layout-demo-top-side-2 .logo {
  width: 120px;
  height: 31px;
  background: rgba(255, 255, 255, 0.2);
  margin: 16px 28px 16px 0;
  float: left;
}
.ant-menu-horizontal {
  display: inline-block;
}
</style>