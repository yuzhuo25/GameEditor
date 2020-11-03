import {readonly, reactive, inject} from "vue";

const key = Symbol();

export function provideStore(app: any) {
    const state = reactive({
        currentTab: "scene"
    })

    async function changeTab(tabKey: string) {
        state.currentTab = tabKey;
    }

    app.provide(key, {
        state: readonly(state), //对外只读
        changeTab
    })
}

export function useStore(defaultValue = null) {
    return inject(key, defaultValue);
}

