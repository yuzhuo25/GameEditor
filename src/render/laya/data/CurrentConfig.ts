/* 当前关卡配置 */
export default class CurrentConfig {
    private _planeWidth: number = 0;
    private _planeHeight: number = 0;

    get planeWidth() {
        return this._planeWidth;
    }

    set planeWidth(_width: number) {
        this._planeWidth = _width;
    }

    get planeHeight() {
        return this._planeHeight;
    }

    set planeHeight(_height: number) {
        this._planeHeight = _height;
    }
}   