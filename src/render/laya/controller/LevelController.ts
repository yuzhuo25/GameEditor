import LevelData from '../model/LevelData';

/* 新建|导入关卡 */

export default class LevelController {

    private _levelData:LevelData

    constructor(dataJson?: LevelData) {
        this._levelData = dataJson ? new LevelData(dataJson) : new LevelData();
    }

    public getLevelData() {
        return this._levelData;
    }
    // public static createLevel(dataJson?: LevelData) {
    //     if(dataJson) {
            
    //     }
    // }


}