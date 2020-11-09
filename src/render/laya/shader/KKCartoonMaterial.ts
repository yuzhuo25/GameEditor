export default class KKCartoonMaterial extends Laya.BaseMaterial {
    private static _inited = false;
    public static ALBEDOTEXTURE = Laya.Shader3D.propertyNameToID("u_AlbedoTexture");
    public static ALBEDOCOLOR = Laya.Shader3D.propertyNameToID("u_AlbedoColor");
    public static HCOLOR = Laya.Shader3D.propertyNameToID("u_HighColor");
    public static SCOLOR = Laya.Shader3D.propertyNameToID("u_ShadowColor");
    public static RAMPTHRESHOLD = Laya.Shader3D.propertyNameToID("u_RampThreshold");
    public static RAMPSMOOTH = Laya.Shader3D.propertyNameToID("u_RampSmooth");
    public static RIMCOLOR = Laya.Shader3D.propertyNameToID("u_RimColor");
    public static RIMMIN = Laya.Shader3D.propertyNameToID("u_RimMin");
	public static RIMMAX = Laya.Shader3D.propertyNameToID("u_RimMax");
	public static CULL: number = Laya.Shader3D.propertyNameToID("s_Cull");

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

	
	#ifdef BONE
		const int c_MaxBoneCount = 24;
		attribute vec4 a_BoneIndices;
		attribute vec4 a_BoneWeights;
		uniform mat4 u_Bones[c_MaxBoneCount];
	#endif
	varying vec3 v_PositionWorld;

	#ifdef GPU_INSTANCE
		attribute mat4 a_WorldMat;
	#else
		uniform mat4 u_WorldMat;
	#endif
	
	#if defined(DIRECTIONLIGHT)
		attribute vec3 a_Normal;
		varying vec3 v_Normal; 
		uniform vec3 u_CameraDirection;
		varying vec3 v_ViewDir; 
	#endif
	varying float v_posViewZ;
	
	
	#ifdef TILINGOFFSET
		uniform vec4 u_TilingOffset;
	#endif

	void main_castShadow()
	{
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
		mat4 worldMat;
		#ifdef GPU_INSTANCE
			worldMat = a_WorldMat;
			gl_Position = a_MvpMatrix * position;
		#else
			gl_Position = u_MvpMatrix * position;
			worldMat = u_WorldMat;
		#endif
		v_PositionWorld=(worldMat*position).xyz;

		//TODO没考虑UV动画呢
		#if defined(DIFFUSEMAP)&&defined(ALPHATEST)
			v_Texcoord0=a_Texcoord0;
		#endif
		gl_Position=remapGLPositionZ(gl_Position);
		v_posViewZ = gl_Position.z;
	}

	void main() 
	{	
		#ifdef CASTSHADOW
			main_castShadow();
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

			
			#if defined(DIRECTIONLIGHT)
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
				v_Normal=a_Normal*worldInvMat;	

				v_PositionWorld=(worldMat*position).xyz;
				v_ViewDir=-u_CameraDirection;
			#endif
		
			
			#ifdef TILINGOFFSET
				v_Texcoord0=TransformUV(a_Texcoord0,u_TilingOffset);
			#else
				v_Texcoord0=a_Texcoord0;
			#endif	
		
			gl_Position=remapGLPositionZ(gl_Position);
		#endif

	}`;

	private static ps = `#ifdef HIGHPRECISION
		precision highp float;
	#else
		precision mediump float;
	#endif
	
	#include \"Lighting.glsl\";
	#include \"StdLib.glsl\";
	uniform vec4 u_AlbedoColor;
	uniform vec4 u_HighColor;
	uniform vec4 u_ShadowColor;
	varying vec3 v_PositionWorld;

	#if defined(DIRECTIONLIGHT)
		varying vec3 v_ViewDir; 			
	#endif	

	#ifdef ALPHATEST
		uniform float u_AlphaTestValue;
	#endif

	uniform sampler2D u_AlbedoTexture;

	varying vec2 v_Texcoord0;	
	uniform float u_RampThreshold;
	uniform float u_RampSmooth;

	uniform vec4 u_RimColor;
	uniform float u_RimMin;
	uniform float u_RimMax;

	#ifdef FOG
		uniform float u_FogStart;
		uniform float u_FogRange;
		uniform vec3 u_FogColor;
	#endif
	
	
	#ifdef DIRECTIONLIGHT	
		varying vec3 v_Normal;					
		uniform sampler2D u_LightBuffer;
	#endif
	uniform vec3 u_AmbientColor;
	
	#include \"ShadowHelper.glsl\"
	varying float v_posViewZ;

	#ifdef RECEIVESHADOW
		#if defined(SHADOWMAP_PSSM2)||defined(SHADOWMAP_PSSM3)
			uniform mat4 u_lightShadowVP[4];
		#endif
		#ifdef SHADOWMAP_PSSM1 
			varying vec4 v_lightMVPPos;
		#endif
	#endif

	void main_castShadow()
	{
		//gl_FragColor=vec4(v_posViewZ,0.0,0.0,1.0);
		gl_FragColor=packDepth(v_posViewZ);
		#if defined(DIFFUSEMAP)&& defined(ALPHATEST)
			float alpha = texture2D(u_AlbedoTexture,v_Texcoord0).w;
			if( alpha < u_AlphaTestValue)
			{
				discard;
			}
		#endif

		//水平面一下模型不产生投影
		if( v_PositionWorld.y<0.0 )
		{
			discard;
		}
	}

	void main()
	{
		#ifdef CASTSHADOW		
			main_castShadow();
		#else
			vec3 globalDiffuse=u_AmbientColor;

			vec4 mainColor=u_AlbedoColor;
			vec4 difTexColor=texture2D(u_AlbedoTexture, v_Texcoord0)*mainColor;
			
			#ifdef ALPHATEST
				if(difTexColor.a<u_AlphaTestValue)
					discard;
			#endif
			



			#if defined(DIRECTIONLIGHT)	
				vec3 normal;
				normal = normalize(v_Normal);
				vec3 viewDir = normalize(v_ViewDir);
				float rim = 1.0 - clamp( dot(viewDir, normal) ,0.0,1.0);
				rim = smoothstep(u_RimMin, u_RimMax, rim);
			
				difTexColor.rgb = mix(difTexColor.rgb, u_RimColor.rgb, rim * u_RimColor.a);
				gl_FragColor = difTexColor;

				DirectionLight Dlight = getDirectionLight(u_LightBuffer,0);                                   
				float ndl = max(0.0, dot(-normal, Dlight.direction));				
				float ramp = smoothstep(u_RampThreshold - u_RampSmooth*0.5, u_RampThreshold + u_RampSmooth*0.5,ndl);

				vec3 color  =mix(u_HighColor.rgb,u_ShadowColor.rgb,u_ShadowColor.a);
				vec3 resultColor = mix(color, u_HighColor.rgb, ramp);
				vec3 diffuse = difTexColor.rgb*Dlight.color*resultColor;

				diffuse += difTexColor.rgb *globalDiffuse ;
				gl_FragColor = vec4(diffuse,difTexColor.a);

			#endif


			#ifdef FOG
				float lerpFact=clamp((1.0/gl_FragCoord.w-u_FogStart)/u_FogRange,0.0,1.0);
				gl_FragColor.rgb=mix(gl_FragColor.rgb,u_FogColor,lerpFact);
			#endif
		#endif

	}`;


    /**
     * 获取漫反射贴图。
     * @return 漫反射贴图。
     */
    get _MainTex() {
        return this._shaderValues.getTexture(KKCartoonMaterial.ALBEDOTEXTURE);
    }

    /**
     * 设置漫反射贴图。
     * @param value 漫反射贴图。
     */
    set _MainTex(value) {
        this._shaderValues.setTexture(KKCartoonMaterial.ALBEDOTEXTURE, value);
        if (value)
            this._shaderValues.addDefine(KKCartoonMaterial.SHADERDEFINE_DIFFUSEMAP);
        else
            this._shaderValues.removeDefine(KKCartoonMaterial.SHADERDEFINE_DIFFUSEMAP);
    }

	/**
     * 获取主颜色。
     * @return 主颜色
     */
    get _Color() {
        return this._shaderValues.getVector(KKCartoonMaterial.ALBEDOCOLOR);
    }

    /**
     * 设置主颜色。
     * @param value 主颜色
     */
    set _Color(value) {
        this._shaderValues.setVector(KKCartoonMaterial.ALBEDOCOLOR, value);
	}
	
	get _ColorR() {
		return this._Color.x;
	}

	set _ColorR(value) {
		this._Color.x = value;
		this._Color = this._Color;
	}
	get _ColorG() {
		return this._Color.y;
	}
	set _ColorG(value) {
		this._Color.y = value;
		this._Color = this._Color;
	}
	get _ColorB() {
		return this._Color.z;
	}
	set _ColorB(value) {
		this._Color.z = value;
		this._Color = this._Color;
	}
	get _ColorA() {
		return this._Color.w;
	}
	set _ColorA(value) {
		this._Color.w = value;
		this._Color = this._Color;
	}
	


    /**
 * 获取高亮颜色。
 * @return 高亮颜色
 */
    get _HColor() {
        return this._shaderValues.getVector(KKCartoonMaterial.HCOLOR);
    }

    /**
     * 设置高亮颜色。
     * @param value 高亮颜色
     */
    set _HColor(value) {
        this._shaderValues.setVector(KKCartoonMaterial.HCOLOR, value);
    }


    /**
 * 获取高亮颜色。
 * @return 高亮颜色
 */
    get _SColor() {
        return this._shaderValues.getVector(KKCartoonMaterial.SCOLOR);
    }

    /**
     * 设置高亮颜色。
     * @param value 高亮颜色
     */
    set _SColor(value) {
        this._shaderValues.setVector(KKCartoonMaterial.SCOLOR, value);
    }

    /**
* 获取边缘光颜色。
* @return 边缘光颜色
*/
    get _RimColor() {
        return this._shaderValues.getVector(KKCartoonMaterial.RIMCOLOR);
    }

    /**
     * 设置边缘光颜色。
     * @param value 边缘光颜色
     */
    set _RimColor(value) {
        this._shaderValues.setVector(KKCartoonMaterial.RIMCOLOR, value);
    }


    get _RampThreshold() {
        return this._shaderValues.getNumber(KKCartoonMaterial.RAMPTHRESHOLD);
    }
    set _RampThreshold(value) {
        this._shaderValues.setNumber(KKCartoonMaterial.RAMPTHRESHOLD, value);
    }
    get _RampSmooth() {
        return this._shaderValues.getNumber(KKCartoonMaterial.RAMPSMOOTH);
    }
    set _RampSmooth(value) {
        this._shaderValues.setNumber(KKCartoonMaterial.RAMPSMOOTH, value);
    }

    get _RimMin() {
        return this._shaderValues.getNumber(KKCartoonMaterial.RIMMIN);
    }
    set _RimMin(value) {
        this._shaderValues.setNumber(KKCartoonMaterial.RIMMIN, value);
    }
    get _RimMax() {
        return this._shaderValues.getNumber(KKCartoonMaterial.RIMMAX);
    }
    set _RimMax(value) {
        this._shaderValues.setNumber(KKCartoonMaterial.RIMMAX, value);
	}
	
	/**
	 * 剔除方式。
	 */
    get cull(): number {
        return this._shaderValues.getInt(KKCartoonMaterial.CULL);
    }

    set cull(value: number) {
        this._shaderValues.setInt(KKCartoonMaterial.CULL, value);
    }

    clone(): any {
        var dest: KKCartoonMaterial = new KKCartoonMaterial();
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
            'u_HighColor': Laya.Shader3D.PERIOD_MATERIAL,
            'u_ShadowColor': Laya.Shader3D.PERIOD_MATERIAL,
            'u_RampThreshold': Laya.Shader3D.PERIOD_MATERIAL,
            'u_RampSmooth': Laya.Shader3D.PERIOD_MATERIAL,
            'u_RimColor': Laya.Shader3D.PERIOD_MATERIAL,
            'u_RimMin': Laya.Shader3D.PERIOD_MATERIAL,
            'u_RimMax': Laya.Shader3D.PERIOD_MATERIAL,
            'u_LightBuffer': Laya.Shader3D.PERIOD_SCENE,
            'u_CameraDirection': Laya.Shader3D.PERIOD_CAMERA,
            'u_FogStart': Laya.Shader3D.PERIOD_SCENE,
            'u_FogRange': Laya.Shader3D.PERIOD_SCENE,
            'u_FogColor': Laya.Shader3D.PERIOD_SCENE,
            'u_AlphaTestValue': Laya.Shader3D.PERIOD_MATERIAL,
            'u_WorldMat': Laya.Shader3D.PERIOD_SPRITE
        };



        var customShader = Laya.Shader3D.add("KKCartoonShader", null, null, true);
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

        let pass = subShader.addShaderPass(KKCartoonMaterial.vs, KKCartoonMaterial.ps, stateMap);
        // pass.renderState.depthWrite = true;
        // pass.renderState.depthTest = Laya.RenderState.DEPTHTEST_LEQUAL;
        // pass.renderState.cull = Laya.RenderState.CULL_BACK;
        // pass.renderState.blend = Laya.RenderState.BLEND_DISABLE;
        // pass.renderState.srcBlend = Laya.RenderState.BLENDPARAM_SRC_ALPHA;
        // pass.renderState.dstBlend = Laya.RenderState.BLENDPARAM_ONE_MINUS_SRC_ALPHA;

    }

    constructor() {
        super();
        if (!KKCartoonMaterial._inited) {
            KKCartoonMaterial.initShader();
            KKCartoonMaterial._inited = true;

        }
        this.setShaderName("KKCartoonShader");
		this._shaderValues.setVector(KKCartoonMaterial.ALBEDOCOLOR, new Laya.Vector4(1.0, 1.0, 1.0, 1.0));
		this._shaderValues.setNumber(KKCartoonMaterial.CULL, Laya.RenderState.CULL_BACK);
    }
}




