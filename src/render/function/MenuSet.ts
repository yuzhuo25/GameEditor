const { ipcRenderer } = require('electron');

enum MenuType{
    CREATE_LEVEL = "CREATE_LEVEL",
    EXPORT_LEVEL = "EXPORT_LEVEL",
    RUN_LEVEL = "RUN_LEVEL"
}

export default function MenuSet() {
    ipcRenderer.on(MenuType.CREATE_LEVEL, (event: any, arg: any) => {
        console.log("[MenuSet] [MenuType.CREATE_LEVEL]")
    })
}


