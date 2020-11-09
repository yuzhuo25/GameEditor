export default class KKCartoonRimDirMaterial extends Laya.BaseMaterial {
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
	public static RIMDIR_X = Laya.Shader3D.propertyNameToID("u_RimDir_X");
	public static RIMDIR_Y = Laya.Shader3D.propertyNameToID("u_RimDir_Y");
	public static RIMDIR_Z = Laya.Shader3D.propertyNameToID("u_RimDir_Z");
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
		
		#if defined(DIRECTIONLIGHT)
			attribute vec3 a_Normal;
			varying vec3 v_Normal; 
			uniform vec3 u_CameraDirection;
			varying vec3 v_ViewDir; 

			#ifdef GPU_INSTANCE
				attribute mat4 a_WorldMat;
			#else
				uniform mat4 u_WorldMat;
			#endif

			varying vec3 v_PositionWorld;
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
			#ifdef GPU_INSTANCE
				gl_Position = a_MvpMatrix * position;
			#else
				gl_Position = u_MvpMatrix * position;
			#endif
			
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
					v_ViewDir = normalize(v_ViewDir);
					//v_ViewDir.x*=-1.0;
					//v_ViewDir = normalize(v_ViewDir);
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
		

		#ifdef ALPHATEST
			uniform float u_AlphaTestValue;
		#endif

		#ifdef GPU_INSTANCE
			attribute mat4 a_WorldMat;
		#else
			uniform mat4 u_WorldMat;
		#endif

		uniform mat4 u_View;
		uniform mat4 u_Projection;		    

		uniform sampler2D u_AlbedoTexture;
	
		varying vec2 v_Texcoord0;	
		uniform float u_RampThreshold;
		uniform float u_RampSmooth;

		uniform vec4 u_RimColor;
		uniform float u_RimMin;
		uniform float u_RimMax;
		uniform float u_RimDir_X;
		uniform float u_RimDir_Y;
		uniform float u_RimDir_Z;

		#ifdef FOG
			uniform float u_FogStart;
			uniform float u_FogRange;
			uniform vec3 u_FogColor;
		#endif
		
		
		#ifdef DIRECTIONLIGHT
			varying vec3 v_ViewDir; 
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
				if( alpha < u_AlphaTestValue )
				{
					discard;
				}
			#endif
		}

		//逆转矩阵
		mat3 inverse_mat3(mat3 m)
		{
			float Determinant = 
				  m[0][0] * (m[1][1] * m[2][2] - m[2][1] * m[1][2])
				- m[1][0] * (m[0][1] * m[2][2] - m[2][1] * m[0][2])
				+ m[2][0] * (m[0][1] * m[1][2] - m[1][1] * m[0][2]);
			
			mat3 Inverse;
			Inverse[0][0] = + (m[1][1] * m[2][2] - m[2][1] * m[1][2]);
			Inverse[1][0] = - (m[1][0] * m[2][2] - m[2][0] * m[1][2]);
			Inverse[2][0] = + (m[1][0] * m[2][1] - m[2][0] * m[1][1]);
			Inverse[0][1] = - (m[0][1] * m[2][2] - m[2][1] * m[0][2]);
			Inverse[1][1] = + (m[0][0] * m[2][2] - m[2][0] * m[0][2]);
			Inverse[2][1] = - (m[0][0] * m[2][1] - m[2][0] * m[0][1]);
			Inverse[0][2] = + (m[0][1] * m[1][2] - m[1][1] * m[0][2]);
			Inverse[1][2] = - (m[0][0] * m[1][2] - m[1][0] * m[0][2]);
			Inverse[2][2] = + (m[0][0] * m[1][1] - m[1][0] * m[0][1]);
			Inverse /= Determinant;
			
			return Inverse;
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

				mat4 worldMat;
				#ifdef GPU_INSTANCE
					worldMat = a_WorldMat;
				#else
					worldMat = u_WorldMat;
				#endif

				mat4 worldViewMat = worldMat*u_View;
				vec3 rimDir = vec3(u_RimDir_X,u_RimDir_Y,u_RimDir_Z);
				float v = worldViewMat[2][3];
				if(v==0.0){
					v = 0.0000001;
				}
				rimDir.x += worldViewMat[0][3] * (1.0 /v) * ( 1.0);
				rimDir.x *=-1.0;
				rimDir.y += worldViewMat[1][3] * (1.0 / v) * ( 1.0);
				rimDir = normalize(rimDir);
				vec3 viewDir =(inverse_mat3(mat3(u_View))) * rimDir;

				vec3 normal;
				normal = normalize(v_Normal);	
				float rim = 1.0 - clamp(dot(viewDir, normal), 0.0, 1.0);
				rim = smoothstep(u_RimMin, u_RimMax, rim);
			
				difTexColor.rgb = mix(difTexColor.rgb, u_RimColor.rgb, rim * u_RimColor.a);
				gl_FragColor = difTexColor;

				#if defined(DIRECTIONLIGHT)
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
		return this._shaderValues.getTexture(KKCartoonRimDirMaterial.ALBEDOTEXTURE);
	}

    /**
     * 设置漫反射贴图。
     * @param value 漫反射贴图。
     */
	set _MainTex(value) {
		this._shaderValues.setTexture(KKCartoonRimDirMaterial.ALBEDOTEXTURE, value);
		if (value)
			this._shaderValues.addDefine(KKCartoonRimDirMaterial.SHADERDEFINE_DIFFUSEMAP);
		else
			this._shaderValues.removeDefine(KKCartoonRimDirMaterial.SHADERDEFINE_DIFFUSEMAP);
	}


	/**
     * 获取主颜色。
     * @return 主颜色
     */
	get _Color() {
		return this._shaderValues.getVector(KKCartoonRimDirMaterial.ALBEDOCOLOR);
	}

    /**
     * 设置主颜色。
     * @param value 主颜色
     */
	set _Color(value) {
		this._shaderValues.setVector(KKCartoonRimDirMaterial.ALBEDOCOLOR, value);
	}

	/**
 * 获取高亮颜色。
 * @return 高亮颜色
 */
	get _HColor() {
		return this._shaderValues.getVector(KKCartoonRimDirMaterial.HCOLOR);
	}

    /**
     * 设置高亮颜色。
     * @param value 高亮颜色
     */
	set _HColor(value) {
		this._shaderValues.setVector(KKCartoonRimDirMaterial.HCOLOR, value);
	}


	/**
 * 获取高亮颜色。
 * @return 高亮颜色
 */
	get _SColor() {
		return this._shaderValues.getVector(KKCartoonRimDirMaterial.SCOLOR);
	}

    /**
     * 设置高亮颜色。
     * @param value 高亮颜色
     */
	set _SColor(value) {
		this._shaderValues.setVector(KKCartoonRimDirMaterial.SCOLOR, value);
	}

	/**
* 获取边缘光颜色。
* @return 边缘光颜色
*/
	get _RimColor() {
		return this._shaderValues.getVector(KKCartoonRimDirMaterial.RIMCOLOR);
	}

    /**
     * 设置边缘光颜色。
     * @param value 边缘光颜色
     */
	set _RimColor(value) {
		this._shaderValues.setVector(KKCartoonRimDirMaterial.RIMCOLOR, value);
	}



	//获取边缘光方向。
	get _RimDir_X() {
		return this._shaderValues.getNumber(KKCartoonRimDirMaterial.RIMDIR_X);
	}
	get _RimDir_Y() {
		return this._shaderValues.getNumber(KKCartoonRimDirMaterial.RIMDIR_Y);
	}
	get _RimDir_Z() {
		return this._shaderValues.getNumber(KKCartoonRimDirMaterial.RIMDIR_Z);
	}


	//设置边缘光方向。
	set _RimDir_X(value) {
		this._shaderValues.setNumber(KKCartoonRimDirMaterial.RIMDIR_X, value);
	}
	set _RimDir_Y(value) {
		this._shaderValues.setNumber(KKCartoonRimDirMaterial.RIMDIR_Y, value);
	}
	set _RimDir_Z(value) {
		this._shaderValues.setNumber(KKCartoonRimDirMaterial.RIMDIR_Z, value);
	}


	get _RampThreshold() {
		return this._shaderValues.getNumber(KKCartoonRimDirMaterial.RAMPTHRESHOLD);
	}
	set _RampThreshold(value) {
		this._shaderValues.setNumber(KKCartoonRimDirMaterial.RAMPTHRESHOLD, value);
	}
	get _RampSmooth() {
		return this._shaderValues.getNumber(KKCartoonRimDirMaterial.RAMPSMOOTH);
	}
	set _RampSmooth(value) {
		this._shaderValues.setNumber(KKCartoonRimDirMaterial.RAMPSMOOTH, value);
	}

	get _RimMin() {
		return this._shaderValues.getNumber(KKCartoonRimDirMaterial.RIMMIN);
	}
	set _RimMin(value) {
		this._shaderValues.setNumber(KKCartoonRimDirMaterial.RIMMIN, value);
	}
	get _RimMax() {
		return this._shaderValues.getNumber(KKCartoonRimDirMaterial.RIMMAX);
	}
	set _RimMax(value) {
		this._shaderValues.setNumber(KKCartoonRimDirMaterial.RIMMAX, value);
	}

	/**
	 * 剔除方式。
	 */
    get cull(): number {
        return this._shaderValues.getInt(KKCartoonRimDirMaterial.CULL);
    }

    set cull(value: number) {
        this._shaderValues.setInt(KKCartoonRimDirMaterial.CULL, value);
    }

	clone(): any {
		var dest: KKCartoonRimDirMaterial = new KKCartoonRimDirMaterial();
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
			'u_RimDir_X': Laya.Shader3D.PERIOD_MATERIAL,
			'u_RimDir_Y': Laya.Shader3D.PERIOD_MATERIAL,
			'u_RimDir_Z': Laya.Shader3D.PERIOD_MATERIAL,
			'u_LightBuffer': Laya.Shader3D.PERIOD_SCENE,
			'u_CameraDirection': Laya.Shader3D.PERIOD_CAMERA,
			'u_FogStart': Laya.Shader3D.PERIOD_SCENE,
			'u_FogRange': Laya.Shader3D.PERIOD_SCENE,
			'u_FogColor': Laya.Shader3D.PERIOD_SCENE,
			'u_AlphaTestValue': Laya.Shader3D.PERIOD_MATERIAL,
			'u_WorldMat': Laya.Shader3D.PERIOD_SPRITE,
			'u_View': Laya.Shader3D.PERIOD_CAMERA,
			'u_Projection': Laya.Shader3D.PERIOD_CAMERA
		};



		var customShader = Laya.Shader3D.add("KKCartoonRimDirShader");
		var subShader = new Laya.SubShader(attributeMap, uniformMap);
		customShader.addSubShader(subShader);

		
		let pass = subShader.addShaderPass(KKCartoonRimDirMaterial.vs, KKCartoonRimDirMaterial.ps);
		pass.renderState.depthWrite = true;
		pass.renderState.depthTest = Laya.RenderState.DEPTHTEST_LEQUAL;
		pass.renderState.cull = Laya.RenderState.CULL_BACK;
		pass.renderState.blend = Laya.RenderState.BLEND_DISABLE;
		pass.renderState.srcBlend = Laya.RenderState.BLENDPARAM_SRC_ALPHA;
		pass.renderState.dstBlend = Laya.RenderState.BLENDPARAM_ONE_MINUS_SRC_ALPHA;

	}

	constructor() {
		super();
		if (!KKCartoonRimDirMaterial._inited) {
			KKCartoonRimDirMaterial.initShader();
			KKCartoonRimDirMaterial._inited = true;
		}
		this.setShaderName("KKCartoonRimDirShader");
		this._shaderValues.setVector(KKCartoonRimDirMaterial.ALBEDOCOLOR, new Laya.Vector4(1.0, 1.0, 1.0, 1.0));
		this._shaderValues.setNumber(KKCartoonRimDirMaterial.CULL, Laya.RenderState.CULL_BACK);
	}
}




