<template>
    <!-- <div></div> -->
</template>

<script>
    
	// import BaseVertexOffsetMaterial from '@/shader/BaseVertexOffsetMaterial';
	// import GridHelpMaterial from '@/shader/GridHelpMaterial';
	// import KKCartoonMaterial from '@/shader/KKCartoonMaterial';
	// import KKCartoonRimDirMaterial from '@/shader/KKCartoonRimDirMaterial';
	// import KKCartoonShadowTexMaterial from '@/shader/KKCartoonShadowTexMaterial';
	// import KKCartoonShadowTexRimDirMaterial from '@/shader/KKCartoonShadowTexRimDirMaterial';
	// import KKCartoonVertexOffSetMaterial from '@/shader/KKCartoonVertexOffSetMaterial';
	// import KKGroundMaterial from '@/shader/KKGroundMaterial';
	// import KKNumberMaterial from '@/shader/KKNumberMaterial';
	// import KKMeshEffectMaterial from '@/shader/KKMeshEffectMaterial';
	// import KKMeshEffectVertexOffSetMaterial from '@/shader/KKMeshEffectVertexOffSetMaterial';
	// import KKMeshEffectDistortMaterial from '@/shader/KKMeshEffectDistortMaterial';
    // import StaticData from '@/layaLayer/EditorData/StaticData';

export default {
    mounted () {
        const pixelRatio = window.devicePixelRatio;
        const stage_w = 1920;
        const stage_h = 1040;
        const offset_l = 200;
        const offset_t = 100;
        let window_w = window.innerWidth;
        let window_h = window.innerHeight;
        let canvasW = (window_w - offset_l) * pixelRatio;
        let canvasH = 1040 * this.window_w / 1920;

        //配置laya舞台
        this.initStage(stage_w, stage_h);

        const canvasDiv = document.getElementById("layaContainer");
        canvasDiv.style.width = `${canvasW}px`;
        canvasDiv.style.height = `${canvasH}px`;
        canvasDiv.style.transformOrigin = "0 0";
        canvasDiv.style.transform = `scale(${canvasW/stage_w})`;
        canvasDiv.style.position = "absolute";
        canvasDiv.style.top = `${offset_t}px`;
        canvasDiv.style.left = `${offset_l}px`;

        window.onresize = () => {
            window_w = window.innerWidth;
            window_h = window.innerHeight;
            let canvasW = (window_w - offset_l) * pixelRatio;
            let canvasH = 1040 * this.window_w / 1920;
            canvasDiv.style.width = `${canvasW}px`;
            canvasDiv.style.height = `${canvasH}px`;
            canvasDiv.style.transform = `scale(${canvasW/stage_w})`;
        }
    },
    methods: {
        /**
         * 向主进程发送导入|更新资源事件
         */
        setRootFile() {
            this.visible = true;
        },

         /**
         * 初始化stage
         */
        initStage(width, height) {
            //初始化舞台
            if (window["Laya3D"]) {
                Laya3D.init(width, height);		
            } else {
                Laya.init(width, height, Laya["WebGL"]);
            }
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
<style>

</style>

