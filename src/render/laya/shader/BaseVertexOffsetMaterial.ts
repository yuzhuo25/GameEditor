export default class BaseVertexOffsetMaterial extends Laya.BaseMaterial {


    private static _inited = false;
    public static ALBEDOTEXTURE = Laya.Shader3D.propertyNameToID("u_AlbedoTexture");
    public static ALBEDOCOLOR = Laya.Shader3D.propertyNameToID("u_AlbedoColor");
    public static OFFSET = Laya.Shader3D.propertyNameToID("u_Offset");
    public static SCALE = Laya.Shader3D.propertyNameToID("u_Scale");
    public static SHADERDEFINE_TILINGOFFSET: Laya.ShaderDefine;
    /**渲染状态_不透明。*/
    public static RENDERMODE_OPAQUE: number = 0;
	/**渲染状态_阿尔法测试。*/
	public static RENDERMODE_CUTOUT: number = 1;
	/**渲染状态__透明混合。*/
	public static RENDERMODE_TRANSPARENT: number = 2;
	/**渲染状态__加色法混合。*/
	public static RENDERMODE_ADDTIVE: number = 3;
    public static TILINGOFFSET: number = Laya.Shader3D.propertyNameToID("u_TilingOffset");
    public static CULL: number = Laya.Shader3D.propertyNameToID("s_Cull");
    public static BLEND: number = Laya.Shader3D.propertyNameToID("s_Blend");
    public static BLEND_SRC: number = Laya.Shader3D.propertyNameToID("s_BlendSrc");
    public static BLEND_DST: number = Laya.Shader3D.propertyNameToID("s_BlendDst");
    public static DEPTH_TEST: number = Laya.Shader3D.propertyNameToID("s_DepthTest");
    public static DEPTH_WRITE: number = Laya.Shader3D.propertyNameToID("s_DepthWrite");
    public static SHADERDEFINE_ADDTIVEFOG = Laya.Shader3D.getDefineByName("ADDTIVEFOG");
    public static SHADERDEFINE_DIFFUSEMAP = Laya.Shader3D.getDefineByName("DIFFUSEMAP");

    private static vs = `
    #include \"Lighting.glsl\";
    attribute vec4 a_Position;

    #ifdef GPU_INSTANCE
        attribute mat4 a_MvpMatrix;
    #else
        uniform mat4 u_MvpMatrix;
    #endif

    attribute vec2 a_Texcoord0;
    varying vec2 v_Texcoord0;
    
    uniform mat4 u_ViewProjection;
    uniform float u_Offset;
    uniform float u_Scale;
    
    #ifdef BONE
        const int c_MaxBoneCount = 24;
        attribute vec4 a_BoneIndices;
        attribute vec4 a_BoneWeights;
        uniform mat4 u_Bones[c_MaxBoneCount];
    #endif
    #ifdef GPU_INSTANCE
        attribute mat4 a_WorldMat;
    #else
        uniform mat4 u_WorldMat;
    #endif

    #ifdef TILINGOFFSET
        uniform vec4 u_TilingOffset;
    #endif

    void main() 
    {	
        vec4 position;
        #ifdef BONE
            mat4 skinTransform = u_Bones[int(a_BoneIndices.x)] * a_BoneWeights.x;
            skinTransform += u_Bones[int(a_BoneIndices.y)] * a_BoneWeights.y;
            skinTransform += u_Bones[int(a_BoneIndices.z)] * a_BoneWeights.z;
            skinTransform += u_Bones[int(a_BoneIndices.w)] * a_BoneWeights.w;
            position=skinTransform * a_Position;
        #else
            position=a_Position;
        #endif

        #ifdef GPU_INSTANCE
            gl_Position = a_MvpMatrix * position;
        #else
            gl_Position = u_MvpMatrix * position;
        #endif

        mat4 worldMat;
        
        #ifdef GPU_INSTANCE
            worldMat = a_WorldMat;
        #else
            worldMat = u_WorldMat;
        #endif

        mat3 worldInvMat;
        #ifdef BONE
            worldInvMat=inverse(mat3(worldMat*skinTransform));
        #else
            worldInvMat=inverse(mat3(worldMat));
        #endif  

        vec3 v_PositionWorld = ( worldMat * position).xyz;
        #ifdef BONE
            vec3 M_world = (skinTransform*vec4(0.0,0.0,0.0,1.0)).xyz;
        #else
            vec3 M_world = (worldMat*vec4(0.0,0.0,0.0,1.0)).xyz;
        #endif 
        vec3 vv = v_PositionWorld - M_world;
        vv.z *= u_Scale;
        v_PositionWorld.z = M_world.z + vv.z;
        v_PositionWorld.x -= u_Offset * vv.z;

        gl_Position = u_ViewProjection * vec4(v_PositionWorld, 1.0);

        #ifdef TILINGOFFSET
            v_Texcoord0 = TransformUV(a_Texcoord0,u_TilingOffset);
        #else
            v_Texcoord0 = a_Texcoord0;
        #endif	
        gl_Position = remapGLPositionZ(gl_Position);
    }`;

    private static ps = `
    #ifdef HIGHPRECISION
        precision highp float;
    #else
        precision mediump float;
    #endif
    
    #include \"Lighting.glsl\";
    
    // 主颜色
    uniform vec4 u_AlbedoColor;

    #ifdef ALPHATEST
        uniform float u_AlphaTestValue;
    #endif
    // 主纹理
    uniform sampler2D u_AlbedoTexture;
    varying vec2 v_Texcoord0;	

    void main()
    {
        vec4 difTexColor=vec4(1.0);
        #if defined(DIFFUSEMAP)
            difTexColor = texture2D(u_AlbedoTexture, v_Texcoord0);
        #endif

        difTexColor.rgb *= u_AlbedoColor.rgb * 2.0;
        difTexColor.a *= u_AlbedoColor.a;
        
        #ifdef ALPHATEST
            if(difTexColor.a < u_AlphaTestValue)
                discard;
        #endif

        gl_FragColor = difTexColor;
    }`;


    constructor() {
        super();
        if (!BaseVertexOffsetMaterial._inited) {
            BaseVertexOffsetMaterial.initShader();
            BaseVertexOffsetMaterial._inited = true;
        }
        this.setShaderName('BaseVertexOffsetShader');
        this._shaderValues.setNumber(BaseVertexOffsetMaterial.OFFSET, 0.176);
        this._shaderValues.setNumber(BaseVertexOffsetMaterial.SCALE, 1.596);
        this._shaderValues.setVector(BaseVertexOffsetMaterial.ALBEDOCOLOR, new Laya.Vector4(0.5,0.5,0.5, 1.0));
        this.renderMode = BaseVertexOffsetMaterial.RENDERMODE_OPAQUE;
        this._shaderValues.setVector(BaseVertexOffsetMaterial.TILINGOFFSET, new Laya.Vector4(1.0, 1.0, 0.0, 0.0));
    }

/**
	 * 渲染模式。
	 */
    set renderMode(value: number) {
        switch (value) {
            case BaseVertexOffsetMaterial.RENDERMODE_OPAQUE:
                this.alphaTest = false;
                this.renderQueue = Laya.BaseMaterial.RENDERQUEUE_OPAQUE;
                this.depthWrite = true;
                this.cull = Laya.RenderState.CULL_BACK;
                this.blend = Laya.RenderState.BLEND_DISABLE;
                this.depthTest = Laya.RenderState.DEPTHTEST_LESS;
                this._shaderValues.removeDefine(BaseVertexOffsetMaterial.SHADERDEFINE_ADDTIVEFOG);
                break;
            case BaseVertexOffsetMaterial.RENDERMODE_CUTOUT:
                this.renderQueue = Laya.BaseMaterial.RENDERQUEUE_ALPHATEST;
                this.alphaTest = true;
                this.depthWrite = true;
                this.cull = Laya.RenderState.CULL_BACK;
                this.blend = Laya.RenderState.BLEND_DISABLE;
                this.depthTest = Laya.RenderState.DEPTHTEST_LESS;
                this._shaderValues.removeDefine(BaseVertexOffsetMaterial.SHADERDEFINE_ADDTIVEFOG);
                break;
            case BaseVertexOffsetMaterial.RENDERMODE_TRANSPARENT:
                this.renderQueue = Laya.BaseMaterial.RENDERQUEUE_TRANSPARENT;
                this.alphaTest = false;
                this.depthWrite = false;
                this.cull = Laya.RenderState.CULL_BACK;
                this.blend = Laya.RenderState.BLEND_ENABLE_ALL;
                this.blendSrc = Laya.RenderState.BLENDPARAM_SRC_ALPHA;
                this.blendDst = Laya.RenderState.BLENDPARAM_ONE_MINUS_SRC_ALPHA;
                this.depthTest = Laya.RenderState.DEPTHTEST_LESS;
                this._shaderValues.removeDefine(BaseVertexOffsetMaterial.SHADERDEFINE_ADDTIVEFOG);
                break;
            case BaseVertexOffsetMaterial.RENDERMODE_ADDTIVE:
                this.renderQueue = BaseVertexOffsetMaterial.RENDERQUEUE_TRANSPARENT;
                this.alphaTest = false;
                this.depthWrite = false;
                this.cull = Laya.RenderState.CULL_NONE;
                this.blend = Laya.RenderState.BLEND_ENABLE_ALL;
                this.blendSrc = Laya.RenderState.BLENDPARAM_SRC_ALPHA;
                this.blendDst = Laya.RenderState.BLENDPARAM_ONE;
                this.depthTest = Laya.RenderState.DEPTHTEST_LESS;
                this._shaderValues.addDefine(BaseVertexOffsetMaterial.SHADERDEFINE_ADDTIVEFOG);
                break;
            default:
                throw new Error("BaseVertexOffsetMaterial : renderMode value error.");
        }
    }

/**
	 * 纹理平铺和偏移X分量。
	 */
    get tilingOffsetX(): number {
        return this._MainTex_STX;
    }

    set tilingOffsetX(x: number) {
        this._MainTex_STX = x;
    }

	/**
	 * 纹理平铺和偏移Y分量。
	 */
    get tilingOffsetY(): number {
        return this._MainTex_STY;
    }

    set tilingOffsetY(y: number) {
        this._MainTex_STY = y;
    }

	/**
	 * 纹理平铺和偏移Z分量。
	 */
    get tilingOffsetZ(): number {
        return this._MainTex_STZ;
    }

    set tilingOffsetZ(z: number) {
        this._MainTex_STZ = z;
    }

	/**
	 * 纹理平铺和偏移W分量。
	 */
    get tilingOffsetW(): number {
        return this._MainTex_STW;
    }

    set tilingOffsetW(w: number) {
        this._MainTex_STW = w;
    }


    

	/**
	 * 是否写入深度。
	 */
    get depthWrite(): boolean {
        return this._shaderValues.getBool(BaseVertexOffsetMaterial.DEPTH_WRITE);
    }

    set depthWrite(value: boolean) {
        this._shaderValues.setBool(BaseVertexOffsetMaterial.DEPTH_WRITE, value);
    }

    	/**
	 * 纹理平铺和偏移。
	 */
    get tilingOffset(): Laya.Vector4 {
        return (<Laya.Vector4>this._shaderValues.getVector(BaseVertexOffsetMaterial.TILINGOFFSET));
    }

    set tilingOffset(value: Laya.Vector4) {
        if (value) {
            if (value.x != 1 || value.y != 1 || value.z != 0 || value.w != 0)
                this._shaderValues.addDefine(BaseVertexOffsetMaterial.SHADERDEFINE_TILINGOFFSET);
            else
                this._shaderValues.removeDefine(BaseVertexOffsetMaterial.SHADERDEFINE_TILINGOFFSET);
        } else {
            this._shaderValues.removeDefine(BaseVertexOffsetMaterial.SHADERDEFINE_TILINGOFFSET);
        }
        this._shaderValues.setVector(BaseVertexOffsetMaterial.TILINGOFFSET, value);
    }


/**
	 * @internal
	 */
    get _MainTex_STX(): number {
        return this._shaderValues.getVector(BaseVertexOffsetMaterial.TILINGOFFSET).x;
    }

    set _MainTex_STX(x: number) {
        var tilOff: Laya.Vector4 = (<Laya.Vector4>this._shaderValues.getVector(BaseVertexOffsetMaterial.TILINGOFFSET));
        tilOff.x = x;
        this.tilingOffset = tilOff;
    }

	/**
	 * @internal
	 */
    get _MainTex_STY(): number {
        return this._shaderValues.getVector(BaseVertexOffsetMaterial.TILINGOFFSET).y;
    }

    set _MainTex_STY(y: number) {
        var tilOff: Laya.Vector4 = (<Laya.Vector4>this._shaderValues.getVector(BaseVertexOffsetMaterial.TILINGOFFSET));
        tilOff.y = y;
        this.tilingOffset = tilOff;
    }

	/**
	 * @internal
	 */
    get _MainTex_STZ(): number {
        return this._shaderValues.getVector(BaseVertexOffsetMaterial.TILINGOFFSET).z;
    }

    set _MainTex_STZ(z: number) {
        var tilOff: Laya.Vector4 = (<Laya.Vector4>this._shaderValues.getVector(BaseVertexOffsetMaterial.TILINGOFFSET));
        tilOff.z = z;
        this.tilingOffset = tilOff;
    }

	/**
	 * @internal
	 */
    get _MainTex_STW(): number {
        return this._shaderValues.getVector(BaseVertexOffsetMaterial.TILINGOFFSET).w;
    }

    set _MainTex_STW(w: number) {
        var tilOff: Laya.Vector4 = (<Laya.Vector4>this._shaderValues.getVector(BaseVertexOffsetMaterial.TILINGOFFSET));
        tilOff.w = w;
        this.tilingOffset = tilOff;
    }

	/**
	 * 剔除方式。
	 */
    get cull(): number {
        return this._shaderValues.getInt(BaseVertexOffsetMaterial.CULL);
    }

    set cull(value: number) {
        this._shaderValues.setInt(BaseVertexOffsetMaterial.CULL, value);
    }


	/**
	 * 混合方式。
	 */
    get blend(): number {
        return this._shaderValues.getInt(BaseVertexOffsetMaterial.BLEND);
    }

    set blend(value: number) {
        this._shaderValues.setInt(BaseVertexOffsetMaterial.BLEND, value);
    }


	/**
	 * 混合源。
	 */
    get blendSrc(): number {
        return this._shaderValues.getInt(BaseVertexOffsetMaterial.BLEND_SRC);
    }

    set blendSrc(value: number) {
        this._shaderValues.setInt(BaseVertexOffsetMaterial.BLEND_SRC, value);
    }



	/**
	 * 混合目标。
	 */
    get blendDst(): number {
        return this._shaderValues.getInt(BaseVertexOffsetMaterial.BLEND_DST);
    }

    set blendDst(value: number) {
        this._shaderValues.setInt(BaseVertexOffsetMaterial.BLEND_DST, value);
    }


	/**
	 * 深度测试方式。
	 */
    get depthTest(): number {
        return this._shaderValues.getInt(BaseVertexOffsetMaterial.DEPTH_TEST);
    }

    set depthTest(value: number) {
        this._shaderValues.setInt(BaseVertexOffsetMaterial.DEPTH_TEST, value);
    }



	/**
	 * 克隆。
	 * @return	 克隆副本。
	 * @override
	 */
    clone(): any {
        var dest: BaseVertexOffsetMaterial = new BaseVertexOffsetMaterial();
        this.cloneTo(dest);
        return dest;
    }


    /**
     * 获取漫反射贴图。
     * @return 漫反射贴图。
     */
    get _MainTex() {
        return this._shaderValues.getTexture(BaseVertexOffsetMaterial.ALBEDOTEXTURE);
    }

    /**
     * 设置漫反射贴图。
     * @param value 漫反射贴图。
     */
    set _MainTex(value) {
        this._shaderValues.setTexture(BaseVertexOffsetMaterial.ALBEDOTEXTURE, value);
        if (value)
            this._shaderValues.addDefine(BaseVertexOffsetMaterial.SHADERDEFINE_DIFFUSEMAP);
        else
            this._shaderValues.removeDefine(BaseVertexOffsetMaterial.SHADERDEFINE_DIFFUSEMAP);
    }

	/**
     * 获取主颜色。
     * @return 主颜色
     */
    get _Color() {
        return this._shaderValues.getVector(BaseVertexOffsetMaterial.ALBEDOCOLOR);
    }

    /**
     * 设置主颜色。
     * @param value 主颜色
     */
    set _Color(value) {
        this._shaderValues.setVector(BaseVertexOffsetMaterial.ALBEDOCOLOR, value);
    }


    get _Offset() {
        return this._shaderValues.getNumber(BaseVertexOffsetMaterial.OFFSET);
    }
    set _Offset(value) {
        this._shaderValues.setNumber(BaseVertexOffsetMaterial.OFFSET, value);
    }
    get _Scale() {
        return this._shaderValues.getNumber(BaseVertexOffsetMaterial.SCALE);
    }
    set _Scale(value) {
        this._shaderValues.setNumber(BaseVertexOffsetMaterial.SCALE, value);
    }


    private static initShader(): void {
        var attributeMap: Object = {
            'a_Position': Laya.VertexMesh.MESH_POSITION0,
            'a_Texcoord0': Laya.VertexMesh.MESH_TEXTURECOORDINATE0,
            'a_BoneWeights': Laya.VertexMesh.MESH_BLENDWEIGHT0,
            'a_BoneIndices': Laya.VertexMesh.MESH_BLENDINDICES0,
            'a_MvpMatrix': Laya.VertexMesh.MESH_MVPMATRIX_ROW0,
            'a_WorldMat': Laya.VertexMesh.MESH_WORLDMATRIX_ROW0,
        };
        var uniformMap: Object = {
            'u_MvpMatrix': Laya.Shader3D.PERIOD_SPRITE,
            'u_WorldMat': Laya.Shader3D.PERIOD_SPRITE,
            'u_AlbedoColor': Laya.Shader3D.PERIOD_MATERIAL,
            'u_AlbedoTexture': Laya.Shader3D.PERIOD_MATERIAL,
            'u_ViewProjection': Laya.Shader3D.PERIOD_CAMERA,
            'u_AlphaTestValue': Laya.Shader3D.PERIOD_MATERIAL,
            'u_Offset': Laya.Shader3D.PERIOD_MATERIAL,
            'u_Scale': Laya.Shader3D.PERIOD_MATERIAL,
            'u_TilingOffset': Laya.Shader3D.PERIOD_MATERIAL,
        };


        BaseVertexOffsetMaterial.SHADERDEFINE_TILINGOFFSET = Laya.Shader3D.getDefineByName("TILINGOFFSET");

        var customShader: Laya.Shader3D = Laya.Shader3D.add("BaseVertexOffsetShader");
        var subShader = new Laya.SubShader(attributeMap, uniformMap);
        customShader.addSubShader(subShader);

        
        
        var stateMap = {
            's_Cull': Laya.Shader3D.RENDER_STATE_CULL,
            's_Blend': Laya.Shader3D.RENDER_STATE_BLEND,
            's_BlendSrc': Laya.Shader3D.RENDER_STATE_BLEND_SRC,
            's_BlendDst': Laya.Shader3D.RENDER_STATE_BLEND_DST,
            's_DepthTest': Laya.Shader3D.RENDER_STATE_DEPTH_TEST,
            's_DepthWrite': Laya.Shader3D.RENDER_STATE_DEPTH_WRITE
        };

        let pass = subShader.addShaderPass(BaseVertexOffsetMaterial.vs, BaseVertexOffsetMaterial.ps, stateMap);        
        // pass.renderState.depthWrite = true;
        // pass.renderState.depthTest = Laya.RenderState.DEPTHTEST_LEQUAL;
        // pass.renderState.cull = Laya.RenderState.CULL_BACK;
        // pass.renderState.blend = Laya.RenderState.BLEND_DISABLE;
        // pass.renderState.srcBlend = Laya.RenderState.BLENDPARAM_SRC_ALPHA;
        // pass.renderState.dstBlend = Laya.RenderState.BLENDPARAM_ONE_MINUS_SRC_ALPHA;
    }
}