<template>
  <div>
    <a-modal v-model:visible="showModal" title="新建关卡" @ok="handleOk" okText="新建" cancelText="取消">
       <p>
            <a-row>
                <a-col :span="12">
                    地图：
                </a-col>
                <a-col :span="12">
                    <a-select
                        v-model:value="mapName"
                        show-search
                        option-filter-prop="children"
                        style="width: 200px"
                        @change="changeSceneMap"
                        >
                        <a-select-option
                            v-for="(mapitem, index) in sceneMaps"
                            :key="mapitem.value + index"
                            :value="mapitem.value">
                            {{mapitem.label}}
                        </a-select-option>
                    </a-select>
                </a-col>
            </a-row>
       </p>
       <p>
           <a-row>
                <a-col :span="12">
                    关卡名称：
                </a-col>
                <a-col :span="12">
                    <a-input v-model:value="levelName" />
                </a-col>
            </a-row>
       </p>
        <p>
            <a-row>
                <a-col :span="12">
                    模型缩放：
                </a-col>
                <a-col :span="12">
                    <a-input-number size="mini" :step="0.1" v-model:value="mapScale" />
                </a-col>
            </a-row>
        </p>
    </a-modal>
  </div>
</template>
<script>
import ConfigData from "../../../function/ConfigData";
import {ref} from "vue";
import CurrentLevelManager from "../../../laya/manager/CurrentLevelManager"
import CurrentScene from "../../../laya/scene/CurrentScene"
const { ipcRenderer } = require('electron');

const root_f = localStorage.getItem("rootFile");

export default {
    setup() {
        const showModal = ref(false)
        ipcRenderer.on("CREATE_LEVEL", (event, arg) => {
            console.log("[MenuSet] [MenuType.CREATE_LEVEL]")
            showModal.value = true;
        })

        const sceneMaps = ref([]);
        ConfigData.getSceneMapList()
            .then((data) => {
                console.log("[NewModel] [sceneMaps]", data)
                sceneMaps.value = sceneMaps.value.concat(data);
            }) 
        
        let mapName = ref("");
        let levelName = ref("");
        let mapScale = ref(1);

        return {
            showModal,
            sceneMaps,
            mapName,
            levelName,
            mapScale
        }
    },

    methods: {
        handleOk() {
            this.showModal = false;
            //创建一个新关卡
        },
        changeSceneMap() {
            //舞台创建
            const mapUri = `level_res/bg_map/${this.mapName}`;
            console.log("[NewLevelModal] [changeSceneMap]",mapUri);

            //加载默认场景
            Laya.loader.create(mapUri, Laya.Handler.create(this, _ => {
                const texture = Laya.loader.getRes(mapUri);
                if(texture) {
                    let currentScene = CurrentScene.createCurrentScene(texture);
                    CurrentLevelManager.instance().setEditScene(currentScene);
                    Laya.stage.addChild(currentScene.scene3D);
                    console.log(Laya.stage);
                } else {
                    console.warn('[加载背景图失败]');
                }
            }));
        }
       
        // filterOption(input, option) {
        //     return option.props.value.toLowerCase().indexOf(input.toLowerCase()) >= 0;
        // },
    },
};
</script>
