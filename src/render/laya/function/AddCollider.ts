import EditorConfig from '../data/EditorConfig';

/* 添加碰撞器 */

export default class AddCollider {

    private static colliderTarget: Laya.Node

    /**
     * * 添加碰撞器
     * 根据精灵向下查找网格并添加
     * @param sprite 
     */
    public static addCollider(sprite: Laya.Node) {


        if (sprite instanceof Laya.MeshSprite3D) {
            this.setMeshCollider(sprite);
        } else if (sprite instanceof Laya.SkinnedMeshSprite3D) {
            this.setMeshCollider(sprite);
        } else if (sprite instanceof Laya.Sprite3D) {
            let number = sprite.numChildren;
            for (var i = 0; i < number; i++) {
                this.addCollider(sprite.getChildAt(i))
            }
        }
    }

    /**
     * 设置网格碰撞器
     */
    public static setMeshCollider(meshSprite: Laya.SkinnedMeshSprite3D | Laya.MeshSprite3D) {
        var meshShape = new Laya.MeshColliderShape();
            meshShape.convex = true;
            meshShape.mesh = meshSprite.meshFilter.sharedMesh;
            var rigidBody = meshSprite.addComponent(Laya.PhysicsCollider);
            rigidBody.colliderShape = meshShape;
    }

    /**
      * 根据碰撞信息向上查找碰撞精灵
      */
    public static findColliderSprite(meshSprite: Laya.Node): Laya.Node {

        if (meshSprite.name === 'plane3D') {

            this.colliderTarget = meshSprite;
        }
        else if (meshSprite.name === 'plane2D') {

            this.colliderTarget = meshSprite;
        }
        else if (meshSprite.name.indexOf('polygonVertex') > -1) {
            //多边形顶点精灵
            this.colliderTarget = meshSprite;
        }
        else if(this.isChildSprite(meshSprite.name)){
            //精灵
            this.colliderTarget = meshSprite;

        }
        else {
            this.findColliderSprite(meshSprite.parent);
        }
        return this.colliderTarget;
    }

    /**
     * 判断name中是否包含分类
     * 用于判断是否是精灵级的sprite
     */
    public static isChildSprite(name: string){
        let ishas = false;
        EditorConfig.sceneTypes.map( (type: string) => {
            name.includes(`${type}_`) &&
            (ishas = true);
        })

        return ishas;
    }
}