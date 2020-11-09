import PolygonData from '../model/PolygonData';
import Position from '../common/Position';
import PolygonScript from '../script/PolygonScript';

export default class PolygonController {

    private _polygons: PolygonData[]
    constructor() {
        this._polygons = [];
    }

    public createPolygon(polygonId: number, points: Position[], type: string) {
        const data: PolygonData = new PolygonData(polygonId, points, type);

        const view: Laya.Sprite3D = new Laya.Sprite3D();
        // 约定 数据对象的id和显示对象的name相同 
        // view.name = data.id + "";
        view.name = `${data.id}_${type}`;

        // 绑定数据对象和视图对象关联的脚本
        view.addComponentIntance(new PolygonScript(data));
        // 添加到数据管理
        this._polygons.push(data);
        // 添加到显示
        // CurrentEditSceneManager.instance().editScene.polygonShapesNode.addChild(view);
    }
}