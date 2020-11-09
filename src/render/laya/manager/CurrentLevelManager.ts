import PolygonController from '../controller/PolygonController'
import LevelController from '../controller/LevelController'
import CurrentConfig from '../data/CurrentConfig';
import CurrentScene from '../scene/CurrentScene';

export default class CurrentLevelManager {
    private static _instance: CurrentLevelManager;
    private _polygonController: PolygonController;
    private _levelController: LevelController;
    private _currentConfig: CurrentConfig;
    private _currentScene!: CurrentScene;
    private _stage!: Laya.Stage;

    // private _scene:

    constructor() {
        this._stage = Laya.stage;
        this._polygonController = new PolygonController();
        this._levelController = new LevelController();
        this._currentConfig = new CurrentConfig();
    }

    get polygonConotroller() {
        return this._polygonController;
    }

    get levelController() {
        return this._levelController;
    }

    get currentConfig() {
        return this._currentConfig;
    }

    get currentScene() {
        return this._currentScene;
    }

    set currentScene(currentScene: CurrentScene) {
        // 关闭之前可能存在的
        this.closeCurrentScene();

        this._currentScene = currentScene;
        this._currentScene.scene3D.name = 'editScene';
        Laya.stage.addChild(this._currentScene.scene3D);
        // console.log(`[CurrentEditSceneManager] [setEditScene] [设置新的当前编辑scene]`);

        //开启舞台监听
        this.mouseListener();

        //2d
        let scene = new Laya.Scene();
        scene.name = 'TxtScene';
        scene.zOrder = 10000;
        Laya.stage.addChild(scene);
    }

    get stage() {
        return this._stage;
    }

    /**
     * 
     */
    public closeCurrentScene(): void {
        // console.log(`[CurrentEditSceneManager] [closeEditScene] [销毁旧的编辑器Scene]`);
        let oldScene = Laya.stage.getChildByName('currentScene');
        if (oldScene) {
            Laya.stage.removeChild(oldScene);
            oldScene.destroy(true);
            //关闭舞台事件监听
            this.closeMouseListener();
        }
        //2d场景
        let oldScene2d = Laya.stage.getChildByName('TxtScene');
        if(oldScene2d) {
            Laya.stage.removeChild(oldScene2d);
            oldScene2d.destroy(true);
        }
        //释放显存
        Laya.Resource.destroyUnusedResources();
    }

    /**
     * 舞台事件监听
     */
    private mouseListener() {
        // Laya.stage.on(Laya.Event.MOUSE_MOVE, this, this.stageMouseMove)
        // Laya.stage.on(Laya.Event.MOUSE_UP, this, this.stageMouseUp)
        // Laya.stage.on(Laya.Event.MOUSE_DOWN, this, this.stageMouseDown)
        // Laya.stage.on(Laya.Event.MOUSE_OUT, this, this.stageMouseout);
        // Laya.stage.on(Laya.Event.KEY_DOWN, this, this._onKeyDown);
        // Laya.stage.on(Laya.Event.KEY_UP, this, this._onKeyUp);
    }

     /**
     * 关闭舞台事件监听
     */
    private closeMouseListener() {
        Laya.stage.offAll();
    }


    public static instance(): CurrentLevelManager {
        if (!this._instance) {
            this._instance = new CurrentLevelManager();
        }
        return this._instance;
    }
}