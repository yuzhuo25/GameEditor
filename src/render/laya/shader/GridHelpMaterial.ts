/**
 * 
 */
export default class GridHelpMaterial extends Laya.BaseMaterial {

    private static _inited: boolean = false;

    public static _SACLE = Laya.Shader3D.propertyNameToID('u_Scale');
    public static _OFFSET = Laya.Shader3D.propertyNameToID('u_Offset');
    private static vs = `
        #include "Lighting.glsl"

        attribute vec4 a_Position;
        attribute vec3 a_Normal;
        attribute vec2 a_Texcoord0;
        attribute vec4 a_VertxColor;

        // attribute mat4 a_MvpMatrix;
        // attribute mat4 a_WorldMat;

        uniform float u_Scale;
        uniform float u_Offset;
        uniform mat4 u_ViewProjection;

        // uniform mat4 u_MvpMatrix;
        // uniform mat4 u_WorldMat;

        varying vec4  v_Color;

        #ifdef GPU_INSTANCE
            attribute mat4 a_MvpMatrix;
			attribute mat4 a_WorldMat;
        #else
            uniform mat4 u_MvpMatrix;
			uniform mat4 u_WorldMat;
		#endif

        void main() {
            v_Color = a_VertxColor;
            vec4 v_world;
            vec4 m_world;

            #ifdef GPU_INSTANCE
                v_world = a_WorldMat * a_Position;
                m_world = a_WorldMat * vec4(0.0, 0.0, 0.0, 1.0);
            #else
                v_world = u_WorldMat * a_Position;
                m_world = u_WorldMat * vec4(0.0, 0.0, 0.0, 1.0);
		    #endif
          
            vec4 vv = v_world - m_world;

            vv.z *= u_Scale;
            v_world.z = m_world.z + vv.z;
            v_world.x -= (u_Offset * vv.z);

            // 世界矩阵*顶点位置
            // v_world = u_WorldMat * a_Position;
            gl_Position = u_ViewProjection * v_world;
            gl_Position = remapGLPositionZ(gl_Position);
        }
        `;

        private static ps = `
        #ifdef FSHIGHPRECISION
            precision highp float; 
        #else 
            precision mediump float; 
        #endif

        varying vec4  v_Color;

        void main() {
            gl_FragColor = v_Color;
            gl_FragColor.a *= 0.3;
        }
        `;

    constructor() {
        super();
        let scale = 1.52;
        let offset = 0.1693;
        if (GridHelpMaterial._inited) {
            this.setShaderName('GridHelpShader');
        } else {
            GridHelpMaterial.initShader();
            GridHelpMaterial._inited = true;
            this.setShaderName('GridHelpShader');
        }
        this._shaderValues.setNumber(GridHelpMaterial._SACLE, scale)
        this._shaderValues.setNumber(GridHelpMaterial._OFFSET, offset)
    }

    /**
     * 
     */
    private static initShader(): void {

        let atttributeMap: object = {
            'a_Position': Laya.VertexMesh.MESH_POSITION0,
            'a_Normal': Laya.VertexMesh.MESH_NORMAL0,
            'a_Texcoord0': Laya.VertexMesh.MESH_NORMAL0,
            'a_VertxColor': Laya.VertexMesh.MESH_COLOR0,

            'a_MvpMatrix': Laya.VertexMesh.MESH_MVPMATRIX_ROW0,
            'a_WorldMat': Laya.VertexMesh.MESH_WORLDMATRIX_ROW0
        };

        let uniformMap: object = {
            'u_MvpMatrix': Laya.Shader3D.PERIOD_SPRITE,
            'u_WorldMat': Laya.Shader3D.PERIOD_SPRITE,
            'u_Scale': Laya.Shader3D.PERIOD_MATERIAL,
            'u_Offset': Laya.Shader3D.PERIOD_MATERIAL,

            'u_ViewProjection': Laya.Shader3D.PERIOD_CAMERA,
        };

        let shader: Laya.Shader3D = Laya.Shader3D.add('GridHelpShader');
        let subShader: Laya.SubShader = new Laya.SubShader(atttributeMap, uniformMap);
        shader.addSubShader(subShader);

        
        let pass: Laya.ShaderPass = subShader.addShaderPass(GridHelpMaterial.vs, GridHelpMaterial.ps);
        pass.renderState.depthWrite = false;
        pass.renderState.depthTest = Laya.RenderState.DEPTHTEST_LEQUAL;
        pass.renderState.cull = Laya.RenderState.CULL_BACK;
        pass.renderState.blend = Laya.RenderState.BLEND_ENABLE_ALL;
        pass.renderState.srcBlend = Laya.RenderState.BLENDPARAM_SRC_ALPHA;
        pass.renderState.dstBlend = Laya.RenderState.BLENDPARAM_ONE_MINUS_SRC_ALPHA;
    }
}
