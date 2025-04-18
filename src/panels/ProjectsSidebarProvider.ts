import * as vscode from "vscode";
import { getNonce } from "../utilities/getNonce";
import { login } from "../utilities/user";
import { createProject, getProjects } from "../utilities/project";
import { 
  onLoginInProjectsSidebar,
  onLogoutInProjectsSidebar,
  onRefreshProjectsInAuditSidebar,
  onRefreshProjectsInProjectsSidebar
 } from '../utilities/events';
import { User } from "../webview/utilities/types";

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
        case "create-project": {
          const project = await createProject(data.value.projectName, data.value.userToken);
          webviewView.webview.postMessage({
            type: "project-created",
            value: project,
          });
          onRefreshProjectsInAuditSidebar.fire();
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
          vscode.commands.executeCommand("fairlyAccess.closeProjectPanel");
          vscode.commands.executeCommand("fairlyAccess.openProjectPanel");
        }
      }
    });

    // Listen for the custom event to refresh projects
    onRefreshProjectsInProjectsSidebar.event(async () => {
      const user: User | undefined = await (this._extensionContext.globalState.get("user") as {success: boolean, user: User}).user;
      const userToken = user?.uuid;
      if (userToken) {
        const projects = await getProjects(userToken);
        webviewView.webview.postMessage({
          type: "get-projects",
          value: projects,
        });
      }
    });

    onLogoutInProjectsSidebar.event(async () => {
      webviewView.webview.postMessage({
        type: "get-user",
        value: { success: false }
      });

      webviewView.webview.postMessage({
        type: "get-projects",
        value: [],
      });
    });
    
    onLoginInProjectsSidebar.event(async () => {
      const user: User | undefined = await (this._extensionContext.globalState.get("user") as {success: boolean, user: User}).user;
      const userToken = user?.uuid;
      if (userToken) {
        const projects = await getProjects(userToken);
        webviewView.webview.postMessage({
          type: "get-user",
          value: { success: true, user: user }
        });
        webviewView.webview.postMessage({
          type: "get-projects",
          value: projects,
        });
      }
    });
  }

  public revive(panel: vscode.WebviewView) {
    this._view = panel;
  }

  private _getHtmlForWebview(webview: vscode.Webview): string {
    const nonce = getNonce();

    const styleResetUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "public", "css", "reset.css")
    );
    const styleVSCodeUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "public", "css", "vscode.css")
    );
    const styleRootUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "public", "css", "root.css")
    );
    const styleProjectsUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "public", "css", "projectSidebar.css")
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