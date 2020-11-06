<template>
  <a-dropdown style="float: right">
    <a class="ant-dropdown-link" @click="e => e.preventDefault()">关卡列表 <DownOutlined /> </a>
    <template v-slot:overlay>
      <a-menu>
        <a-menu-item v-for="levelItem in levelMap" :key="levelItem.id">
         <small>{{levelItem.name}}</small> 
        </a-menu-item>
        <!-- <a-menu-item key="1">
          <a href="http://www.taobao.com/">2nd menu item</a>
        </a-menu-item>
        <a-menu-divider />
        <a-menu-item key="3">
          3rd menu item
        </a-menu-item> -->
      </a-menu>
    </template>
  </a-dropdown>
</template>
<script>
const { DownOutlined } = require('@ant-design/icons-vue');
import ConfigData from "../../../function/ConfigData";
import {ref} from "vue"

export default {
setup() {
    const levelMap = ref([]);
    ConfigData.getLevelList()
        .then((data) => {
            let getLevelsPromise = [];
            data.levelListRes.map( (levelFileName) => {
                getLevelsPromise.push(ConfigData.readSingleLevel(levelFileName));
            })

            Promise.all(getLevelsPromise)
            .then( (levelDatas) => {
                //过滤出所有normal关卡
                let filterData = levelDatas.filter((item) => item.type === 'normal' && item.levelClass > 0);
                levelMap.value = levelMap.value.concat(filterData.sort( (infoData, nextInfoData) => infoData.levelClass - nextInfoData.levelClass));
                console.log('[LevelMap] [getLevelList] [所有关卡数据列表]', levelMap.value)
            })
        })
    return {
        levelMap
    }
},
  components: {
    DownOutlined,
  },
};
</script>
