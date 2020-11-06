const xlsx = require("node-xlsx");
const fs = require("fs");
const fsExtra = require('fs-extra');
const root_f = localStorage.getItem("rootFile");

export default class ConfigData{
    private cate: string[] = ['role', 'monster', 'gear', 'ground', 'pickUpItem', 'npc', 'sceneEffect', 'gameShop', 'staticLineMesh'];
    /* 精灵树形结构数据 */
    private spriteTree: any;

    /* 精灵缩略图树形结构数据 */
    private thumbnailTree: any;

    constructor() {
        //获取树形数据
        // this.setSpriteTree();
        // this.setThumbnailTree();
    }

    private static _instance: ConfigData;

    public static instance (){
        if(!this._instance){
            this._instance = new ConfigData();
        }
        return this._instance;
    }

    /**
     * fetch获取树形数据
     */
    public setSpriteTree() {
        let promiseList: any = [];
        this.cate.map((type: string) => {
            //key分类下的资源列表
            const typeResUri = `${root_f}level_res/${type}`;
            promiseList.push(this.getSources(type, typeResUri).then(data => data));
        })
        return new Promise((res, rej) => {
            //统一执行获取资源
            Promise.all(promiseList)
                .then((treeList) => {
                    console.log('[FetchConfigFiles] [获取到的树形结构的资源]', treeList);
                    res(treeList)
                })
                .catch((err) => {
                    console.log('[FetchConfigFiles] [获取到的树形结构的资源]', err);
                })
        })

    }

     /**
     * 获取分类下的.lh文件 
     * @param type 精灵分类
     * @param typeResUri 静态路径
     */
    private getSources(type: string, typeResUri: string) {
        return new Promise((res, rej) => {
            fs.readdir(typeResUri, (err: any, data: any) => {
                if (!err) {
                    let singleList = { type, list: [] };
                    data.map((item: any) => {
                        if (item.indexOf('.lh') >= 0) {
                            item = item.substring(0, item.length - 3);
                            let list: any = singleList.list;
                            list.push(item);
                        }
                    });
                    res(singleList);
                }
            });
        })
    }


    public getSpriteTree() {
        return this.spriteTree;
    }

    /**
     * 获取所有缩略图资源
     */
    public getThumbnail() {
        let promiseList: any = [];
        this.cate.map((key: string) => {
            //读取key分类下的图片列表
            let resPath = `${root_f}editor_res/${key}`;
            promiseList.push(this.getImg(key, resPath).then((data) => data));
        });
        return new Promise((res, rej) => {
            //统一执行获取资源
            Promise.all(promiseList)
                .then((treeList) => {
                    // console.log('[FetchConfigFiles] [获取到的树形结构的资源]', treeList);
                    let thumbnailStruct: any = {};
                    treeList.map((treeitem: any) => {
                        thumbnailStruct = {
                            ...thumbnailStruct,
                            ...treeitem
                        };
                    })
                    res(thumbnailStruct)
                })
                .catch((err) => {
                    // console.log('[FetchConfigFiles] [获取到的树形结构的资源]', err);
                })
        })
    }

    /**
     * 获取分类下的.png/.jpg文件 
     * @param type 精灵分类
     * @param resPath 静态路径
     */
    public getImg(type: string, resPath: string) {
        return new Promise((res, rej) => {
            fs.readdir(resPath, (err: any, data: any) => {
                if (!err) {
                    let singleList = { [type]: {} };
                    data.map((item: any) => {
                        if (item.includes(".png") || item.includes(".jpg")) {
                            let imgName = item.substring(0, item.length - 4);
                            singleList[type] = {
                                ...singleList[type],
                                [imgName]: item
                            }
                        }
                    });
                    res(singleList);
                }
            });
        })
    }

    /**
     * 读取到所有关卡文件
     */
    public static getLevelList(){
        //读取level分类下的关卡列表
        const resPath = `${root_f}level_res/level`;
        return new Promise((res)=>{
            fs.readdir(resPath, (err: any, data: any) => {
                const levelListRes: string[] = [];
                if (!err) {
                    data.map((levelFileName: any) => {
                        levelFileName.includes('level_') && levelFileName.includes('.json')
                        && levelListRes.push(levelFileName)
                    })
                }
                res({levelListRes})
            });
        })
    }

    /**
     * 读取关卡信息
     * levelFileName: string
     */
    public static readSingleLevel (levelFileName: string) {
        const url = `${root_f}level_res/level/${levelFileName}`;
        return new Promise((res) => {
            fsExtra.readJSON(url, 'utf-8', (err: any,structureData: any) => {
                let singleData = {};
                if(!err) {
                    singleData = {
                        id: structureData.id,
                        type: structureData.type,
                        name: structureData.name,
                        levelClass: structureData.levelClass,
                        levelIndex: structureData.levelIndex
                    }
                }
                res({...singleData})
            })
        })
    }

    /**
     * 读取场景地图列表
     */
    public static getSceneMapList() {
        const scenePath = `${root_f}level_res/bg_map`;
        const  sceneMaps: any = [];
        return new Promise((res, rej)=>{
            fs.readdir(scenePath,(err: any, data: any)=>{
                if(!err){
                    data.map((item: any)=>{
                        if(item.indexOf('.png') >= 0 || item.indexOf('.jpg') >= 0 || item.indexOf('.jpeg') >= 0){
                            sceneMaps.push({label: item, value: item});
                        }
                    })
                    res(sceneMaps)
                }
                else {
                    rej(err)
                }
            });
        })
    }
}