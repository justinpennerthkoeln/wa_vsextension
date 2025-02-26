import * as vscode from "vscode";
import { getNonce } from "../utilities/getNonce";
import doAudit from "../utilities/audit";
import { getProjects, addIssue, generate_pdf } from "../utilities/project";
import { onRefreshProjects } from '../utilities/events';
import { User } from "../webview/utilities/types";

export class AuditSidebarProvider implements vscode.WebviewViewProvider {
  _view?: vscode.WebviewView;
  _doc?: vscode.TextDocument;

  private readonly highlightDecorationType = vscode.window.createTextEditorDecorationType({
    backgroundColor: "rgba(228, 228, 206, 0.3)",
    isWholeLine: true,
  });

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
        case "audit": {
          const data = await doAudit();
          webviewView.webview.postMessage({
            type: "auditResults",
            value: data,
          });
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
        case "get-projects": {
          const projects = await getProjects(data.userToken);
          webviewView.webview.postMessage({
            type: "get-projects",
            value: projects,
          });
          break;
        }
        case "add-issue": {
          const issueAdded = await addIssue(data.value.project_uuid, data.value.userToken, data.value.auditResults);
          webviewView.webview.postMessage({
            type: "add-issue",
            value: { success: issueAdded },
          });
          onRefreshProjects.fire();
          break;
        }
        case "generate-pdf": {
          var issue = [
            {
              filename: vscode.window.activeTextEditor?.document.fileName.split('/').pop(),
              inserted_at: new Date().toISOString(),
              matches: data.value.matches,
              matches_count: data.value.matches.length, // Use the length of matches array for numberOfErrors
            }
          ]
          await generate_pdf(issue, false);
          return;
        }
        case "highlight": {
          const line = data.value.line - 1;
          const editor = vscode.window.activeTextEditor;
          if (!editor) { return; }
          const range = (line != null) ? new vscode.Range(line, 0, line, 0) : new vscode.Range(line, 0, line, 0);
          editor.setDecorations(this.highlightDecorationType, [range]);
          editor.revealRange(range, vscode.TextEditorRevealType.InCenter);
          break;
        }
        case "unhighlight": {
          const editor = vscode.window.activeTextEditor;
          if (!editor) { return; }
          editor.setDecorations(this.highlightDecorationType, []);
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

    // Listen for the custom event to refresh projects
    onRefreshProjects.event(async () => {
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

    const svgUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "fairlyAccess.svg")
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
        <link rel="icon" type="image/svg" href="${svgUri}" />
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