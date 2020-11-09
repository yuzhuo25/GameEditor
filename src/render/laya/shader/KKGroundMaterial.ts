/**
 * 地面背景shader
 */
export default class KKGroundMaterial extends Laya.BaseMaterial {
    /**渲染状态_不透明。*/
    static RENDERMODE_OPAQUE: number = 0;
    /**渲染状态_阿尔法测试。*/
    static RENDERMODE_CUTOUT: number = 1;
    /**渲染状态__透明混合。*/
    static RENDERMODE_TRANSPARENT: number = 2;
    /**渲染状态__加色法混合。*/
    static RENDERMODE_ADDTIVE: number = 3;
    private static _inited = false;
    static SHADERDEFINE_ALBEDOTEXTURE: Laya.ShaderDefine;
    static SHADERDEFINE_TILINGOFFSET: Laya.ShaderDefine;
    static SHADERDEFINE_ENABLEVERTEXCOLOR: Laya.ShaderDefine;

    static ALBEDOTEXTURE: number = Laya.Shader3D.propertyNameToID("u_AlbedoTexture");
    static ALBEDOCOLOR: number = Laya.Shader3D.propertyNameToID("u_AlbedoColor");
    static TILINGOFFSET: number = Laya.Shader3D.propertyNameToID("u_TilingOffset");
    static CULL: number = Laya.Shader3D.propertyNameToID("s_Cull");
    static BLEND: number = Laya.Shader3D.propertyNameToID("s_Blend");
    static BLEND_SRC: number = Laya.Shader3D.propertyNameToID("s_BlendSrc");
    static BLEND_DST: number = Laya.Shader3D.propertyNameToID("s_BlendDst");
    static DEPTH_TEST: number = Laya.Shader3D.propertyNameToID("s_DepthTest");
    static DEPTH_WRITE: number = Laya.Shader3D.propertyNameToID("s_DepthWrite");
    /** 默认材质，禁止修改*/
    static defaultMaterial: KKGroundMaterial;


    private _albedoColor: Laya.Vector4 = new Laya.Vector4(1.0, 1.0, 1.0, 1.0);
    private _albedoIntensity: number = 1.0;
    private _enableVertexColor: boolean = false;

    private static vs = `#include "Lighting.glsl";

		attribute vec4 a_Position;
		
		attribute vec2 a_Texcoord0;
		
		#ifdef GPU_INSTANCE
			attribute mat4 a_MvpMatrix;
		#else
			uniform mat4 u_MvpMatrix;
		#endif
		
		attribute vec4 a_Color;
		varying vec4 v_Color;
		varying vec2 v_Texcoord0;
		
		varying float v_posViewZ;
		#ifdef RECEIVESHADOW
			#ifdef SHADOWMAP_PSSM1 
			varying vec4 v_lightMVPPos;
			uniform mat4 u_lightShadowVP[4];
			#endif
		#endif

		#if defined(DIRECTIONLIGHT)||defined(POINTLIGHT)||defined(SPOTLIGHT)||defined(RECEIVESHADOW)
			#ifdef GPU_INSTANCE
				attribute mat4 a_WorldMat;
			#else
				uniform mat4 u_WorldMat;
			#endif
			varying vec3 v_PositionWorld;
		#endif

		#ifdef TILINGOFFSET
			uniform vec4 u_TilingOffset;
		#endif
		
		#ifdef BONE
			const int c_MaxBoneCount = 24;
			attribute vec4 a_BoneIndices;
			attribute vec4 a_BoneWeights;
			uniform mat4 u_Bones[c_MaxBoneCount];
		#endif
		
		void main() {
            #ifdef CASTSHADOW
                gl_Position= vec4(0.0,0.0,0.0,1.0);
            #else
                vec4 position;
                #ifdef BONE
                    mat4 skinTransform = u_Bones[int(a_BoneIndices.x)] * a_BoneWeights.x;
                    skinTransform += u_Bones[int(a_BoneIndices.y)] * a_BoneWeights.y;
                    skinTransform += u_Bones[int(a_BoneIndices.z)] * a_BoneWeights.z;
                    skinTransform += u_Bones[int(a_BoneIndices.w)] * a_BoneWeights.w;
                    position=skinTransform*a_Position;
                #else
                    position=a_Position;
                #endif
                #ifdef GPU_INSTANCE
                    gl_Position = a_MvpMatrix * position;
                #else
                    gl_Position = u_MvpMatrix * position;
                #endif
            
                #if defined(DIRECTIONLIGHT)||defined(POINTLIGHT)||defined(SPOTLIGHT)||defined(RECEIVESHADOW)
                    mat4 worldMat;
                    #ifdef GPU_INSTANCE
                        worldMat = a_WorldMat;
                    #else
                        worldMat = u_WorldMat;
                    #endif
                #endif

                #if defined(DIRECTIONLIGHT)||defined(POINTLIGHT)||defined(SPOTLIGHT)
                    mat3 worldInvMat;
                    #ifdef BONE
                        worldInvMat=inverse(mat3(worldMat*skinTransform));
                    #else
                        worldInvMat=inverse(mat3(worldMat));
                    #endif  
                #endif
        
                #if defined(DIRECTIONLIGHT)||defined(POINTLIGHT)||defined(SPOTLIGHT)||defined(RECEIVESHADOW)
                    v_PositionWorld=(worldMat*position).xyz;
                #endif


                #ifdef TILINGOFFSET
                    v_Texcoord0=TransformUV(a_Texcoord0,u_TilingOffset);
                #else
                    v_Texcoord0=a_Texcoord0;
                #endif
            
                #if defined(COLOR)&&defined(ENABLEVERTEXCOLOR)
                    v_Color = a_Color;
                #endif

                #ifdef RECEIVESHADOW
                    v_posViewZ = gl_Position.w;
                    #ifdef SHADOWMAP_PSSM1 
                        v_lightMVPPos = u_lightShadowVP[0] * vec4(v_PositionWorld,1.0);
                    #endif
                #endif

                gl_Position=remapGLPositionZ(gl_Position);
            #endif
		}`;

        private static ps = `#ifdef HIGHPRECISION
		precision highp float;
	#else
		precision mediump float;
	#endif
	
	#include "Lighting.glsl";

	#if defined(COLOR)&&defined(ENABLEVERTEXCOLOR)
		varying vec4 v_Color;
	#endif
	
	#ifdef ALBEDOTEXTURE
		uniform sampler2D u_AlbedoTexture;
		varying vec2 v_Texcoord0;
	#endif
	
	uniform vec4 u_AlbedoColor;
	
	#ifdef ALPHATEST
		uniform float u_AlphaTestValue;
	#endif
	
	#ifdef FOG
		uniform float u_FogStart;
		uniform float u_FogRange;
		#ifdef ADDTIVEFOG
		#else
			uniform vec3 u_FogColor;
		#endif
	#endif
	uniform vec3 u_AmbientColor;

	#if defined(POINTLIGHT)||defined(SPOTLIGHT)||defined(RECEIVESHADOW)
		varying vec3 v_PositionWorld;
	#endif
	#include "ShadowHelper.glsl"
	#ifdef RECEIVESHADOW
		#if defined(SHADOWMAP_PSSM2)||defined(SHADOWMAP_PSSM3)
			uniform mat4 u_lightShadowVP[4];
		#endif
		#ifdef SHADOWMAP_PSSM1 
			varying vec4 v_lightMVPPos;
		#endif
	#endif
	varying float v_posViewZ;

    void main(){
        #ifdef CASTSHADOW
            gl_FragColor=vec4(0.0,0.0,0.0,1.0);		
            discard;
        #else
        
            vec4 color =  u_AlbedoColor;
            #ifdef ALBEDOTEXTURE
                color *= texture2D(u_AlbedoTexture, v_Texcoord0);
            #endif
            #if defined(COLOR)&&defined(ENABLEVERTEXCOLOR)
                color *= v_Color;
            #endif
            
            #ifdef ALPHATEST
                if(color.a < u_AlphaTestValue)
                    discard;
            #endif
            
            gl_FragColor = color;


            #ifdef RECEIVESHADOW
                float shadowValue = 1.0;			
                #ifdef SHADOWMAP_PSSM3			
                    shadowValue = getShadowPSSM3(u_shadowMap1,u_shadowMap2,u_shadowMap3,u_lightShadowVP,u_shadowPSSMDistance,u_shadowPCFoffset,v_PositionWorld,v_posViewZ,0.001);
                #endif			
                #ifdef SHADOWMAP_PSSM2
                    shadowValue = getShadowPSSM2(u_shadowMap1,u_shadowMap2,u_lightShadowVP,u_shadowPSSMDistance,u_shadowPCFoffset,v_PositionWorld,v_posViewZ,0.001);
                #endif 
                #ifdef SHADOWMAP_PSSM1
                    shadowValue = getShadowPSSM1(u_shadowMap1,v_lightMVPPos,u_shadowPSSMDistance,u_shadowPCFoffset,v_posViewZ,0.001);
                #endif
                float shadowStrength =0.6;
                gl_FragColor =vec4(gl_FragColor.rgb*(vec3(1.0,1.0,1.0)-(1.0-shadowValue)*(vec3(1.0,1.0,1.0)-u_AmbientColor)*shadowStrength),gl_FragColor.a);
            #endif		

            #ifdef FOG
                float lerpFact = clamp((1.0 / gl_FragCoord.w - u_FogStart) / u_FogRange, 0.0, 1.0);
                #ifdef ADDTIVEFOG
                    gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(0.0), lerpFact);
                #else
                    gl_FragColor.rgb = mix(gl_FragColor.rgb, u_FogColor, lerpFact);
                #endif
            #endif
        #endif
	}`;


        /**
     * 获取漫反射贴图。
     * @return 漫反射贴图。
     */
    get _MainTex() {
        return this._shaderValues.getTexture(KKGroundMaterial.ALBEDOTEXTURE);
    }

    /**
     * 设置漫反射贴图。
     * @param value 漫反射贴图。
     */
    set _MainTex(value) {
        this._shaderValues.setTexture(KKGroundMaterial.ALBEDOTEXTURE, value);
        if (value)
            this._shaderValues.addDefine(KKGroundMaterial.SHADERDEFINE_ALBEDOTEXTURE);
        else
            this._shaderValues.removeDefine(KKGroundMaterial.SHADERDEFINE_ALBEDOTEXTURE);
    }

    	/**
     * 获取主颜色。
     * @return 主颜色
     */
    get _Color() {
        return this._shaderValues.getVector(KKGroundMaterial.ALBEDOCOLOR);
    }

    /**
     * 设置主颜色。
     * @param value 主颜色
     */
    set _Color(value) {
        this._shaderValues.setVector(KKGroundMaterial.ALBEDOCOLOR, value);
    }
    
	/**
	 * @internal
	 */
    get _ColorR(): number {
        return this._albedoColor.x;
    }

    set _ColorR(value: number) {
        this._albedoColor.x = value;
        this.albedoColor = this._albedoColor;
    }

	/**
	 * @internal
	 */
    get _ColorG(): number {
        return this._albedoColor.y;
    }

    set _ColorG(value: number) {
        this._albedoColor.y = value;
        this.albedoColor = this._albedoColor;
    }

	/**
	 * @internal
	 */
    get _ColorB(): number {
        return this._albedoColor.z;
    }

    set _ColorB(value: number) {
        this._albedoColor.z = value;
        this.albedoColor = this._albedoColor;
    }

	/**
	 * @internal 
	 */
    get _ColorA(): number {
        return this._albedoColor.w;
    }

    set _ColorA(value: number) {
        this._albedoColor.w = value;
        this.albedoColor = this._albedoColor;
    }

	/**
	 * @internal
	 */
    get _AlbedoIntensity(): number {
        return this._albedoIntensity;
    }

    set _AlbedoIntensity(value: number) {
        if (this._albedoIntensity !== value) {
            var finalAlbedo: Laya.Vector4 = (<Laya.Vector4>this._shaderValues.getVector(KKGroundMaterial.ALBEDOCOLOR));
            Laya.Vector4.scale(this._albedoColor, value, finalAlbedo);
            this._albedoIntensity = value;
            this._shaderValues.setVector(KKGroundMaterial.ALBEDOCOLOR, finalAlbedo);
        }
    }

	/**
	 * @internal
	 */
    get _MainTex_STX(): number {
        return this._shaderValues.getVector(KKGroundMaterial.TILINGOFFSET).x;
    }

    set _MainTex_STX(x: number) {
        var tilOff: Laya.Vector4 = (<Laya.Vector4>this._shaderValues.getVector(KKGroundMaterial.TILINGOFFSET));
        tilOff.x = x;
        this.tilingOffset = tilOff;
    }

	/**
	 * @internal
	 */
    get _MainTex_STY(): number {
        return this._shaderValues.getVector(KKGroundMaterial.TILINGOFFSET).y;
    }

    set _MainTex_STY(y: number) {
        var tilOff: Laya.Vector4 = (<Laya.Vector4>this._shaderValues.getVector(KKGroundMaterial.TILINGOFFSET));
        tilOff.y = y;
        this.tilingOffset = tilOff;
    }

	/**
	 * @internal
	 */
    get _MainTex_STZ(): number {
        return this._shaderValues.getVector(KKGroundMaterial.TILINGOFFSET).z;
    }

    set _MainTex_STZ(z: number) {
        var tilOff: Laya.Vector4 = (<Laya.Vector4>this._shaderValues.getVector(KKGroundMaterial.TILINGOFFSET));
        tilOff.z = z;
        this.tilingOffset = tilOff;
    }

	/**
	 * @internal
	 */
    get _MainTex_STW(): number {
        return this._shaderValues.getVector(KKGroundMaterial.TILINGOFFSET).w;
    }

    set _MainTex_STW(w: number) {
        var tilOff: Laya.Vector4 = (<Laya.Vector4>this._shaderValues.getVector(KKGroundMaterial.TILINGOFFSET));
        tilOff.w = w;
        this.tilingOffset = tilOff;
    }

	/**
	 * @internal
	 */
    get _Cutoff(): number {
        return this.alphaTestValue;
    }

    set _Cutoff(value: number) {
        this.alphaTestValue = value;
    }

	/**
	 * 反照率颜色R分量。
	 */
    get albedoColorR(): number {
        return this._ColorR;
    }

    set albedoColorR(value: number) {
        this._ColorR = value;
    }

	/**
	 * 反照率颜色G分量。
	 */
    get albedoColorG(): number {
        return this._ColorG;
    }

    set albedoColorG(value: number) {
        this._ColorG = value;
    }

	/**
	 * 反照率颜色B分量。
	 */
    get albedoColorB(): number {
        return this._ColorB;
    }

    set albedoColorB(value: number) {
        this._ColorB = value;
    }

	/**
	 * 反照率颜色Z分量。
	 */
    get albedoColorA(): number {
        return this._ColorA;
    }

    set albedoColorA(value: number) {
        this._ColorA = value;
    }

	/**
	 * 反照率颜色。
	 */
    get albedoColor(): Laya.Vector4 {
        return this._albedoColor;
    }

    set albedoColor(value: Laya.Vector4) {
        var finalAlbedo: Laya.Vector4 = (<Laya.Vector4>this._shaderValues.getVector(KKGroundMaterial.ALBEDOCOLOR));
        Laya.Vector4.scale(value, this._albedoIntensity, finalAlbedo);
        this._albedoColor = value;
        this._shaderValues.setVector(KKGroundMaterial.ALBEDOCOLOR, finalAlbedo);
    }
    

	/**
	 * 反照率强度。
	 */
    get albedoIntensity(): number {
        return this._albedoIntensity;
    }

    set albedoIntensity(value: number) {
        this._AlbedoIntensity = value;
    }

	/**
	 * 反照率贴图。
	 */
    get albedoTexture(): Laya.BaseTexture {
        return this._shaderValues.getTexture(KKGroundMaterial.ALBEDOTEXTURE);
    }

    set albedoTexture(value: Laya.BaseTexture) {
        if (value)
            this._shaderValues.addDefine(KKGroundMaterial.SHADERDEFINE_ALBEDOTEXTURE);
        else
            this._shaderValues.removeDefine(KKGroundMaterial.SHADERDEFINE_ALBEDOTEXTURE);
        this._shaderValues.setTexture(KKGroundMaterial.ALBEDOTEXTURE, value);
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
	 * 纹理平铺和偏移。
	 */
    get tilingOffset(): Laya.Vector4 {
        return (<Laya.Vector4>this._shaderValues.getVector(KKGroundMaterial.TILINGOFFSET));
    }

    set tilingOffset(value: Laya.Vector4) {
        if (value) {
            if (value.x != 1 || value.y != 1 || value.z != 0 || value.w != 0)
                this._shaderValues.addDefine(KKGroundMaterial.SHADERDEFINE_TILINGOFFSET);
            else
                this._shaderValues.removeDefine(KKGroundMaterial.SHADERDEFINE_TILINGOFFSET);
        } else {
            this._shaderValues.removeDefine(KKGroundMaterial.SHADERDEFINE_TILINGOFFSET);
        }
        this._shaderValues.setVector(KKGroundMaterial.TILINGOFFSET, value);
    }

    


	/**
	 * 是否支持顶点色。
	 */
    get enableVertexColor(): boolean {
        return this._enableVertexColor;
    }

    set enableVertexColor(value: boolean) {
        this._enableVertexColor = value;
        if (value)
            this._shaderValues.addDefine(KKGroundMaterial.SHADERDEFINE_ENABLEVERTEXCOLOR);
        else
            this._shaderValues.removeDefine(KKGroundMaterial.SHADERDEFINE_ENABLEVERTEXCOLOR);
    }

	/**
	 * 渲染模式。
	 */
    set renderMode(value: number) {
        switch (value) {
            case KKGroundMaterial.RENDERMODE_OPAQUE:
                this.alphaTest = false;
                this.renderQueue = Laya.BaseMaterial.RENDERQUEUE_OPAQUE;
                this.depthWrite = true;
                this.cull = Laya.RenderState.CULL_BACK;
                this.blend = Laya.RenderState.BLEND_DISABLE;
                this.depthTest = Laya.RenderState.DEPTHTEST_LESS;
                break;
            case KKGroundMaterial.RENDERMODE_CUTOUT:
                this.renderQueue = Laya.BaseMaterial.RENDERQUEUE_ALPHATEST;
                this.alphaTest = true;
                this.depthWrite = true;
                this.cull = Laya.RenderState.CULL_BACK;
                this.blend = Laya.RenderState.BLEND_DISABLE;
                this.depthTest = Laya.RenderState.DEPTHTEST_LESS;
                break;
            case KKGroundMaterial.RENDERMODE_TRANSPARENT:
                this.renderQueue = Laya.BaseMaterial.RENDERQUEUE_TRANSPARENT;
                this.alphaTest = false;
                this.depthWrite = false;
                this.cull = Laya.RenderState.CULL_BACK;
                this.blend = Laya.RenderState.BLEND_ENABLE_ALL;
                this.blendSrc = Laya.RenderState.BLENDPARAM_SRC_ALPHA;
                this.blendDst = Laya.RenderState.BLENDPARAM_ONE_MINUS_SRC_ALPHA;
                this.depthTest = Laya.RenderState.DEPTHTEST_LESS;
                break;
            default:
                throw new Error("KKGroundMaterial : renderMode value error.");
        }
    }



	/**
	 * 是否写入深度。
	 */
    get depthWrite(): boolean {
        return this._shaderValues.getBool(KKGroundMaterial.DEPTH_WRITE);
    }

    set depthWrite(value: boolean) {
        this._shaderValues.setBool(KKGroundMaterial.DEPTH_WRITE, value);
    }



	/**
	 * 剔除方式。
	 */
    get cull(): number {
        return this._shaderValues.getInt(KKGroundMaterial.CULL);
    }

    set cull(value: number) {
        this._shaderValues.setInt(KKGroundMaterial.CULL, value);
    }


	/**
	 * 混合方式。
	 */
    get blend(): number {
        return this._shaderValues.getInt(KKGroundMaterial.BLEND);
    }

    set blend(value: number) {
        this._shaderValues.setInt(KKGroundMaterial.BLEND, value);
    }


	/**
	 * 混合源。
	 */
    get blendSrc(): number {
        return this._shaderValues.getInt(KKGroundMaterial.BLEND_SRC);
    }

    set blendSrc(value: number) {
        this._shaderValues.setInt(KKGroundMaterial.BLEND_SRC, value);
    }



	/**
	 * 混合目标。
	 */
    get blendDst(): number {
        return this._shaderValues.getInt(KKGroundMaterial.BLEND_DST);
    }

    set blendDst(value: number) {
        this._shaderValues.setInt(KKGroundMaterial.BLEND_DST, value);
    }


	/**
	 * 深度测试方式。
	 */
    get depthTest(): number {
        return this._shaderValues.getInt(KKGroundMaterial.DEPTH_TEST);
    }

    set depthTest(value: number) {
        this._shaderValues.setInt(KKGroundMaterial.DEPTH_TEST, value);
    }



	/**
	 * 克隆。
	 * @return	 克隆副本。
	 * @override
	 */
    clone(): any {
        var dest: KKGroundMaterial = new KKGroundMaterial();
        this.cloneTo(dest);
        return dest;
    }


    public static initShader(): void {
        var attributeMap: Object = {
            'a_Position': Laya.VertexMesh.MESH_POSITION0,
            'a_Normal': Laya.VertexMesh.MESH_NORMAL0,
            'a_Texcoord0': Laya.VertexMesh.MESH_TEXTURECOORDINATE0,
            'a_BoneWeights': Laya.VertexMesh.MESH_BLENDWEIGHT0,
            'a_BoneIndices': Laya.VertexMesh.MESH_BLENDINDICES0,
            'a_MvpMatrix': Laya.VertexMesh.MESH_MVPMATRIX_ROW0,
            'a_WorldMat': Laya.VertexMesh.MESH_WORLDMATRIX_ROW0
        };
        var uniformMap: Object = {
            'u_Bones': Laya.Shader3D.PERIOD_CUSTOM,
            'u_AmbientColor': Laya.Shader3D.PERIOD_SCENE,
            'u_shadowMap1': Laya.Shader3D.PERIOD_SCENE,
            'u_shadowMap2': Laya.Shader3D.PERIOD_SCENE,
            'u_shadowMap3': Laya.Shader3D.PERIOD_SCENE,
            'u_shadowPSSMDistance': Laya.Shader3D.PERIOD_SCENE,
            'u_lightShadowVP': Laya.Shader3D.PERIOD_SCENE,
            'u_shadowPCFoffset': Laya.Shader3D.PERIOD_SCENE,
            'u_MvpMatrix': Laya.Shader3D.PERIOD_SPRITE,
            'u_AlbedoColor': Laya.Shader3D.PERIOD_MATERIAL,
            'u_AlbedoTexture': Laya.Shader3D.PERIOD_MATERIAL,
            'u_LightBuffer': Laya.Shader3D.PERIOD_SCENE,
            'u_CameraPos': Laya.Shader3D.PERIOD_CAMERA,
            'u_FogStart': Laya.Shader3D.PERIOD_SCENE,
            'u_FogRange': Laya.Shader3D.PERIOD_SCENE,
            'u_FogColor': Laya.Shader3D.PERIOD_SCENE,
            'u_AlphaTestValue': Laya.Shader3D.PERIOD_MATERIAL,
            'u_TilingOffset': Laya.Shader3D.PERIOD_MATERIAL,
            'u_WorldMat': Laya.Shader3D.PERIOD_SPRITE
        };

        KKGroundMaterial.SHADERDEFINE_ALBEDOTEXTURE = Laya.Shader3D.getDefineByName("ALBEDOTEXTURE");
        KKGroundMaterial.SHADERDEFINE_TILINGOFFSET = Laya.Shader3D.getDefineByName("TILINGOFFSET");
        KKGroundMaterial.SHADERDEFINE_ENABLEVERTEXCOLOR = Laya.Shader3D.getDefineByName("ENABLEVERTEXCOLOR");

        var customShader = Laya.Shader3D.add("KKGroundShader", null, null, true);
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

        let pass = subShader.addShaderPass(KKGroundMaterial.vs, KKGroundMaterial.ps, stateMap);
        // pass.renderState.depthWrite = true;
        // pass.renderState.depthTest = Laya.RenderState.DEPTHTEST_LEQUAL;
        // pass.renderState.cull = Laya.RenderState.CULL_BACK;
        // pass.renderState.blend = Laya.RenderState.BLEND_DISABLE;
        // pass.renderState.srcBlend = Laya.RenderState.BLENDPARAM_SRC_ALPHA;
        // pass.renderState.dstBlend = Laya.RenderState.BLENDPARAM_ONE_MINUS_SRC_ALPHA;

    }

    constructor() {
        super();
        if (!KKGroundMaterial._inited) {
            KKGroundMaterial.initShader();
            KKGroundMaterial._inited = true;

        }
        this.setShaderName("KKGroundShader");
        this._shaderValues.setVector(KKGroundMaterial.ALBEDOCOLOR, new Laya.Vector4(1.0, 1.0, 1.0, 1.0));
        this._shaderValues.setVector(KKGroundMaterial.TILINGOFFSET, new Laya.Vector4(1.0, 1.0, 0.0, 0.0));
        this.renderMode = KKGroundMaterial.RENDERMODE_OPAQUE;
    }
}




