import * as vscode from "vscode";
import { getNonce } from "../utilities/getNonce";
import doAudit from "../utilities/audit";
import { getProjects, addIssue } from "../utilities/project";
import { login } from "../utilities/user";

export class AuditSidebarProvider implements vscode.WebviewViewProvider {
  _view?: vscode.WebviewView;
  _doc?: vscode.TextDocument;

  constructor(private readonly _extensionUri: vscode.Uri) {}

  public resolveWebviewView(webviewView: vscode.WebviewView) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(async (data) => {
      switch (data.type) {
        case "audit": {
          const data = await doAudit();
          webviewView.webview.postMessage({
            type: "auditResults",
            value: data,
          });
          break;
        }
        case "login": {
          const userToken = await login();
          webviewView.webview.postMessage({
            type: "login",
            value: userToken,
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
        case "add-issue": {
          addIssue(data.value.project_uuid, data.value.userToken, data.value.auditResults);
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
    const styleAuditSidebarUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "auditSidebar.css")
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
        <link href="${styleAuditSidebarUri}" rel="stylesheet">
        <title>Sidebar</title>
      </head>
      <body>
        <div id="root"></div>
        <script nonce="${nonce}" type="module">
          window.history.pushState({}, '', '/audit');
        </script>
        <script nonce="${nonce}" type="module" src="${scriptUri}"></script>
      </body>
      </html>`;
  }
}