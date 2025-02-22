import { Disposable, Webview, WebviewPanel, window, Uri, ViewColumn } from "vscode";
import { getNonce } from "../utilities/getNonce";
import * as vscode from "vscode";

import { getProject, addUser } from "../utilities/project";

export class ProjectsPanel {
  public static currentPanel: ProjectsPanel | undefined;
  private readonly _panel: WebviewPanel;
  private _disposables: Disposable[] = [];
  private extensionUri: Uri;
  private _extensionContext: vscode.ExtensionContext

  private constructor(panel: WebviewPanel, extensionUri: Uri, extensionContext: vscode.ExtensionContext) {
    this._panel = panel;

    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    this._panel.webview.html = this._getWebviewContent(this._panel.webview, extensionUri);

    this.extensionUri = extensionUri;
    this._extensionContext = extensionContext;

    this._panel.webview.options = {
      enableScripts: true,
      localResourceRoots: [this.extensionUri],
    };

    this._setWebviewMessageListener(this._panel.webview);
  }

  public static render(extensionUri: Uri, extensionContext: vscode.ExtensionContext) {
    if (ProjectsPanel.currentPanel) {
      ProjectsPanel.currentPanel._panel.reveal(ViewColumn.One);
    } else {
      const panel = window.createWebviewPanel(
        // Panel view type
        "showHelloWorld",
        // Panel title
        "Hello World",
        // The editor column the panel should be displayed in
        ViewColumn.One,
        // Extra panel configurations
        {
          // Enable JavaScript in the webview
          enableScripts: true,
          // Restrict the webview to only load resources from the `out` and `webview-ui/build` directories
          localResourceRoots: [
            Uri.joinPath(extensionUri, "out"),
            Uri.joinPath(extensionUri, "webview-ui/build"),
            Uri.joinPath(extensionUri, "src", "webview", "dist") // Add this line
          ],
        }
      );

      ProjectsPanel.currentPanel = new ProjectsPanel(panel, extensionUri, extensionContext);
    }
  }

  public dispose() {
    ProjectsPanel.currentPanel = undefined;

    // Dispose of the current webview panel
    this._panel.dispose();

    // Dispose of all disposables (i.e. commands) for the current webview panel
    while (this._disposables.length) {
      const disposable = this._disposables.pop();
      if (disposable) {
        disposable.dispose();
      }
    }
  }

  private _getWebviewContent(webview: Webview, extensionUri: Uri) {
    const styleResetUri = webview.asWebviewUri(
      vscode.Uri.joinPath(extensionUri, "media", "reset.css")
    );
    const styleVSCodeUri = webview.asWebviewUri(
      vscode.Uri.joinPath(extensionUri, "media", "vscode.css")
    );
    const styleRootUri = webview.asWebviewUri(
      vscode.Uri.joinPath(extensionUri, "media", "root.css")
    );
    const styleProjectPanelUri = webview.asWebviewUri(
      vscode.Uri.joinPath(extensionUri, "media", "projectPanel.css")
    );

    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(extensionUri, "src", "webview", "dist", "main.js")
    );

    const nonce = getNonce();

    // Tip: Install the es6-string-html VS Code extension to enable code highlighting below
    return /*html*/ `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
          <link href="${styleResetUri}" rel="stylesheet">
          <link href="${styleVSCodeUri}" rel="stylesheet">
          <link href="${styleRootUri}" rel="stylesheet">
          <link href="${styleProjectPanelUri}" rel="stylesheet">
          <title>Project</title>
        </head>
        <body>
          <div id="root"></div>
          <script nonce="${nonce}" type="module">
            window.history.pushState({}, '', '/projects/1');
          </script>
          <script type="module" nonce="${nonce}" src="${scriptUri}"></script>
        </body>
      </html>
    `;
  }

  private _setWebviewMessageListener(webview: Webview) {

    webview.onDidReceiveMessage(
      async (message: any) => {
        const type = message.type;
        const value = message.value;

        switch (type) {
          case "get-project":
            var project = await getProject(this._extensionContext.globalState.get("activeProject") as string)
            webview.postMessage({
              type: "get-project",
              value: {
                success: true,
                project: project
              },
            })
            return;
          case "add-user":
            var project = await addUser(value.project_uuid, value.user_uuid);
            webview.postMessage({
              type: "add-user",
              value: {
                success: true,
                project: project
              },
            });
            return;
          case "delete-user":
            // Delete user from project
            return;
        }
      },
      undefined,
      this._disposables
    );
  }
}
