
export default class MathUtil {

    /**
     * 弧度转角度
     */
    public static toAngle(radian: number): number {
        return radian * (180 / Math.PI);
    }

    /**
     * 角度转弧度
     */
    public static toRadian(angle: number): number {
        return angle * (Math.PI / 180);
    }
}
