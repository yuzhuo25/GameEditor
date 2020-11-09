import CurrentLevelManager from '../manager/CurrentLevelManager';
import Constants from '../common/Constants';
import AddCollider from '../function/addCollider';
import KKGroundMaterial from '../shader/KKGroundMaterial';

/**
 * 编辑器使用的Scene3D封装
 */
export default class CurrentScene {

    /*  */
    public scene3D!: Laya.Scene3D

    /*  */
    public camera!: Laya.Camera;

    public leveLight!: Laya.DirectionLight;

    /*  */
    public container3D!: Laya.Sprite3D;

    /* 多边形容器 */
    public polygonShapesNode!: Laya.Sprite3D;

    /* 3d精灵容器 */

    public allSpritesNode!: Laya.Sprite3D;

    /* */
    private _texture: Laya.Texture2D | null;

    private static d3_w: number = 0
    private static d3_h: number = 0

    private static _instance: CurrentScene;

    private constructor() {
        // this.container3D = null;
        this._texture = null;
    }

    public static instance(): CurrentScene {
        if (!this._instance) {
            this._instance = new CurrentScene();
        }
        return this._instance;
    }

    /**
     * 根据传入的背景图创建编辑器使用的编辑Scene对象
     * @param texture 
     */
    public static createCurrentScene(texture: Laya.Texture2D): CurrentScene {
        if (!texture) {
            throw new Error('create EditScene obj. texture can not undefined or null');
        }
        let currentScene: CurrentScene = new CurrentScene();
        currentScene._texture = texture;
        const _currentConfig = CurrentLevelManager.instance().currentConfig;
        _currentConfig.planeWidth = texture.width * Constants.PIXEL_3D_RATIO;
        _currentConfig.planeHeight = texture.height * Constants.PIXEL_3D_RATIO;
        this.d3_w = texture.width * Constants.PIXEL_3D_RATIO;
        this.d3_h = texture.height * Constants.PIXEL_3D_RATIO;
        currentScene.scene3D = new Laya.Scene3D();
        currentScene.scene3D.ambientColor = new Laya.Vector3(0.5, 0.5, 0.5);
        currentScene.initContainer();
        currentScene.initCamera();
        currentScene.initLight();
        currentScene.initPlane();
        return currentScene;
    }

    /**
     * 初始化灯光
     */
    private initLight(): void {
        if (this.scene3D === null) {
            // warn
            return;
        }
        // 灯光 TODO 测试全用的不受光材质
        this.leveLight = new Laya.DirectionLight();
        this.scene3D.addChildAt(this.leveLight, 1);
        this.leveLight.color = new Laya.Vector3(1, 1, 1);
        // TODO 灯光可能是需要编辑的
        this.leveLight.transform.localRotationEulerX = -38.3;
        this.leveLight.transform.localRotationEulerY = -21.5;
        this.leveLight.transform.localRotationEulerZ = -17.453508858545838;
        // 开启
        //灯光开启阴影
        this.leveLight.shadow = true;
        //可见阴影距离
        this.leveLight.shadowDistance = 55;
        //生成阴影贴图尺寸
        this.leveLight.shadowResolution = 1024;
        //生成阴影贴图数量
        this.leveLight.shadowPSSMCount = 1;
        //模糊等级,越大越高,更耗性能
        this.leveLight.shadowPCFType = 3;
        this.leveLight.transform.rotate(new Laya.Vector3(0, 0, 0), false, false);
    }

    /**
     * 初始化相机
     */
    private initCamera(): void {
        if (this.scene3D === null) {
            // warn
            return;
        }
        const _currentConfig = CurrentLevelManager.instance().currentConfig;
        //初始化照相机
        this.camera = new Laya.Camera(0, 0.1, 10000);
        this.camera.name = `camera`;
        this.camera.orthographic = true;
        this.camera.orthographicVerticalSize = _currentConfig.planeHeight;
        // 设置相机旋转,(相机是朝向-Z的)
        this.camera.transform.localRotationEuler = new Laya.Vector3(0 - Constants.CAMERA_SIGHT_ELEVATION_ANGLE, 0, 0);
        // 相机移动,正对plane中心，移动一定距离
        this.camera.transform.translate(new Laya.Vector3(_currentConfig.planeWidth / 2, 0, _currentConfig.planeHeight), false);
        this.camera.transform.translate(new Laya.Vector3(0, 0, 20), true);
        //fieldOfView会影响阴影图范围，值越小，阴影图范围越小，阴影越精细，配合shadowDistance 设置
        this.camera.fieldOfView = 23;
        // 适配高度

        this._texture && (this.camera.viewport = new Laya.Viewport(0, 0, this.camera.viewport.height / (this._texture.height / this._texture.width), this.camera.viewport.height));
        this.camera.viewport = new Laya.Viewport(0, 0, 1920, 1040);

        this.camera.clearFlag = Laya.BaseCamera.CLEARFLAG_SOLIDCOLOR;
        // this.camera.clearColor = new Laya.Vector4(0, 0, 0, 1);
        this.scene3D.addChildAt(this.camera, 0);
    }

    /**
     * 创建容器
     */
    private initContainer(): void {

        if (this.scene3D === null) {
            // warn
            return;
        }
        // 3D容器
        this.container3D = new Laya.Sprite3D();
        this.container3D.name = 'container3D';

        // 创建多边形容器
        this.polygonShapesNode = new Laya.Sprite3D();
        this.polygonShapesNode.name = 'polygonShapesNode';

        //创建3d精灵容器
        this.allSpritesNode = new Laya.Sprite3D();
        this.allSpritesNode.name = 'allSpritesNode';

        //默认隐藏多边形容器
        this.polygonShapesNode.transform.scale = new Laya.Vector3(0, 0, 0);

        this.scene3D.addChild(this.container3D);
        this.container3D.addChild(this.polygonShapesNode);
        this.container3D.addChild(this.allSpritesNode);
    }

    /**
     * 3dplane
     */
    private initPlane(): void {

        if (this._texture === null || this.container3D === null) {
            // warn
            console.warn(`[CurrentScene] [initPlane] [纹理未添加成功] [${this._texture}]`);
            return;
        }
        const _currentConfig = CurrentLevelManager.instance().currentConfig;

        const plane3D: Laya.MeshSprite3D = new Laya.MeshSprite3D(Laya.PrimitiveMesh.createPlane(_currentConfig.planeWidth, _currentConfig.planeHeight * 2, 1, 1));
        plane3D.name = 'plane3D';

        let planeMat: KKGroundMaterial = new KKGroundMaterial();

        planeMat.albedoTexture = this._texture;
        plane3D.meshRenderer.material = planeMat;
        planeMat.albedoIntensity = 1;
        plane3D.meshRenderer.receiveShadow = true;
        plane3D.transform.translate(new Laya.Vector3(_currentConfig.planeWidth / 2, 0, _currentConfig.planeHeight * 2 / 2), true);
        //添加碰撞器
        AddCollider.addCollider(plane3D)
        this.container3D.addChild(plane3D);
    }

    /* 切换场景贴图 */
    public static changeTexture(_texture: Laya.Texture2D) {

        let _currentScene: CurrentScene = CurrentLevelManager.instance().currentScene;

        if (!_currentScene) {
            console.warn("[CurrentScene] [changeTexture] [当前舞台为空]！");
            return;
        }
        _currentScene.chearPlane();
        _currentScene._texture = _texture;
        _currentScene.initPlane();
    }

    /* 清理旧场景贴图 */
    private chearPlane() {
        let _currentScene: CurrentScene = CurrentLevelManager.instance().currentScene;
        const plane = _currentScene.container3D.getChildByName("plane3D");
        plane && plane.destroy(true);
    }

}
