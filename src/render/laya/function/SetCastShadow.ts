export default class setCastShadow {
    /**
* 设置是是否产生实时阴影
* @param rootNode 
* @param isCastShadow 
*/
    public static setCastShadow(rootNode: Laya.Node, isCastShadow: boolean) {
        if (rootNode.name.indexOf("E_") == -1 && rootNode.numChildren != 0) {
            for (let i = 0; i < rootNode.numChildren; i++) {
                let n = rootNode.getChildAt(i);
                let meshR = n.getComponent(Laya.MeshRenderer);

                if (n instanceof Laya.MeshSprite3D) {
                    (n as Laya.MeshSprite3D).meshRenderer.castShadow = isCastShadow;
                } else if (n instanceof Laya.SkinnedMeshSprite3D) {
                    (n as Laya.SkinnedMeshSprite3D).skinnedMeshRenderer.castShadow = isCastShadow;
                }
                this.setCastShadow(n, isCastShadow);
            }
        }

    }
}