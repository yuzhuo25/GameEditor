import CurrentEditSceneManager from '@/manager/CurrentEditSceneManager';
import Tool from '@/layaLayer/common/Tool';
import Position from '@/layaLayer/common/Position';
import SetBoundBox from '@/layaLayer/common/SpriteDecorate/SetBoundBox';

/**
 * 为精灵添加多边形
 */

 export default class SetPolygon {
         /**
     * 清理旧的多边形
     * @param spriteId 
     * @param isGear 
     * @param block 
     */
    public static clearPolygon (spriteId: any, isGear: number, block: number) {
        
        const polygons = CurrentEditSceneManager.instance().polygonEditController.polygons;
        
        if (isGear) {
            let i = polygons.length;
            while ( i --) {
                if (polygons[i].type === spriteId + '' || polygons[i].type === `hole_${spriteId}`) {
                    polygons[i].destoryed = true;
                    polygons.splice(i, 1);
                }
            }
            //机关
            polygons.map( (polygon, index) => {
                if (polygon.type === spriteId + '' || polygon.type === `hole_${spriteId}`) {
                    polygon.destoryed = true;
                    polygons.splice(index, 1);
                }
            })
            
        }
        else {
            //地物
            //默认是hole类型
            if (block) {
                for ( let i = 0; i < polygons.length; i ++){
                    if (polygons[i].type === `hole_${spriteId}`) {
                        polygons[i].destoryed = true;
                        polygons.splice(i, 1)
                    }
                }
            }
            else {
                for ( let i = 0; i < polygons.length; i ++){
                    if (polygons[i].type === `walkable_${spriteId}`) {
                        polygons[i].destoryed = true;
                        polygons.splice(i, 1)
                    }
                }
            }
        }
    }

    /**
     * 添加多边形
     * @param spriteId 父级精灵的id，机关阻挡区的判断依据
     * @param _Scale 坐标扭曲参数
     * @param _Offset 坐标扭曲参数
     */
    public static addPolygon(sprite: Laya.MeshSprite3D | Laya.SkinnedMeshSprite3D, spriteId: any, isGear: number, block: number, isShowTriangle?: boolean) {
        const showTriangle = isShowTriangle === false ? false : true;
        const corners = SetBoundBox.getSkewCorners(sprite);
        if(!corners.length) {
            return;
        }
        
        let originCor7: any = Tool.trans3DCoordToLogicCoord(corners[7]);
        let originCor6: any = Tool.trans3DCoordToLogicCoord(corners[6]);
        let originCor2: any = Tool.trans3DCoordToLogicCoord(corners[2]);
        let originCor3: any = Tool.trans3DCoordToLogicCoord(corners[3]);
        let cor7: any = new Position(parseFloat(originCor7.x.toFixed(3)), parseFloat(originCor7.y.toFixed(3)) );
        let cor6: any = new Position(parseFloat(originCor6.x.toFixed(3)), parseFloat(originCor6.y.toFixed(3)) );
        let cor2: any = new Position(parseFloat(originCor2.x.toFixed(3)), parseFloat(originCor2.y.toFixed(3)) );
        let cor3: any = new Position(parseFloat(originCor3.x.toFixed(3)), parseFloat(originCor3.y.toFixed(3)) );
        const points = [cor7, cor6, cor2, cor3];
        //清理旧的多边形
        let gearTypeId = spriteId;
        const polygons = CurrentEditSceneManager.instance().polygonEditController.polygons;
        const id = polygons.length ? polygons[polygons.length - 1].id + 1 : 0
        //绘制多边形
        if (isGear) {
            //机关
            CurrentEditSceneManager.instance().polygonEditController.createPolygon(points, id, gearTypeId + '', false, showTriangle);
        }
        else {
            //地物
            //默认是hole类型
            if (block) {
                CurrentEditSceneManager.instance().polygonEditController.createPolygon(points, id, `hole_${gearTypeId}`, false, showTriangle);
            }
            else {
                CurrentEditSceneManager.instance().polygonEditController.createPolygon(points, id, `walkable_${gearTypeId}`, false, showTriangle);
            }
        }
        //预设多边形索引递增
        CurrentEditSceneManager.instance().editorLevelData.polygonShapeIndex = id + 1;
    }
 }