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

    components: {
    }, 
    props: ['isCurrentTab'],
    
    data(){
        return {
            visible: false,
        }
    },
    created(){
        

    },
    mounted () {
        const pixelRito = window.devicePixelRatio;
        const canvas_w = 1920;
        const canvas_h = 1040;
        const offset_l = 200;
        const offset_t = 64;
        let window_w = window.innerWidth;
        let window_h = window.innerHeight;

        //配置laya舞台
        this.initStage(canvas_w * pixelRito, canvas_h * pixelRito);

        const canvasDiv = document.getElementById("layaContainer");
        canvasDiv.style.width = `${canvas_w}px`;
        canvasDiv.style.height = `${canvas_h}px`;
        canvasDiv.style.transformOrigin = "0 0";
        canvasDiv.style.transform = `scale(${(window_w - offset_l)/canvas_w}, ${(window_h - offset_t)/canvas_h})`;
        canvasDiv.style.position = "absolute";
        canvasDiv.style.top = "64px";
        canvasDiv.style.left = "200px";
        window.onresize = () => {
            window_w = window.innerWidth;
            window_h = window.innerHeight;
            canvasDiv.style.transform = `scale(${(window_w - offset_l)/canvas_w}, ${(window_h - offset_t)/canvas_h})`;
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


