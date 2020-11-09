import GameData from './GameData'
import Tools from '../../function/Tools';

export default class LevelData {

    private levelId = "";
    private levelName = "新关卡";
    private mapName = "";
    private mapScale = 1;
    private tips = "";
    private gameData: GameData

    constructor(dataJson?: LevelData) {
        
        if(dataJson) {
            this.levelId = dataJson.levelId;
            this.levelName = dataJson.levelName;
            this.mapName = dataJson.mapName;
            this.mapScale = dataJson.mapScale;
            this.tips = dataJson.tips;
            this.gameData = new GameData(dataJson.gameData);
        } else {
            this.levelId = Tools.generateUUID();
            this.gameData = new GameData();
        }
    }

    public getLevelId() {
        return this.levelId;
    }

    public setLevelName(_levelName: string) {
        this.levelName = _levelName;
    }
    public getLevelName() {
        return this.levelName;
    }

    public setMapName(_mapName: string) {
        this.mapName = _mapName;
    }
    public getMapName() {
        return this.mapName;
    }

    public setMapScale(_mapScale: number) {
        this.mapScale = _mapScale;
    }
    public getMapScale() {
        return this.mapScale;
    }



    
    
}