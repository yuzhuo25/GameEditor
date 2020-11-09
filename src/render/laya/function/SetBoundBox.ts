/**
 * 设置选中的精灵的红色包围盒子
 * 根据精灵的子级boundbox
 */

export default class SetBoundBox {
    /**
    * 根据模型的bound信息获取扭曲后的bound顶点
    */
    public static getSkewCorners(sprite: Laya.MeshSprite3D | Laya.SkinnedMeshSprite3D): Laya.Vector3[] {

        let bound;
        const parent = sprite.parent as Laya.Sprite3D;
        if ((sprite instanceof Laya.MeshSprite3D) && ((sprite.name === 'boundbox') || sprite.name === 'boundbox_block')) {
            bound = sprite.meshFilter.sharedMesh.bounds._boundBox;//自身坐标
        }
        else {
            bound = null;
            return [];
        }

        //8个local坐标
        let _corners: Laya.Vector3[] = [];
        bound.getCorners(_corners);
        let centerConer = new Laya.Vector3();
        let mat = sprite.transform.worldMatrix;
        let newCorner: any = [];
        //
        let extendX = 0;
        let extendZ = 0;

        _corners.map((_corner) => {
            const boundBoxVertexWorldPos = new Laya.Vector3();
            //8个顶点转世界坐标
            Laya.Vector3.transformV3ToV3(_corner, mat, boundBoxVertexWorldPos);
            let resPos = new Laya.Vector3();
            Laya.Vector3.add(boundBoxVertexWorldPos, new Laya.Vector3(extendX, 0, extendZ), resPos);
            newCorner.push(new Laya.Vector3(resPos.x, resPos.y, resPos.z));
        })
        //变换常量
        const _Scale = CoordUtil.scale;
        const _Offset = CoordUtil.offset;
        const w_pos = parent.transform.position;
        //碰撞比例
        // //获取扭曲后的八个顶点
        for(let i = 0; i < 8; i ++){
            newCorner[i] = Tool.skew3DVoord(new Laya.Vector3(newCorner[i].x, newCorner[i].y, newCorner[i].z), w_pos, _Scale, _Offset);
        }
        return newCorner;
    }

/**
 * 机关、地物添加包围盒
 * @param sprite 网格模型  sprite 须是boundbox,否则返回
 */
    public static setBoundpixel(sprite: Laya.MeshSprite3D | Laya.SkinnedMeshSprite3D, noClearBound?:boolean) {
        if (!sprite) {
            return;
        }
        const _corners = this.getSkewCorners(sprite);
        if (!_corners.length) {
            return;
        }
        //销毁旧的包围盒
        if(!noClearBound){
            this.clearBoundpixel();
        }
       
        //绘制像素精灵
        const parent = sprite.parent as Laya.Sprite3D;
        const container = CurrentEditSceneManager.instance().editScene.container3D;
        let lineSprite3D = container.addChild(new Laya.PixelLineSprite3D(60000)) as Laya.PixelLineSprite3D;
        lineSprite3D.transform.rotationEuler.y = parent.transform.localRotationEulerY;
        lineSprite3D.name = 'boundpixel';
        let color = Laya.Color.RED;
        lineSprite3D.addLine(_corners[0], _corners[1], color, color);
        lineSprite3D.addLine(_corners[1], _corners[2], color, color);
        lineSprite3D.addLine(_corners[2], _corners[3], color, color);
        lineSprite3D.addLine(_corners[3], _corners[0], color, color);
        lineSprite3D.addLine(_corners[4], _corners[5], color, color);
        lineSprite3D.addLine(_corners[5], _corners[6], color, color);
        lineSprite3D.addLine(_corners[6], _corners[7], color, color);
        lineSprite3D.addLine(_corners[7], _corners[4], color, color);
        lineSprite3D.addLine(_corners[0], _corners[4], color, color);
        lineSprite3D.addLine(_corners[1], _corners[5], color, color);
        lineSprite3D.addLine(_corners[2], _corners[6], color, color);
        lineSprite3D.addLine(_corners[3], _corners[7], color, color);
        lineSprite3D.transform.localPosition = new Laya.Vector3(0, 0, 0);
        //默认显示
        lineSprite3D.active = true;
    }

    /**
     * 自定义bound
     */
    public static drawCustomBound(spritePos: Laya.Vector3, noClearBound?:boolean){
        //销毁旧的包围盒
        if(!noClearBound){
            this.clearBoundpixel();
        }
        //绘制像素精灵
        // const parent = sprite.parent as Laya.Sprite3D;
        const container = CurrentEditSceneManager.instance().editScene.container3D;
        let lineSprite3D = container.addChild(new Laya.PixelLineSprite3D(60000)) as Laya.PixelLineSprite3D;
       
        lineSprite3D.name = 'boundpixel';
        const color = Laya.Color.RED;
        const size = 0.4;
        const height = 6;
        const bottom = 0;
        lineSprite3D.addLine(new Laya.Vector3(spritePos.x - size, height, spritePos.z),new Laya.Vector3(spritePos.x - size, bottom, spritePos.z), color, color);
        lineSprite3D.addLine(new Laya.Vector3(spritePos.x, height, spritePos.z - size),new Laya.Vector3(spritePos.x, bottom, spritePos.z - size), color, color);
        lineSprite3D.addLine(new Laya.Vector3(spritePos.x + size, height, spritePos.z),new Laya.Vector3(spritePos.x + size, bottom, spritePos.z), color, color);
        lineSprite3D.addLine(new Laya.Vector3(spritePos.x, height, spritePos.z + size),new Laya.Vector3(spritePos.x, bottom, spritePos.z + size), color, color);
        lineSprite3D.addLine(new Laya.Vector3(spritePos.x - size, height, spritePos.z),new Laya.Vector3(spritePos.x, height, spritePos.z - size), color, color);
        lineSprite3D.addLine(new Laya.Vector3(spritePos.x, height, spritePos.z - size),new Laya.Vector3(spritePos.x + size, height, spritePos.z), color, color);
        lineSprite3D.addLine(new Laya.Vector3(spritePos.x + size, height, spritePos.z),new Laya.Vector3(spritePos.x, height, spritePos.z + size), color, color);
        lineSprite3D.addLine(new Laya.Vector3(spritePos.x, height, spritePos.z + size),new Laya.Vector3(spritePos.x - size, height, spritePos.z), color, color);
        
        lineSprite3D.transform.localPosition = new Laya.Vector3(0, 0, 0);
        //默认显示
        lineSprite3D.active = true;
    }

 /**
 * 销毁旧的boundpixel
 * 
 */
    public static clearBoundpixel() {
        const parent = CurrentEditSceneManager.instance().editScene.container3D;
        //循环删除所有的boundbox
        const chileNodes: number = CurrentEditSceneManager.instance().editScene.container3D.numChildren;
        for (let num = chileNodes; num >= 0; num --){
            if(parent.getChildAt(num) && parent.getChildAt(num).name === "boundpixel") {
                const boundPixel = parent.getChildAt(num);
                parent.removeChild(boundPixel);
                boundPixel.destroy(true);
            }
        }
    }

    /**
     * 渲染当选中模型的boundbox
     */
    public static renderActiveBoundBox(){
        //删除旧的bound
        this.clearBoundpixel();
        console.log(' [SetBoundBox] [renderActiveBoundBox] [当前选中的模型]', CurrentEditSceneManager.instance().editorLevelData.activeSprites);
        const checkedSprites = CurrentEditSceneManager.instance().editorLevelData.activeSprites;
        //循环画出所有选定的boundBox
        checkedSprites.map( (activeSpriteConfig: any) => {
            //拿到当前项的bound mesh
            const typeNode = CurrentEditSceneManager.instance().editScene.allSpritesNode.getChildByName(activeSpriteConfig[1]) as Laya.Sprite3D;
            let typeNodeChilds = typeNode.numChildren;
            for(let num = 0; num < typeNodeChilds; num ++){
                const info = typeNode.getChildAt(num).name.split("_");
                if(info[info.length - 1] == activeSpriteConfig[0]){
                    if(typeNode.getChildAt(num).getChildByName("boundbox")) {
                        const boundMesh = typeNode.getChildAt(num).getChildByName("boundbox") as Laya.MeshSprite3D;
                        this.setBoundpixel(boundMesh, true)
                    } else {
                        const sprite = typeNode.getChildAt(num) as Laya.Sprite3D;
                        this.drawCustomBound(sprite.transform.position, true)
                    }
                }
            }
        })
    }
}