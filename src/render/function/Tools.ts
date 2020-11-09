import CoordUtil from '../laya/common/CoordUtil';

export default class Tools {
    /**
     * 3d容器坐标到逻辑坐标
     */
    public static trans3DCoordToLogicCoord(position3D: Laya.Vector3) {
        /* 3d容器坐标 -> 屏幕坐标 */
        const screenPos = CoordUtil.transfer3DCoordToScreenCoord(position3D.x, position3D.y, position3D.z)

        /* 屏幕坐标 -> 逻辑坐标 */
        const logicPos = CoordUtil.transferScreenCoordToLogicCoord(screenPos.x, screenPos.y);

        return logicPos
    }

    /**
     * 逻辑坐标到3d容器坐标
     */
    public static transLogicCoordTo3DCoord(position2D: Laya.Vector2): Laya.Vector3 {

        /* 逻辑坐标 -> 屏幕坐标 */
        const screenPos = CoordUtil.transferLogicCoordToScreenCoord(position2D.x, position2D.y)

        /* 屏幕坐标 -> 3d容器坐标 */
        const container3DPos = CoordUtil.transferScreenCoordTo3DCoord(screenPos.x, screenPos.y);

        return container3DPos
    }

    /**
     * 3d容器坐标倾斜
     */
    public static skew3DVoord(v_position: Laya.Vector3, m_position: Laya.Vector3, _Scale: number, _Offset: number): Laya.Vector3 {


        const vv = new Laya.Vector3();
        Laya.Vector3.subtract(v_position, m_position, vv);
        vv.z *= _Scale;
        v_position.z = m_position.z + vv.z;
        v_position.x = m_position.x + vv.x - vv.z * _Offset;

        return v_position;
    }

    /*  */
    private static _lut: Array<string> = [];

    public static generateUUID(): string {
        if (this._lut.length === 0) {
            for (let i = 0; i < 256; i++) {
                this._lut[i] = (i < 16 ? '0' : '') + (i).toString(16);
            }
        }
        let _lut = this._lut;
        var d0 = Math.random() * 0xffffffff | 0;
        var d1 = Math.random() * 0xffffffff | 0;
        var d2 = Math.random() * 0xffffffff | 0;
        var d3 = Math.random() * 0xffffffff | 0;
        var uuid =
            _lut[d0 & 0xff] + _lut[d0 >> 8 & 0xff] + _lut[d0 >> 16 & 0xff] + _lut[d0 >> 24 & 0xff] + '-' +
            _lut[d1 & 0xff] + _lut[d1 >> 8 & 0xff] + '-' + _lut[d1 >> 16 & 0x0f | 0x40] + _lut[d1 >> 24 & 0xff] + '-' +
            _lut[d2 & 0x3f | 0x80] + _lut[d2 >> 8 & 0xff] + '-' + _lut[d2 >> 16 & 0xff] + _lut[d2 >> 24 & 0xff] +
            _lut[d3 & 0xff] + _lut[d3 >> 8 & 0xff] + _lut[d3 >> 16 & 0xff] + _lut[d3 >> 24 & 0xff];

        // .toUpperCase() here flattens concatenated strings to save heap memory space.
        return uuid.toUpperCase();
    }
}