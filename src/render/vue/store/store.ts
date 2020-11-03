/*@replace = import Store from 'electron-store'*/const Store = require('vuex')
import { MutationType } from './MutationType';

export default new Store({
    state: {
        currentTab: 'scene'
    },
    mutations: {
        [MutationType.CHANGE_TAB](state: any, data: any) {
            console.log("[store] [state]", state)
            console.log("[store] [data]", data)
        }
    }
})
