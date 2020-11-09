import PolygonData from '../model/PolygonData';
import Tools from '../../function/Tools';
import AddCollider from '../function/addCollider';
import { PolygonType } from '../common/PolygonType';

/**
 * 多边形脚本
 */
export default class PolygonScript extends Laya.Script {

    // 渲染版本
    public renderVersion: number = -1;
    private _data: PolygonData;
    private _view!: Laya.Sprite3D;

    constructor(data: PolygonData) {
        super();
        this._data = data;
    }

    onAwake(): void {
        this._view = this.owner as Laya.Sprite3D;
    }

    onUpdate(): void {
        if (this.renderVersion !== this._data.renderVersion) {
            // render polygon
            this.cleanAllPoint();
            this.renderPolygon();
            this.renderVersion = this._data.renderVersion;
        }
    }

    private cleanAllPoint(): void {
        this.owner.removeChildren();
    }

    private renderPolygon(): void {
        //像素线
        const pixelLineSprite = new Laya.PixelLineSprite3D(1000);
        //是否显示
        // pixelLineSprite.transform.setWorldLossyScale(new Laya.Vector3(1, 1, 1));
        pixelLineSprite.name = `${this._data.type}_polygonLine_${this._data.id}`;
        this._view.addChild(pixelLineSprite);
        let dataPoints = this._data.points;
        let prePos = undefined;
        for (let i = 0; i < dataPoints.length; i++) {
            const dataPoint = dataPoints[i];
            // 创建point
            let pointCube = new Laya.MeshSprite3D(Laya.PrimitiveMesh.createBox(0.2, 0.4, 0.05));
            pointCube.name = `polygonVertex_${this._data.id}_${i}`;
            const d3Pos = Tools.transLogicCoordTo3DCoord(new Laya.Vector2(dataPoint.x, dataPoint.y));
            pointCube.transform.position = new Laya.Vector3(d3Pos.x, 0, d3Pos.z);
            //添加材质
            let mat = new Laya.PBRStandardMaterial();
            mat.albedoColor = new Laya.Vector4(0, 0, 0, 0);
            pointCube.meshRenderer.sharedMaterial = mat
            // 添加collider
            AddCollider.addCollider(pointCube);
            //判断是否染色
            // if(this._data.currentEditCube === i ) {
               
            // }
            mat.albedoColor = new Laya.Vector4(10, 0, 10, 1);
            //判断是否显示cube
            // if(this._isCreateCube) {
               
            // }
            this._view.addChild(pointCube);
            let lineData = new Laya.PixelLineData()
            let color:Laya.Color;
            
            if (this._data.type.indexOf(PolygonType.WALKABLE) > -1) {
                color = Laya.Color.GREEN;
            }
            else if (this._data.type.indexOf(PolygonType.HOLE) > -1){
                color = Laya.Color.RED;
            }
            else {
                color = Laya.Color.YELLOW;
            }
            
            if (i === dataPoints.length - 1) {
                let currentPos = d3Pos;
                let nextPos = Tools.transLogicCoordTo3DCoord(new Laya.Vector2(dataPoints[0].x, dataPoints[0].y));
                pixelLineSprite.addLine(currentPos, nextPos, color, color);
            }
            else {
                let currentPos = d3Pos;
                let nextPos = Tools.transLogicCoordTo3DCoord(new Laya.Vector2(dataPoints[i + 1].x, dataPoints[i + 1].y));
                pixelLineSprite.addLine(currentPos, nextPos, color, color);
            }
        }
    }

    onDestroy(): void {
    }
}