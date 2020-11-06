<template>
  <div>
    <a-collapse accordion>
      <a-collapse-panel
        v-for="(typeres, index) in tree_list"
        :key="index"
        :header="typeres.type">

        <ul class="thumbList">
              <li
                v-for="(sprite_name, _index) in typeres.list"
                :key="_index"
                :class="active?'active': ''">
                <!-- <Thumbnail
                  :url="`file://${root_f}editor_res/${typeres.type}/${thumbnail_list[0][typeres.type][sprite_name]}`"
                /> -->
                <Thumbnail
                  @click="console.log('[Thumbnail] [click]')"
                  :url="`/editor_res/${typeres.type}/${thumbnail_list[0][typeres.type][sprite_name]}`"
                  :type="typeres.type"
                  :name="sprite_name"
                  :active="''"
                />
             </li>
        </ul>
      </a-collapse-panel>
    </a-collapse>
  </div>
</template>
<script>

import {ref} from "vue"
import Thumbnail from '../../common/Thumbnail.vue';
import ConfigData from "../../../function/ConfigData";
const { MailOutlined, AppstoreOutlined, SettingOutlined } = require('@ant-design/icons-vue');

export default {

  setup() {
    //根目录
    const root_f = ref(localStorage.getItem("rootFile"));

    //精灵结构
    let tree_list = ref([]); 
    const initTree = async function() {
      tree_list.value = tree_list.value.concat(await ConfigData.instance().setSpriteTree());
    }
     initTree();

     //缩略图结构
    let thumbnail_list = ref([]);
    const initThumbnailList = async function () {
        thumbnail_list.value = thumbnail_list.value.concat(await ConfigData.instance().getThumbnail());
        console.log("thumbnail_list.value", thumbnail_list.value)
			};
    initThumbnailList();

    return {
      root_f,
      tree_list,
      thumbnail_list
    }
  },
  components: {
    MailOutlined,
    AppstoreOutlined,
    SettingOutlined,
    Thumbnail
  },
  data() {
    return {
      current: ['mail'],
    };
  },
};
</script>
<style>
.thumbList {
  padding-inline-start: 6px;
}
.thumbList li {
  height: 40px;
  width: 40px;
  box-sizing: border-box;
  display:inline-block;
}
.thumbnail_sprite .active{
  border:1px solid slateblue;
}
</style>

