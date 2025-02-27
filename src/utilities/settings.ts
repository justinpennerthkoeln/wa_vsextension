import { Setting, Settings } from "../webview/utilities/types";

export function evalSettings(settings: Settings, identifier: string) {
    if(settings) {
        const setting = settings.find((setting: Setting) => setting.identifier === identifier);
        return setting ? setting.checked : false;
    }
    return false;
}