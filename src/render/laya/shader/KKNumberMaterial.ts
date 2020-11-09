/**
 * 地面背景shader
 */
export default class KKNumberMaterial extends Laya.BaseMaterial {
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
    static NUMBER_LENGTH: number = Laya.Shader3D.propertyNameToID("u_numberLength");
    static SIZE_X: number = Laya.Shader3D.propertyNameToID("u_sizeX");
    static SIZE_Y: number = Laya.Shader3D.propertyNameToID("u_sizeY");
    static SPACE: number = Laya.Shader3D.propertyNameToID("u_space");
    static INPUT_NUMBER: number = Laya.Shader3D.propertyNameToID("u_inputNumber");
	static OFFSET: number = Laya.Shader3D.propertyNameToID("u_Offset");
	static SCALE: number = Laya.Shader3D.propertyNameToID("u_Scale");

    /** 默认材质，禁止修改*/
    static defaultMaterial: KKNumberMaterial;


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
    uniform float u_Offset;
    uniform float u_Scale;
    uniform mat4 u_ViewProjection;
    
    varying float v_posViewZ;
    #ifdef RECEIVESHADOW
        #ifdef SHADOWMAP_PSSM1 
        varying vec4 v_lightMVPPos;
        uniform mat4 u_lightShadowVP[4];
        #endif
    #endif

    #if defined(DIRECTIONLIGHT)||defined(POINTLIGHT)||defined(SPOTLIGHT)||defined(RECEIVESHADOW)
    uniform vec3 u_CameraDirection;
    varying vec3 v_ViewDir; 
    attribute vec3 a_Normal;
    varying vec3 v_Normal; 			
    varying vec3 v_PositionWorld;
    #endif

    #ifdef GPU_INSTANCE
        attribute mat4 a_WorldMat;
    #else
        uniform mat4 u_WorldMat;
    #endif

    #ifdef TILINGOFFSET
        uniform vec4 u_TilingOffset;
    #endif
    uniform float u_numberLength;
    
    #ifdef BONE
        const int c_MaxBoneCount = 24;
        attribute vec4 a_BoneIndices;
        attribute vec4 a_BoneWeights;
        uniform mat4 u_Bones[c_MaxBoneCount];
    #endif
    
    void main() {
        vec4 position;
        mat4 worldMat;
        #ifdef GPU_INSTANCE
            worldMat = a_WorldMat;
        #else
            worldMat = u_WorldMat;
        #endif
        vec4 pos=a_Position;
        pos.x*= u_numberLength;
        #ifdef BONE
            mat4 skinTransform = u_Bones[int(a_BoneIndices.x)] * a_BoneWeights.x;
            skinTransform += u_Bones[int(a_BoneIndices.y)] * a_BoneWeights.y;
            skinTransform += u_Bones[int(a_BoneIndices.z)] * a_BoneWeights.z;
            skinTransform += u_Bones[int(a_BoneIndices.w)] * a_BoneWeights.w;
            position=skinTransform*pos;
        #else
            position=worldMat*pos;
        #endif
        #ifdef GPU_INSTANCE
            gl_Position = a_MvpMatrix * position;
        #else
            gl_Position = u_MvpMatrix * position;
        #endif
    
        #if defined(DIRECTIONLIGHT)
            mat3 worldInvMat;
            #ifdef BONE
                worldInvMat=inverse(mat3(skinTransform));
            #else
                worldInvMat=inverse(mat3(worldMat));
            #endif  
            v_Normal=a_Normal*worldInvMat;	

            v_PositionWorld=(position).xyz;

            vec3 M_world = (worldMat*vec4(0.0,0.0,0.0,1.0)).xyz;					
            
            vec3 vv = v_PositionWorld - M_world;
            vv.z*=u_Scale;
            v_PositionWorld.z = M_world.z+vv.z;
            v_PositionWorld.x -= u_Offset*vv.z;

            v_ViewDir=-u_CameraDirection;
            gl_Position=u_ViewProjection*vec4(v_PositionWorld,1.0);
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
    }`;

    private static ps = `#ifdef HIGHPRECISION
    precision highp float;
#else
    precision mediump float;
#endif

#include \"Lighting.glsl\";
#include \"StdLib.glsl\";

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

uniform float u_numberLength;
uniform float u_sizeX;
uniform float u_sizeY;
uniform float u_space;
uniform float u_inputNumber;

//输入uv 与 输入数字，就会得出结果
vec2 AnimationUV(vec2 uv,float InputNumber) {

    float sourceX = 1.0 / u_sizeX;
    float sourceY = 1.0 / u_sizeY;
    //所显示图片缩放至应有的大小 
    uv.x *= sourceX;
    uv.y *= sourceY - 0.003;//如果不减会有边

    float LiftOffset =float(InputNumber) ;//输入数字
    float StartY = floor(LiftOffset / u_sizeX) ;

    float len = mod(floor(LiftOffset),floor(u_sizeX));
    uv.x += len  * sourceX;
    uv.y += (u_sizeY + StartY) * sourceY;
    //间距设置
    float s = len *sourceX;
    uv.x = (uv.x-s) *(1.0- u_space) + s + (sourceX * u_space*0.5);
    // uv.y*=-1.0;
    // uv.x*=-1.0;
    return uv;
}
        

void main()
{
    vec4 color =  u_AlbedoColor;
    #ifdef ALBEDOTEXTURE
        vec2 newUVStep = vec2(1.0 / float(u_numberLength),0.0);
        float number;
        vec4 c;

        if(u_numberLength-5.0<0.01){
                for ( int j = 0; j < 5; j++)
            {
                if (v_Texcoord0.x<((float(j) + 1.0) / float(u_numberLength)) && v_Texcoord0.x>(float(j) / float(u_numberLength))) {
                    //取一位数字
                    number = floor(mod(u_inputNumber+0.01, pow(10.0, float(u_numberLength)  - float(j))) / pow(10.0, float(u_numberLength) - 1.0 - float(j)));
                    c = texture2D(u_AlbedoTexture, AnimationUV((v_Texcoord0 - newUVStep*float(j))*vec2(float(u_numberLength), 1.0), number) );
                }                    
            }
        }
        else if(u_numberLength-4.0<0.01){
            for ( int j = 0; j < 4; j++)
            {
                if (v_Texcoord0.x<((float(j) + 1.0) / float(u_numberLength)) && v_Texcoord0.x>(float(j) / float(u_numberLength))) {
                    //取一位数字
                    number = floor(mod(u_inputNumber+0.01, pow(10.0, float(u_numberLength)  - float(j))) / pow(10.0, float(u_numberLength) - 1.0 - float(j)));
                    c = texture2D(u_AlbedoTexture, AnimationUV((v_Texcoord0 - newUVStep*float(j))*vec2(float(u_numberLength), 1.0), number) );
                }                    
            }
        }
        else if(u_numberLength-3.0<0.01){
            for ( int j = 0; j < 3; j++)
            {
                if (v_Texcoord0.x<((float(j) + 1.0) / float(u_numberLength)) && v_Texcoord0.x>(float(j) / float(u_numberLength))) {
                    //取一位数字
                    number = floor(mod(u_inputNumber+0.01, pow(10.0, float(u_numberLength)  - float(j))) / pow(10.0, float(u_numberLength) - 1.0 - float(j)));
                    c = texture2D(u_AlbedoTexture, AnimationUV((v_Texcoord0 - newUVStep*float(j))*vec2(float(u_numberLength), 1.0), number) );
                }                    
            }
        }
        else if(u_numberLength-2.0<0.01){
            for ( int j = 0; j < 2; j++)
            {
                if (v_Texcoord0.x<((float(j) + 1.0) / float(u_numberLength)) && v_Texcoord0.x>(float(j) / float(u_numberLength))) {
                    //取一位数字
                    number = floor(mod(u_inputNumber+0.01, pow(10.0, float(u_numberLength)  - float(j))) / pow(10.0, float(u_numberLength) - 1.0 - float(j)));
                    c = texture2D(u_AlbedoTexture, AnimationUV((v_Texcoord0 - newUVStep*float(j))*vec2(float(u_numberLength), 1.0), number) );
                }                    
            }
        }
        else if(u_numberLength-1.0<0.01){

            c = texture2D(u_AlbedoTexture, AnimationUV(v_Texcoord0, u_inputNumber) );                 

        }
        

        color *= c;
        
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
    
}`;

    get _NumLengh() {
		return this._shaderValues.getNumber(KKNumberMaterial.NUMBER_LENGTH);
	}
	set _NumLengh(value) {
		this._shaderValues.setNumber(KKNumberMaterial.NUMBER_LENGTH, value);
    }
    get _SizeX() {
		return this._shaderValues.getNumber(KKNumberMaterial.SIZE_X);
	}
	set _SizeX(value) {
		this._shaderValues.setNumber(KKNumberMaterial.SIZE_X, value);
    }
    get _SizeY() {
		return this._shaderValues.getNumber(KKNumberMaterial.SIZE_Y);
	}
	set _SizeY(value) {
		this._shaderValues.setNumber(KKNumberMaterial.SIZE_Y, value);
    }
    get _Space() {
		return this._shaderValues.getNumber(KKNumberMaterial.SPACE);
	}
	set _Space(value) {
		this._shaderValues.setNumber(KKNumberMaterial.SPACE, value);
    }
    get _InputNumber() {
		return this._shaderValues.getNumber(KKNumberMaterial.INPUT_NUMBER);
	}
	set _InputNumber(value) {
		this._shaderValues.setNumber(KKNumberMaterial.INPUT_NUMBER, value);
    }
    
    get _Offset() {
		return this._shaderValues.getNumber(KKNumberMaterial.OFFSET);
	}
	set _Offset(value) {
		this._shaderValues.setNumber(KKNumberMaterial.OFFSET, value);
	}
	get _Scale() {
		return this._shaderValues.getNumber(KKNumberMaterial.SCALE);
	}
	set _Scale(value) {
		this._shaderValues.setNumber(KKNumberMaterial.SCALE, value);
	}

	/**
	 * @internal
	 */
    get _ColorR(): number {
        return this._albedoColor.x;
    }

    set _ColorR(value: number) {
        this._albedoColor.x = value;
        this._Color = this._albedoColor;
    }

	/**
	 * @internal
	 */
    get _ColorG(): number {
        return this._albedoColor.y;
    }

    set _ColorG(value: number) {
        this._albedoColor.y = value;
        this._Color = this._albedoColor;
    }

	/**
	 * @internal
	 */
    get _ColorB(): number {
        return this._albedoColor.z;
    }

    set _ColorB(value: number) {
        this._albedoColor.z = value;
        this._Color = this._albedoColor;
    }

	/**
	 * @internal 
	 */
    get _ColorA(): number {
        return this._albedoColor.w;
    }

    set _ColorA(value: number) {
        this._albedoColor.w = value;
        this._Color = this._albedoColor;
    }

	/**
	 * @internal
	 */
    get _AlbedoIntensity(): number {
        return this._albedoIntensity;
    }

    set _AlbedoIntensity(value: number) {
        if (this._albedoIntensity !== value) {
            var finalAlbedo: Laya.Vector4 = (<Laya.Vector4>this._shaderValues.getVector(KKNumberMaterial.ALBEDOCOLOR));
            Laya.Vector4.scale(this._albedoColor, value, finalAlbedo);
            this._albedoIntensity = value;
            this._shaderValues.setVector(KKNumberMaterial.ALBEDOCOLOR, finalAlbedo);
        }
    }

	/**
	 * @internal
	 */
    get _MainTex_STX(): number {
        return this._shaderValues.getVector(KKNumberMaterial.TILINGOFFSET).x;
    }

    set _MainTex_STX(x: number) {
        var tilOff: Laya.Vector4 = (<Laya.Vector4>this._shaderValues.getVector(KKNumberMaterial.TILINGOFFSET));
        tilOff.x = x;
        this.tilingOffset = tilOff;
    }

	/**
	 * @internal
	 */
    get _MainTex_STY(): number {
        return this._shaderValues.getVector(KKNumberMaterial.TILINGOFFSET).y;
    }

    set _MainTex_STY(y: number) {
        var tilOff: Laya.Vector4 = (<Laya.Vector4>this._shaderValues.getVector(KKNumberMaterial.TILINGOFFSET));
        tilOff.y = y;
        this.tilingOffset = tilOff;
    }

	/**
	 * @internal
	 */
    get _MainTex_STZ(): number {
        return this._shaderValues.getVector(KKNumberMaterial.TILINGOFFSET).z;
    }

    set _MainTex_STZ(z: number) {
        var tilOff: Laya.Vector4 = (<Laya.Vector4>this._shaderValues.getVector(KKNumberMaterial.TILINGOFFSET));
        tilOff.z = z;
        this.tilingOffset = tilOff;
    }

	/**
	 * @internal
	 */
    get _MainTex_STW(): number {
        return this._shaderValues.getVector(KKNumberMaterial.TILINGOFFSET).w;
    }

    set _MainTex_STW(w: number) {
        var tilOff: Laya.Vector4 = (<Laya.Vector4>this._shaderValues.getVector(KKNumberMaterial.TILINGOFFSET));
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
    get _Color(): Laya.Vector4 {
        return this._shaderValues.getVector(KKNumberMaterial.ALBEDOCOLOR);
    }

    set _Color(value: Laya.Vector4) {
        this._shaderValues.setVector(KKNumberMaterial.ALBEDOCOLOR, value);
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
    get _MainTex(): Laya.BaseTexture {
        return this._shaderValues.getTexture(KKNumberMaterial.ALBEDOTEXTURE);
    }

    set _MainTex(value: Laya.BaseTexture) {
        if (value)
            this._shaderValues.addDefine(KKNumberMaterial.SHADERDEFINE_ALBEDOTEXTURE);
        else
            this._shaderValues.removeDefine(KKNumberMaterial.SHADERDEFINE_ALBEDOTEXTURE);
        this._shaderValues.setTexture(KKNumberMaterial.ALBEDOTEXTURE, value);
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
        return (<Laya.Vector4>this._shaderValues.getVector(KKNumberMaterial.TILINGOFFSET));
    }

    set tilingOffset(value: Laya.Vector4) {
        if (value) {
            if (value.x != 1 || value.y != 1 || value.z != 0 || value.w != 0)
                this._shaderValues.addDefine(KKNumberMaterial.SHADERDEFINE_TILINGOFFSET);
            else
                this._shaderValues.removeDefine(KKNumberMaterial.SHADERDEFINE_TILINGOFFSET);
        } else {
            this._shaderValues.removeDefine(KKNumberMaterial.SHADERDEFINE_TILINGOFFSET);
        }
        this._shaderValues.setVector(KKNumberMaterial.TILINGOFFSET, value);
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
            this._shaderValues.addDefine(KKNumberMaterial.SHADERDEFINE_ENABLEVERTEXCOLOR);
        else
            this._shaderValues.removeDefine(KKNumberMaterial.SHADERDEFINE_ENABLEVERTEXCOLOR);
    }

	/**
	 * 渲染模式。
	 */
    set renderMode(value: number) {
        switch (value) {
            case KKNumberMaterial.RENDERMODE_OPAQUE:
                this.alphaTest = false;
                this.renderQueue = Laya.BaseMaterial.RENDERQUEUE_OPAQUE;
                this.depthWrite = true;
                this.cull = Laya.RenderState.CULL_BACK;
                this.blend = Laya.RenderState.BLEND_DISABLE;
                this.depthTest = Laya.RenderState.DEPTHTEST_LESS;
                break;
            case KKNumberMaterial.RENDERMODE_CUTOUT:
                this.renderQueue = Laya.BaseMaterial.RENDERQUEUE_ALPHATEST;
                this.alphaTest = true;
                this.depthWrite = true;
                this.cull = Laya.RenderState.CULL_BACK;
                this.blend = Laya.RenderState.BLEND_DISABLE;
                this.depthTest = Laya.RenderState.DEPTHTEST_LESS;
                break;
            case KKNumberMaterial.RENDERMODE_TRANSPARENT:
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
                throw new Error("KKNumberMaterial : renderMode value error.");
        }
    }



	/**
	 * 是否写入深度。
	 */
    get depthWrite(): boolean {
        return this._shaderValues.getBool(KKNumberMaterial.DEPTH_WRITE);
    }

    set depthWrite(value: boolean) {
        this._shaderValues.setBool(KKNumberMaterial.DEPTH_WRITE, value);
    }



	/**
	 * 剔除方式。
	 */
    get cull(): number {
        return this._shaderValues.getInt(KKNumberMaterial.CULL);
    }

    set cull(value: number) {
        this._shaderValues.setInt(KKNumberMaterial.CULL, value);
    }


	/**
	 * 混合方式。
	 */
    get blend(): number {
        return this._shaderValues.getInt(KKNumberMaterial.BLEND);
    }

    set blend(value: number) {
        this._shaderValues.setInt(KKNumberMaterial.BLEND, value);
    }


	/**
	 * 混合源。
	 */
    get blendSrc(): number {
        return this._shaderValues.getInt(KKNumberMaterial.BLEND_SRC);
    }

    set blendSrc(value: number) {
        this._shaderValues.setInt(KKNumberMaterial.BLEND_SRC, value);
    }



	/**
	 * 混合目标。
	 */
    get blendDst(): number {
        return this._shaderValues.getInt(KKNumberMaterial.BLEND_DST);
    }

    set blendDst(value: number) {
        this._shaderValues.setInt(KKNumberMaterial.BLEND_DST, value);
    }


	/**
	 * 深度测试方式。
	 */
    get depthTest(): number {
        return this._shaderValues.getInt(KKNumberMaterial.DEPTH_TEST);
    }

    set depthTest(value: number) {
        this._shaderValues.setInt(KKNumberMaterial.DEPTH_TEST, value);
    }



	/**
	 * 克隆。
	 * @return	 克隆副本。
	 * @override
	 */
    clone(): any {
        var dest: KKNumberMaterial = new KKNumberMaterial();
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
            'u_numberLength': Laya.Shader3D.PERIOD_MATERIAL,
            'u_sizeX': Laya.Shader3D.PERIOD_MATERIAL,
            'u_sizeY': Laya.Shader3D.PERIOD_MATERIAL,
            'u_space': Laya.Shader3D.PERIOD_MATERIAL,
            'u_inputNumber': Laya.Shader3D.PERIOD_MATERIAL,
            'u_LightBuffer': Laya.Shader3D.PERIOD_SCENE,
            'u_CameraPos': Laya.Shader3D.PERIOD_CAMERA,
            'u_FogStart': Laya.Shader3D.PERIOD_SCENE,
            'u_FogRange': Laya.Shader3D.PERIOD_SCENE,
            'u_FogColor': Laya.Shader3D.PERIOD_SCENE,
            'u_AlphaTestValue': Laya.Shader3D.PERIOD_MATERIAL,
            'u_WorldMat': Laya.Shader3D.PERIOD_SPRITE,
			'u_Offset': Laya.Shader3D.PERIOD_MATERIAL,
			'u_Scale': Laya.Shader3D.PERIOD_MATERIAL,
			'u_ViewProjection': Laya.Shader3D.PERIOD_CAMERA
        };

        KKNumberMaterial.SHADERDEFINE_ALBEDOTEXTURE = Laya.Shader3D.getDefineByName("ALBEDOTEXTURE");
        KKNumberMaterial.SHADERDEFINE_TILINGOFFSET = Laya.Shader3D.getDefineByName("TILINGOFFSET");
        KKNumberMaterial.SHADERDEFINE_ENABLEVERTEXCOLOR = Laya.Shader3D.getDefineByName("ENABLEVERTEXCOLOR");

        var customShader = Laya.Shader3D.add("KKNumberShader", null, null, true);
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

        let pass = subShader.addShaderPass(KKNumberMaterial.vs, KKNumberMaterial.ps);
        pass.renderState.depthWrite = true;
        pass.renderState.depthTest = Laya.RenderState.DEPTHTEST_LEQUAL;
        pass.renderState.cull = Laya.RenderState.CULL_BACK;
        pass.renderState.blend = Laya.RenderState.BLEND_ENABLE_ALL;
        pass.renderState.srcBlend = Laya.RenderState.BLENDPARAM_SRC_ALPHA;
        pass.renderState.dstBlend = Laya.RenderState.BLENDPARAM_ONE_MINUS_SRC_ALPHA;

    }

    constructor() {
        super();
        if (!KKNumberMaterial._inited) {
            KKNumberMaterial.initShader();
            KKNumberMaterial._inited = true;

        }
        this.setShaderName("KKNumberShader");
        this._shaderValues.setVector(KKNumberMaterial.ALBEDOCOLOR, new Laya.Vector4(1.0, 1.0, 1.0, 1.0));
        this._shaderValues.setNumber(KKNumberMaterial.OFFSET, 0.169);
        this._shaderValues.setNumber(KKNumberMaterial.SCALE, 1.52);

    }
}




