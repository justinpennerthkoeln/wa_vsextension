import * as vscode from "vscode";
import { getNonce } from "../utilities/getNonce";
import * as dotenv from "dotenv";
import { login } from "../utilities/user";

dotenv.config();
export class SettingsSidebarProvider implements vscode.WebviewViewProvider {
  _view?: vscode.WebviewView;
  _doc?: vscode.TextDocument;

  constructor(private readonly _extensionUri: vscode.Uri, private readonly _extensionContext: vscode.ExtensionContext) {}

  public resolveWebviewView(webviewView: vscode.WebviewView) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(async (data) => {
      switch (data.type) {
        case "login": {
          const user = await login(data.value);
          if (user.success === false) {
            webviewView.webview.postMessage({
              type: "login",
              value: { success: false },
            });
            return;
          }
          await this._extensionContext.globalState.update("user", user);
          webviewView.webview.postMessage({
            type: "login",
            value: { success: true, user },
          });
          break;
        }
        case "logout": {
          await this._extensionContext.globalState.update("user", undefined);
          await this._extensionContext.globalState.update("settings", undefined);
          await this.revive(webviewView);
          break;
        }
        case "get-user": {
          const user = await this._extensionContext.globalState.get("user", data.activeProject);
          if(!user) {
            webviewView.webview.postMessage({
              type: "get-user",
              value: { success: false }
            });
            return;
          }
          webviewView.webview.postMessage({
            type: "get-user",
            value: { success: true, user: await user.user }
          });
          break;
        }
        case "get-settings": {
          const settings = await this._extensionContext.globalState.get("settings", data.activeProject);
          if(!settings) {
            webviewView.webview.postMessage({
              type: "get-settings",
              value: { success: false }
            });
            return;
          }
          webviewView.webview.postMessage({
            type: "get-settings",
            value: { success: true, settings: await settings }
          });
          break;
        }
        case "save-settings": {
          await this._extensionContext.globalState.update("settings", data.value);
          break;
        }
        case "register": {
          vscode.env.openExternal(vscode.Uri.parse(`https://localhost:4000/register`));
          break;
        }
      }
    });

    webviewView.webview.onDidReceiveMessage(async (data) => {
      switch (data.type) {
        case "onInfo": {
          vscode.window.showInformationMessage(data.value);
          break;
        }
        case "onError": {
          if (!data.value) { return; }
          vscode.window.showErrorMessage(data.value);
          break;
        }
      }
    });
  }

  public revive(panel: vscode.WebviewView) {
    this._view = panel;
  }

  private _getHtmlForWebview(webview: vscode.Webview): string {
    const nonce = getNonce();

    const styleResetUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "reset.css")
    );
    const styleVSCodeUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "vscode.css")
    );
    const styleRootUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "root.css")
    );
    const styleSettingsSidebarUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "settingsSidebar.css")
    );

    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "src", "webview", "dist", "main.js")
    );

    return `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta http-equiv="Content-Security-Policy" content="img-src https: data:; style-src 'unsafe-inline' 
          ${webview.cspSource}; script-src 'nonce-${nonce}';">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="${styleResetUri}" rel="stylesheet">
        <link href="${styleVSCodeUri}" rel="stylesheet">
        <link href="${styleRootUri}" rel="stylesheet">
        <link href="${styleSettingsSidebarUri}" rel="stylesheet">
        <title>Sidebar</title>
      </head>
      <body>
        <div id="root"></div>
        <script nonce="${nonce}" type="module">
          window.history.pushState({}, '', '/settings');
        </script>
        <script nonce="${nonce}" type="module" src="${scriptUri}"></script>
      </body>
      </html>`;
  }
}