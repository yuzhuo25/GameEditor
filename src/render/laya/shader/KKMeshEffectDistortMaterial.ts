
/**
 * 地面背景shader
 */
export default class KKMeshEffectDistortMaterial extends Laya.BaseMaterial {
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
    static SHADERDEFINE_DISTORTTEXTURE: Laya.ShaderDefine;
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
    static defaultMaterial: KKMeshEffectDistortMaterial;

    static TIME = Laya.Shader3D.propertyNameToID("u_Time");
    static STARTTIME = Laya.Shader3D.propertyNameToID("u_StartTime");
    static SPEEDX = Laya.Shader3D.propertyNameToID("u_SpeedX");
    static SPEEDY = Laya.Shader3D.propertyNameToID("u_SpeedY");

    static DISTORTTEXTURE: number = Laya.Shader3D.propertyNameToID("u_DistortTexture");
    static DISTORTOFFSETX = Laya.Shader3D.propertyNameToID("u_DistortOffsetX");
    static DISTORTOFFSETY = Laya.Shader3D.propertyNameToID("u_DistortOffsetY");
    static DISTORTSPEEDX = Laya.Shader3D.propertyNameToID("u_DistortSpeedX");
    static DISTORTSPEEDY = Laya.Shader3D.propertyNameToID("u_DistortSpeedY");
    static DISTORTSTRANGTH = Laya.Shader3D.propertyNameToID("u_DistortStrangth");


    private _albedoColor: Laya.Vector4 = new Laya.Vector4(1.0, 1.0, 1.0, 1.0);
    private _albedoIntensity: number = 1.0;
    private _enableVertexColor: boolean = false;

    private static vs = `#include "Lighting.glsl";

		attribute vec4 a_Position;
		attribute vec4 a_Color;
		attribute vec2 a_Texcoord0;
		
		#ifdef GPU_INSTANCE
			attribute mat4 a_MvpMatrix;
		#else
			uniform mat4 u_MvpMatrix;
        #endif
        
        uniform float u_DistortOffsetX;
        uniform float u_DistortOffsetY;

		varying vec4 v_Color;
        varying vec2 v_Texcoord0;
        varying vec2 v_Texcoord1;
		varying float v_posViewZ;
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
            

			#ifdef TILINGOFFSET
				v_Texcoord0=TransformUV(a_Texcoord0,u_TilingOffset);
			#else
				v_Texcoord0=a_Texcoord0;
            #endif            
            
            v_Texcoord1 = TransformUV(a_Texcoord0,vec4(u_DistortOffsetX, u_DistortOffsetY,0.0,0.0));         
		
			#if defined(COLOR)&&defined(ENABLEVERTEXCOLOR)
				v_Color = a_Color;
			#endif

			gl_Position=remapGLPositionZ(gl_Position);
		}`;

    private static ps = `#ifdef HIGHPRECISION
		precision highp float;
	#else
		precision mediump float;
	#endif
	

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
    
    #ifdef DISTORTTEXTURE
        uniform sampler2D u_DistortTexture;        
    #endif
    varying vec2 v_Texcoord1;

    uniform float u_Time;
    uniform float u_StartTime;
    uniform float u_SpeedX;
    uniform float u_SpeedY;
    uniform float u_DistortSpeedX;
    uniform float u_DistortSpeedY;
    uniform float u_DistortStrangth;

	#ifdef FOG
		uniform float u_FogStart;
		uniform float u_FogRange;
		#ifdef ADDTIVEFOG
		#else
			uniform vec3 u_FogColor;
		#endif
	#endif
	varying float v_posViewZ;

	void main()
	{
        float time = u_Time - u_StartTime;

        vec2 distortUV = v_Texcoord1;
        if(u_DistortSpeedX != 0.0 || u_DistortSpeedY != 0.0){
            distortUV.x += u_DistortSpeedX * time;
            distortUV.y += u_DistortSpeedY * time;
        }

        vec2 baseUV = v_Texcoord0;
        if(u_SpeedX != 0.0 || u_SpeedY != 0.0){
            baseUV.x += u_SpeedX * time;
            baseUV.y += u_SpeedY * time;
        }

        vec4 color =  u_AlbedoColor*2.0;
        float distort = 0.0;
        
        #ifdef DISTORTTEXTURE
            distort = texture2D(u_DistortTexture, distortUV).r * u_DistortStrangth;
        #endif
        
        #ifdef ALBEDOTEXTURE
            //为了和unity统一，Y改为负值
            color *= texture2D(u_AlbedoTexture, baseUV + vec2(distort, -distort));
        #endif
        
		#if defined(COLOR)&&defined(ENABLEVERTEXCOLOR)
			color *= v_Color;
		#endif

		#ifdef ALPHATEST
			if(color.a < u_AlphaTestValue)
				discard;
		#endif
		
        gl_FragColor = color;
	

		#ifdef FOG
			float lerpFact = clamp((1.0 / gl_FragCoord.w - u_FogStart) / u_FogRange, 0.0, 1.0);
			#ifdef ADDTIVEFOG
				gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(0.0), lerpFact);
			#else
				gl_FragColor.rgb = mix(gl_FragColor.rgb, u_FogColor, lerpFact);
			#endif
		#endif
		
	}`;


    /**
     * 获取漫反射贴图。
     * @return 漫反射贴图。
     */
    get _MainTex() {
        return this._shaderValues.getTexture(KKMeshEffectDistortMaterial.ALBEDOTEXTURE);
    }

    /**
     * 设置漫反射贴图。
     * @param value 漫反射贴图。
     */
    set _MainTex(value) {
        this._shaderValues.setTexture(KKMeshEffectDistortMaterial.ALBEDOTEXTURE, value);
        if (value)
            this._shaderValues.addDefine(KKMeshEffectDistortMaterial.SHADERDEFINE_ALBEDOTEXTURE);
        else
            this._shaderValues.removeDefine(KKMeshEffectDistortMaterial.SHADERDEFINE_ALBEDOTEXTURE);
    }

    
    /**
     * 获取扰动贴图。
     * @return 扰动贴图。
     */
    get _DistortTex() {
        return this._shaderValues.getTexture(KKMeshEffectDistortMaterial.DISTORTTEXTURE);
    }

    /**
     * 设置扰动贴图。
     * @param value 扰动贴图。
     */
    set _DistortTex(value) {
        this._shaderValues.setTexture(KKMeshEffectDistortMaterial.DISTORTTEXTURE, value);
        if (value)
            this._shaderValues.addDefine(KKMeshEffectDistortMaterial.SHADERDEFINE_DISTORTTEXTURE);
        else
            this._shaderValues.removeDefine(KKMeshEffectDistortMaterial.SHADERDEFINE_DISTORTTEXTURE);
    }

    /**
 * 获取主颜色。
 * @return 主颜色
 */
    get _Color() {
        return this._shaderValues.getVector(KKMeshEffectDistortMaterial.ALBEDOCOLOR);
    }

    /**
     * 设置主颜色。
     * @param value 主颜色
     */
    set _Color(value) {
        this._shaderValues.setVector(KKMeshEffectDistortMaterial.ALBEDOCOLOR, value);
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

    get _TintColor() {
        return this._shaderValues.getVector(KKMeshEffectDistortMaterial.ALBEDOCOLOR);
    }

    /**
     * 设置主颜色。
     * @param value 主颜色
     */
    set _TintColor(value) {
        this._shaderValues.setVector(KKMeshEffectDistortMaterial.ALBEDOCOLOR, value);
    }

	/**
	 * @internal
	 */
    get _TintColorR(): number {
        return this._albedoColor.x;
    }

    set _TintColorR(value: number) {
        this._albedoColor.x = value;
        this.albedoColor = this._albedoColor;
    }

	/**
	 * @internal
	 */
    get _TintColorG(): number {
        return this._albedoColor.y;
    }

    set _TintColorG(value: number) {
        this._albedoColor.y = value;
        this.albedoColor = this._albedoColor;
    }

	/**
	 * @internal
	 */
    get _TintColorB(): number {
        return this._albedoColor.z;
    }

    set _TintColorB(value: number) {
        this._albedoColor.z = value;
        this.albedoColor = this._albedoColor;
    }

	/**
	 * @internal 
	 */
    get _TintColorA(): number {
        return this._albedoColor.w;
    }

    set _TintColorA(value: number) {
        this._albedoColor.w = value;
        this.albedoColor = this._albedoColor;
    }


    /**
     * 获取UV动画速度X。
     * @return UV动画速度X
     */
    get _SpeedX() {
        return this._shaderValues.getNumber(KKMeshEffectDistortMaterial.SPEEDX);
    }

    /**
     * 设置UV动画速度X。
     * @param value UV动画速度X
     */
    set _SpeedX(value) {
        this._shaderValues.setNumber(KKMeshEffectDistortMaterial.SPEEDX, value);
    }

    /**
 * 获取UV动画速度Y。
 * @return UV动画速度Y
 */
    get _SpeedY() {
        return this._shaderValues.getNumber(KKMeshEffectDistortMaterial.SPEEDY);
    }

    /**
     * 设置UV动画速度Y。
     * @param value UV动画速度Y
     */
    set _SpeedY(value) {
        this._shaderValues.setNumber(KKMeshEffectDistortMaterial.SPEEDY, value);
    }

	/**
	 * @internal
	 */
    get _AlbedoIntensity(): number {
        return this._albedoIntensity;
    }

    set _AlbedoIntensity(value: number) {
        if (this._albedoIntensity !== value) {
            var finalAlbedo: Laya.Vector4 = (<Laya.Vector4>this._shaderValues.getVector(KKMeshEffectDistortMaterial.ALBEDOCOLOR));
            Laya.Vector4.scale(this._albedoColor, value, finalAlbedo);
            this._albedoIntensity = value;
            this._shaderValues.setVector(KKMeshEffectDistortMaterial.ALBEDOCOLOR, finalAlbedo);
        }
    }

	/**
	 * @internal
	 */
    get _MainTex_STX(): number {
        return this._shaderValues.getVector(KKMeshEffectDistortMaterial.TILINGOFFSET).x;
    }

    set _MainTex_STX(x: number) {
        var tilOff: Laya.Vector4 = (<Laya.Vector4>this._shaderValues.getVector(KKMeshEffectDistortMaterial.TILINGOFFSET));
        tilOff.x = x;
        this.tilingOffset = tilOff;
    }

	/**
	 * @internal
	 */
    get _MainTex_STY(): number {
        return this._shaderValues.getVector(KKMeshEffectDistortMaterial.TILINGOFFSET).y;
    }

    set _MainTex_STY(y: number) {
        var tilOff: Laya.Vector4 = (<Laya.Vector4>this._shaderValues.getVector(KKMeshEffectDistortMaterial.TILINGOFFSET));
        tilOff.y = y;
        this.tilingOffset = tilOff;
    }

	/**
	 * @internal
	 */
    get _MainTex_STZ(): number {
        return this._shaderValues.getVector(KKMeshEffectDistortMaterial.TILINGOFFSET).z;
    }

    set _MainTex_STZ(z: number) {
        var tilOff: Laya.Vector4 = (<Laya.Vector4>this._shaderValues.getVector(KKMeshEffectDistortMaterial.TILINGOFFSET));
        tilOff.z = z;
        this.tilingOffset = tilOff;
    }

	/**
	 * @internal
	 */
    get _MainTex_STW(): number {
        return this._shaderValues.getVector(KKMeshEffectDistortMaterial.TILINGOFFSET).w;
    }

    set _MainTex_STW(w: number) {
        var tilOff: Laya.Vector4 = (<Laya.Vector4>this._shaderValues.getVector(KKMeshEffectDistortMaterial.TILINGOFFSET));
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
        var finalAlbedo: Laya.Vector4 = (<Laya.Vector4>this._shaderValues.getVector(KKMeshEffectDistortMaterial.ALBEDOCOLOR));
        Laya.Vector4.scale(value, this._albedoIntensity, finalAlbedo);
        this._albedoColor = value;
        this._shaderValues.setVector(KKMeshEffectDistortMaterial.ALBEDOCOLOR, finalAlbedo);
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
        return this._shaderValues.getTexture(KKMeshEffectDistortMaterial.ALBEDOTEXTURE);
    }

    set albedoTexture(value: Laya.BaseTexture) {
        if (value)
            this._shaderValues.addDefine(KKMeshEffectDistortMaterial.SHADERDEFINE_ALBEDOTEXTURE);
        else
            this._shaderValues.removeDefine(KKMeshEffectDistortMaterial.SHADERDEFINE_ALBEDOTEXTURE);
        this._shaderValues.setTexture(KKMeshEffectDistortMaterial.ALBEDOTEXTURE, value);
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
        return (<Laya.Vector4>this._shaderValues.getVector(KKMeshEffectDistortMaterial.TILINGOFFSET));
    }

    set tilingOffset(value: Laya.Vector4) {
        if (value) {
            if (value.x != 1 || value.y != 1 || value.z != 0 || value.w != 0)
                this._shaderValues.addDefine(KKMeshEffectDistortMaterial.SHADERDEFINE_TILINGOFFSET);
            else
                this._shaderValues.removeDefine(KKMeshEffectDistortMaterial.SHADERDEFINE_TILINGOFFSET);
        } else {
            this._shaderValues.removeDefine(KKMeshEffectDistortMaterial.SHADERDEFINE_TILINGOFFSET);
        }
        this._shaderValues.setVector(KKMeshEffectDistortMaterial.TILINGOFFSET, value);
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
            this._shaderValues.addDefine(KKMeshEffectDistortMaterial.SHADERDEFINE_ENABLEVERTEXCOLOR);
        else
            this._shaderValues.removeDefine(KKMeshEffectDistortMaterial.SHADERDEFINE_ENABLEVERTEXCOLOR);
    }

	/**
	 * 渲染模式。
	 */
    set renderMode(value: number) {
        switch (value) {
            case KKMeshEffectDistortMaterial.RENDERMODE_OPAQUE:
                this.alphaTest = false;
                this.renderQueue = Laya.BaseMaterial.RENDERQUEUE_OPAQUE;
                this.depthWrite = true;
                this.cull = Laya.RenderState.CULL_BACK;
                this.blend = Laya.RenderState.BLEND_DISABLE;
                this.depthTest = Laya.RenderState.DEPTHTEST_LESS;
                break;
            case KKMeshEffectDistortMaterial.RENDERMODE_CUTOUT:
                this.renderQueue = Laya.BaseMaterial.RENDERQUEUE_ALPHATEST;
                this.alphaTest = true;
                this.depthWrite = true;
                this.cull = Laya.RenderState.CULL_BACK;
                this.blend = Laya.RenderState.BLEND_DISABLE;
                this.depthTest = Laya.RenderState.DEPTHTEST_LESS;
                break;
            case KKMeshEffectDistortMaterial.RENDERMODE_TRANSPARENT:
                this.renderQueue = Laya.BaseMaterial.RENDERQUEUE_TRANSPARENT;
                this.depthWrite = false;
                this.cull = Laya.RenderState.CULL_NONE;
                this.blend = Laya.RenderState.BLEND_ENABLE_ALL;
                this.blendSrc = Laya.RenderState.BLENDPARAM_SRC_ALPHA;
                this.blendDst = Laya.RenderState.BLENDPARAM_ONE_MINUS_SRC_ALPHA;
                this.depthTest = Laya.RenderState.DEPTHTEST_LESS;
                break;
            case KKMeshEffectDistortMaterial.RENDERMODE_ADDTIVE:
                this.renderQueue = Laya.BaseMaterial.RENDERQUEUE_TRANSPARENT;
                this.depthWrite = false;
                this.cull = Laya.RenderState.CULL_NONE;
                this.blend = Laya.RenderState.BLEND_ENABLE_ALL;
                this.blendSrc = Laya.RenderState.BLENDPARAM_SRC_ALPHA;
                this.blendDst = Laya.RenderState.BLENDPARAM_ONE;
                this.depthTest = Laya.RenderState.DEPTHTEST_LESS;
                break;
            default:
                throw new Error("KKMeshEffectDistortMaterial : renderMode value error.");
        }
    }



	/**
	 * 是否写入深度。
	 */
    get depthWrite(): boolean {
        return this._shaderValues.getBool(KKMeshEffectDistortMaterial.DEPTH_WRITE);
    }

    set depthWrite(value: boolean) {
        this._shaderValues.setBool(KKMeshEffectDistortMaterial.DEPTH_WRITE, value);
    }



	/**
	 * 剔除方式。
	 */
    get cull(): number {
        return this._shaderValues.getInt(KKMeshEffectDistortMaterial.CULL);
    }

    set cull(value: number) {
        this._shaderValues.setInt(KKMeshEffectDistortMaterial.CULL, value);
    }


	/**
	 * 混合方式。
	 */
    get blend(): number {
        return this._shaderValues.getInt(KKMeshEffectDistortMaterial.BLEND);
    }

    set blend(value: number) {
        this._shaderValues.setInt(KKMeshEffectDistortMaterial.BLEND, value);
    }


	/**
	 * 混合源。
	 */
    get blendSrc(): number {
        return this._shaderValues.getInt(KKMeshEffectDistortMaterial.BLEND_SRC);
    }

    set blendSrc(value: number) {
        this._shaderValues.setInt(KKMeshEffectDistortMaterial.BLEND_SRC, value);
    }



	/**
	 * 混合目标。
	 */
    get blendDst(): number {
        return this._shaderValues.getInt(KKMeshEffectDistortMaterial.BLEND_DST);
    }

    set blendDst(value: number) {
        this._shaderValues.setInt(KKMeshEffectDistortMaterial.BLEND_DST, value);
    }


	/**
	 * 深度测试方式。
	 */
    get depthTest(): number {
        return this._shaderValues.getInt(KKMeshEffectDistortMaterial.DEPTH_TEST);
    }

    set depthTest(value: number) {
        this._shaderValues.setInt(KKMeshEffectDistortMaterial.DEPTH_TEST, value);
    }

	/**
	 * 开始时间
	 */
    get _StartTime(): number {
        return this._shaderValues.getNumber(KKMeshEffectDistortMaterial.STARTTIME);
    }

    set _StartTime(value: number) {
        this._shaderValues.setNumber(KKMeshEffectDistortMaterial.STARTTIME, value);
    }

    get _DistortOffsetX(): number {
        return this._shaderValues.getNumber(KKMeshEffectDistortMaterial.DISTORTOFFSETX);
    }

    set _DistortOffsetX(value: number) {
        this._shaderValues.setNumber(KKMeshEffectDistortMaterial.DISTORTOFFSETX, value);
    }

    get _DistortOffsetY(): number {
        return this._shaderValues.getNumber(KKMeshEffectDistortMaterial.DISTORTOFFSETY);
    }

    set _DistortOffsetY(value: number) {
        this._shaderValues.setNumber(KKMeshEffectDistortMaterial.DISTORTOFFSETY, value);
    }

    get _DistortSpeedX(): number {
        return this._shaderValues.getNumber(KKMeshEffectDistortMaterial.DISTORTSPEEDX);
    }

    set _DistortSpeedX(value: number) {
        this._shaderValues.setNumber(KKMeshEffectDistortMaterial.DISTORTSPEEDX, value);
    }

    get _DistortSpeedY(): number {
        return this._shaderValues.getNumber(KKMeshEffectDistortMaterial.DISTORTSPEEDY);
    }

    set _DistortSpeedY(value: number) {
        this._shaderValues.setNumber(KKMeshEffectDistortMaterial.DISTORTSPEEDY, value);
    }

    get _DistortStrangth(): number {
        return this._shaderValues.getNumber(KKMeshEffectDistortMaterial.DISTORTSTRANGTH);
    }

    set _DistortStrangth(value: number) {
        this._shaderValues.setNumber(KKMeshEffectDistortMaterial.DISTORTSTRANGTH, value);
    }

	/**
	 * 克隆。
	 * @return	 克隆副本。
	 * @override
	 */
    clone(): any {
        var dest: KKMeshEffectDistortMaterial = new KKMeshEffectDistortMaterial();
        this.cloneTo(dest);
        return dest;
    }


    public static initShader(): void {
        var attributeMap: Object = {
            'a_Position': Laya.VertexMesh.MESH_POSITION0,
            'a_Color': Laya.VertexMesh.MESH_COLOR0,
            'a_Texcoord0': Laya.VertexMesh.MESH_TEXTURECOORDINATE0,
            'a_BoneWeights': Laya.VertexMesh.MESH_BLENDWEIGHT0,
            'a_BoneIndices': Laya.VertexMesh.MESH_BLENDINDICES0,
            'a_MvpMatrix': Laya.VertexMesh.MESH_MVPMATRIX_ROW0,
            'a_WorldMat': Laya.VertexMesh.MESH_WORLDMATRIX_ROW0
        };
        var uniformMap: Object = {
            'u_Bones': Laya.Shader3D.PERIOD_CUSTOM,
            'u_MvpMatrix': Laya.Shader3D.PERIOD_SPRITE,
            'u_AlbedoColor': Laya.Shader3D.PERIOD_MATERIAL,
            'u_AlbedoTexture': Laya.Shader3D.PERIOD_MATERIAL,
            'u_DistortTexture': Laya.Shader3D.PERIOD_MATERIAL,
            'u_Time': Laya.Shader3D.PERIOD_SCENE,
            'u_StartTime': Laya.Shader3D.PERIOD_MATERIAL,
            'u_SpeedX': Laya.Shader3D.PERIOD_MATERIAL,
            'u_SpeedY': Laya.Shader3D.PERIOD_MATERIAL,
            'u_DistortSpeedX': Laya.Shader3D.PERIOD_MATERIAL,
            'u_DistortSpeedY': Laya.Shader3D.PERIOD_MATERIAL,
            'u_DistortStrangth': Laya.Shader3D.PERIOD_MATERIAL,
            'u_DistortOffsetX': Laya.Shader3D.PERIOD_MATERIAL,
            'u_DistortOffsetY': Laya.Shader3D.PERIOD_MATERIAL,
        
            'u_FogStart': Laya.Shader3D.PERIOD_SCENE,
            'u_FogRange': Laya.Shader3D.PERIOD_SCENE,
            'u_FogColor': Laya.Shader3D.PERIOD_SCENE,
            'u_AlphaTestValue': Laya.Shader3D.PERIOD_MATERIAL,
            'u_TilingOffset': Laya.Shader3D.PERIOD_MATERIAL
        };

        KKMeshEffectDistortMaterial.SHADERDEFINE_DISTORTTEXTURE = Laya.Shader3D.getDefineByName("DISTORTTEXTURE");
        KKMeshEffectDistortMaterial.SHADERDEFINE_ALBEDOTEXTURE = Laya.Shader3D.getDefineByName("ALBEDOTEXTURE");
        KKMeshEffectDistortMaterial.SHADERDEFINE_TILINGOFFSET = Laya.Shader3D.getDefineByName("TILINGOFFSET");
        KKMeshEffectDistortMaterial.SHADERDEFINE_ENABLEVERTEXCOLOR = Laya.Shader3D.getDefineByName("ENABLEVERTEXCOLOR");

        var customShader = Laya.Shader3D.add("KKMeshEffectShader", null, null, true);
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

        let pass = subShader.addShaderPass(KKMeshEffectDistortMaterial.vs, KKMeshEffectDistortMaterial.ps, stateMap);
        // pass.renderState.depthWrite = true;
        // pass.renderState.depthTest = Laya.RenderState.DEPTHTEST_LEQUAL;
        // pass.renderState.cull = Laya.RenderState.CULL_BACK;
        // pass.renderState.blend = Laya.RenderState.BLEND_DISABLE;
        // pass.renderState.srcBlend = Laya.RenderState.BLENDPARAM_SRC_ALPHA;
        // pass.renderState.dstBlend = Laya.RenderState.BLENDPARAM_ONE_MINUS_SRC_ALPHA;

    }

    constructor() {
        super();
        if (!KKMeshEffectDistortMaterial._inited) {
            KKMeshEffectDistortMaterial.initShader();
            KKMeshEffectDistortMaterial._inited = true;

        }
        this.setShaderName("KKMeshEffectShader");
        this._shaderValues.setVector(KKMeshEffectDistortMaterial.ALBEDOCOLOR, new Laya.Vector4(1.0, 1.0, 1.0, 1.0));
        this._shaderValues.setVector(KKMeshEffectDistortMaterial.TILINGOFFSET, new Laya.Vector4(1.0, 1.0, 0.0, 0.0));
        this.renderMode = KKMeshEffectDistortMaterial.RENDERMODE_OPAQUE;
        this._SpeedX = 0;
        this._SpeedY = 0;
        this._StartTime = 0;
        this.enableVertexColor = true;
    }
}




