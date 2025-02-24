import * as vscode from "vscode";
import { getNonce } from "../utilities/getNonce";
import { login } from "../utilities/user";
import { createProject, getProjects } from "../utilities/project";

export class ProjectsSidebarProvider implements vscode.WebviewViewProvider {
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
        // case "login": {
        //   const userToken = await login();
        //   webviewView.webview.postMessage({
        //     type: "login",
        //     value: userToken,
        //   });
        //   break;
        // }
        case "create-project": {
          const project = await createProject(data.value.projectName, data.value.userToken);
          webviewView.webview.postMessage({
            type: "project-created",
            value: project,
          });
          break;
        }
        case "get-projects": {
          const projects = await getProjects(data.userToken);
          webviewView.webview.postMessage({
            type: "get-projects",
            value: projects,
          });
          break;
        }
        case "set-active-project": {
          await this._extensionContext.globalState.update("activeProject", data.activeProject);
          break;
        }
        case "open-project": {
          vscode.commands.executeCommand("accessibility.closeProjectPanel");
          vscode.commands.executeCommand("accessibility.openProjectPanel");
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
    const styleProjectsUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "projectSidebar.css")
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
        <link href="${styleProjectsUri}" rel="stylesheet">
        <title>Sidebar</title>
      </head>
      <body>
        <div id="root"></div>
        <script nonce="${nonce}" type="module">
          window.history.pushState({}, '', '/projects');
        </script>
        <script nonce="${nonce}" type="module" src="${scriptUri}"></script>
      </body>
      </html>`
    ;
  }
}