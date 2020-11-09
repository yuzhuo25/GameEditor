import Position from '../common/Position';


export default class PolygonData {
    private _id: number;
    private _points: Position[];
    private _type: string;
    private _renderVersion: number = 0;

    constructor(id: number, points: Position[], type: string) {
        this._id = id;
        this._points = points;
        this._type = type;
    }

    get type() {
        return this._type;
    }

   

    get renderVersion() {
        return this._renderVersion;
    }

    public updateRenderVersion() {
        this._renderVersion++
    }

    get id() {
        return this._id;
    }

    get points() {
        return this._points;
    }

    set points(points: Position[]) {
        this._points = points;
    }



}