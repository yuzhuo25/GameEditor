import IClone from "./interface/IClone";

/**
 * 二维坐标点
 */
export default class Position implements IClone<Position> {

    public x: number;

    public y: number;

    constructor(x?: number, y?: number) {
        this.x = x ? x : 0;
        this.y = y ? y : 0;
    }

    /**
     * return a new Position
     */
    public clone(): Position {
        return new Position(this.x, this.y);
    }
}