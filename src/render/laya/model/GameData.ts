export default class GameData {
    private _roles: any[];
    private _monsters: any[];

    constructor(_gameData?: GameData) {
        if(_gameData) {
            this._roles = _gameData._roles;
            this._monsters = _gameData._monsters;
        } else {
            this._roles = [];
            this._monsters = [];
        }
        
    }
}