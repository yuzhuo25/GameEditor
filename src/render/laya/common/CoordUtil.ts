import Position from "./Position";
import Constants from "./Constants";
import MathUtil from './MathUtil';

/*
    坐标：
    1. 3d坐标:Laya.Vector3
    2. 2d坐标:Position
    
    坐标转换
    1.逻辑坐标系(LogicCoord)
    2.屏幕坐标系(ScreenCoord)
    3.2D背景容器坐标系(2DContainer)
    4.3d物件容器坐标系(3DContainer)

    转换方法:
    LogicCoord <==> ScreenCoord
    ScreenCoord <==> 2DContainer
    ScreenCoord <==> 3DContainer
    
 */

/**
 * 坐标转换工具
 */
export default class CoordUtil {

    /**
     * 视线仰角
     * TODO 都应该记到常量类去
     */
    public static readonly SIGHT_ELEVATION_ANGLE = 30;
    /**
     * 用户坐标倾斜角
     * TODO 都应该记到常量类去
     */
    public static readonly USER_LEAN_ANGLE = 18.83;

    /**
     * 视线仰角Sin值
     */
    public static readonly SIGHT_ELEVATION_SIN = Math.sin(CoordUtil.SIGHT_ELEVATION_ANGLE * Math.PI / 180);

    /**
     * 视线仰角Cos值
     */
    public static readonly SIGHT_ELEVATION_COS = Math.cos(CoordUtil.SIGHT_ELEVATION_ANGLE * Math.PI / 180);

    /* 逻辑坐标倾斜 Delta / h 的比值
    */
    // public static readonly USER_LEAN_DELTA_TO_H = 43 / 127;
    public static readonly USER_LEAN_DELTA_TO_H = 105 / 297;
    
    /**
    * 逻辑坐标倾斜 Delta / w 的比值
    */
    // public static readonly USER_LEAN_DELTA_TO_W = 43 / 168;
    public static readonly USER_LEAN_DELTA_TO_W = 105 / 372;
    
    /**
    * 逻辑坐标 h / w 的比值
    */
    // public static readonly USER_LEAN_H_TO_W = 127 / 168;
    public static readonly USER_LEAN_H_TO_W = 297 / 372;

    /**
     * 扭曲offset
     */
    public static offset = CoordUtil.USER_LEAN_DELTA_TO_H/2;

    /**
     * 扭曲scale
     */
    public static scale = CoordUtil.USER_LEAN_H_TO_W*2;
    /**
     * 逻辑坐标 ==> 屏幕坐标
     * @param x 逻辑坐标x
     * @param y 逻辑坐标y
     * @return  屏幕坐标
     */
    public static transferLogicCoordToScreenCoord(x: number, y: number): Position {
        return new Position(
            (x - y * CoordUtil.USER_LEAN_DELTA_TO_W) * Constants.LOGIC_PIXEL_RATIO,
            (y * CoordUtil.USER_LEAN_H_TO_W) * Constants.LOGIC_PIXEL_RATIO);
    }

    /**
     * 屏幕坐标 ==> 逻辑坐标
     * @param x 屏幕坐标x
     * @param y 屏幕坐标y
     * @return 逻辑坐标
     */
    public static transferScreenCoordToLogicCoord(x: number, y: number): Position {
        return new Position(
            (x + y * CoordUtil.USER_LEAN_DELTA_TO_H) / Constants.LOGIC_PIXEL_RATIO,
            (y / CoordUtil.USER_LEAN_H_TO_W) / Constants.LOGIC_PIXEL_RATIO);
    }

    /**
     * 屏幕坐标 ==> 2d容器坐标
     * @param x 屏幕坐标x
     * @param y 屏幕坐标y
     * @return 2D容器坐标
     */
    public static transferScreenCoordTo2DCoord(x: number, y: number): Laya.Vector3 {
        return new Laya.Vector3(
            x * Constants.PIXEL_3D_RATIO,
            0,
            y * Constants.PIXEL_3D_RATIO,
        );
    }

    /**
     * 2D容器坐标 ==> 屏幕坐标
     * @param x 2D容器坐标x
     * @param y 2D容器坐标y
     * @param z 2D容器坐标z
     * @return 屏幕坐标
     */
    public static transfer2DCoordToScreenCoord(x: number, y: number, z: number): Position {
        return new Position(x / Constants.PIXEL_3D_RATIO, z / Constants.PIXEL_3D_RATIO);
    }

    /**
     * 屏幕坐标 ==> 3d容器坐标
     * @param x 屏幕坐标x 
     * @param y 屏幕坐标y
     * @return 3d世界坐标
     */
    public static transferScreenCoordTo3DCoord(x: number, y: number): Laya.Vector3 {
        return new Laya.Vector3(x * Constants.PIXEL_3D_RATIO, 0, (y * Constants.PIXEL_3D_RATIO) / CoordUtil.SIGHT_ELEVATION_SIN);
    }

    /**
     * 3d容器坐标 ==> 屏幕坐标
     * @param x 3d X
     * @param y 3d Y
     * @param z 3d Z
     * @return 屏幕坐标
     */
    public static transfer3DCoordToScreenCoord(x: number, y: number, z: number): Position {
        return new Position(x / Constants.PIXEL_3D_RATIO, z * CoordUtil.SIGHT_ELEVATION_SIN / Constants.PIXEL_3D_RATIO);
    }


    /**
     * 逻辑角度 ==> 屏幕角度
     */
    
    public static transferLogicAngleToScreenAngle(angle: number): number {
        const logicCoord = new Position(Math.cos(MathUtil.toRadian(angle)), Math.sin(MathUtil.toRadian(angle)));
        const screenCoord = this.transferLogicCoordToScreenCoord(logicCoord.x, logicCoord.y);
        return MathUtil.toAngle(Math.atan2(screenCoord.y, screenCoord.x));
    }


    /**
     * 屏幕角 ==> 逻辑角度
     */
    public static transferScreenAngleToLogicAngle(angle: number): number {
        const screenCoord = new Position(Math.cos(MathUtil.toRadian(angle)), Math.sin(MathUtil.toRadian(angle)));
        const logicCoord = this.transferScreenCoordToLogicCoord(screenCoord.x, screenCoord.y);
        return MathUtil.toAngle(Math.atan2(logicCoord.y, logicCoord.x));
    }

    /**
     * 屏幕角度 ==> 3d角度
     * @param angle  
     */
    public static transferScreenAngleTo3DAngle(angle: number): number {
        // fix 屏幕坐标系和在3d的面上的角度还是不一样的
        const screenCoord = new Position(Math.cos(MathUtil.toRadian(angle)), Math.sin(MathUtil.toRadian(angle)));
        const d3Coord = this.transferScreenCoordTo3DCoord(screenCoord.x, screenCoord.y);
        angle = MathUtil.toAngle(Math.atan2(d3Coord.z, d3Coord.x));
        // return angle;
        return (360 + 90 - angle) % 360;
    }

    /**
     * 3d角度  ==> 屏幕角度
     * @param angle 
     */
    public static transfer3DAngleToScreenAngle(angle: number): number {

        //  TODO
        return 0;
    }

    //==============================

    /**
     * 逻辑坐标 ==> 3d坐标
     * @param x 
     * @param y 
     */
    public static transferLogicCoordTo3DCoord(x: number, y: number): Laya.Vector3 {
        let screenCoord = this.transferLogicCoordToScreenCoord(x, y);
        return this.transferScreenCoordTo3DCoord(screenCoord.x, screenCoord.y);
    }


    /**
     *  3d坐标 ==> 逻辑坐标
     * @param x 
     * @param y 
     * @param z 
     */
    public static transfer3DCoordToLogicCoord(x: number, y: number, z: number): Position {
        let screenCoord = CoordUtil.transfer3DCoordToScreenCoord(x, y, z);
        return this.transferScreenCoordToLogicCoord(screenCoord.x, screenCoord.y);
    }

    //==============================

    /**
     * 3d角度 ==> 逻辑角度
     */
    public static transfer3DAngleToLogicAngle (angle: number): number {
        const screenAngle = this.transfer3DAngleToScreenAngle(angle);
        return this.transferScreenAngleToLogicAngle(screenAngle);
    }

    /**
     * 逻辑角度 ==> 3d角度
     */
    public static transferLogicAngleTo3DAngle (angle: number): number {
        const screenAngle = this.transferLogicAngleToScreenAngle(angle);
        return this.transferScreenAngleTo3DAngle(screenAngle);
    }

    /**
     * 转换逻辑距离到屏幕距离
     * @param dis 
     */
    public static transferLogicDisToScreenDis(dis: number): number {
        return this.transferLogicCoordToScreenCoord(dis, 0).x;
    }
    /**
     * 转换逻辑距离到3d距离
     * @param dis 
     */
    public static transferLogicDisTo3dDis(dis: number): number {
        return this.transferLogicCoordTo3DCoord(dis, 0).x;
    }
}

