import PolygonController from '../controller/PolygonController'
import LevelController from '../controller/LevelController'
import CurrentConfig from '../data/CurrentConfig';
import CurrentScene from '../scene/CurrentScene';

export default class StageManager {
    private static _instance: StageManager;
    private _polygonController: PolygonController;
    private _levelController: LevelController;
    private _currentConfig: CurrentConfig;
    private _currentScene!: CurrentScene

    // private _scene:

    constructor() {
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


    public static instance(): StageManager {
        if (!this._instance) {
            this._instance = new StageManager();
        }
        return this._instance;
    }
}