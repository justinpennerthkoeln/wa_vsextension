import { Disposable, Webview, WebviewPanel, window, Uri, ViewColumn } from "vscode";
import { getNonce } from "../utilities/getNonce";
import * as vscode from "vscode";

import { getProject, addUser, deleteUser, deleteProject, generate_pdf } from "../utilities/project";
import { getUsers } from "../utilities/user";
import { onRefreshProjects } from '../utilities/events';
import { Member, Project, User } from "../webview/utilities/types";

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

    // Listen for the custom event to refresh projects
    onRefreshProjects.event(() => {
      this._panel.webview.postMessage({
        type: "refresh-projects",
      });
    });
  }

  public static render(extensionUri: Uri, extensionContext: vscode.ExtensionContext) {
    if (ProjectsPanel.currentPanel) {
      ProjectsPanel.currentPanel._panel.reveal(ViewColumn.One);
    } else {
      const panel = window.createWebviewPanel(
        // Panel view type
        "showHelloWorld",
        // Panel title
        "Project",
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

      panel.iconPath = Uri.joinPath(extensionUri, "media", "fairlyAccess.svg");

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
            webview.postMessage({
              type: "get-project",
              value: {
                success: true,
                project: this._extensionContext.globalState.get("activeProject")
              },
            })
            return;
          case "add-user":
            const project = await addUser(value.project_uuid, value.user_uuid);
            webview.postMessage({
              type: "add-user",
              value: {
                success: true,
                project: project
              },
            });
            return;
          case "set-active-issue":
            await this._extensionContext.globalState.update("activeIssue", value.activeProject);
            return;
          case "open-issue":
            vscode.commands.executeCommand("accessibility.closeIssuePanel");
            vscode.commands.executeCommand("accessibility.openIssuePanel");
            return;
          case "get-users":
            var users = await getUsers(value.filter);
            webview.postMessage({
              type: "get-users",
              value: users,
            });
            return;
          case "delete-user":
            await deleteUser(value.member_uuid);
            return;
          case "delete-project":
            const isDeleted = await deleteProject(value.project_uuid);
            if (isDeleted) {
              vscode.commands.executeCommand("accessibility.closeIssuePanel");
              vscode.commands.executeCommand("accessibility.closeProjectPanel");
              return;
            }
            webview.postMessage({
              type: "delete-project",
              value: {
                success: false,
              },
            });
            return;
          case "get-user":
            const user = (await this._extensionContext.globalState.get("user") as {success: boolean, user: User});
            var active_project = await this._extensionContext.globalState.get("activeProject");
            var state = false;
            
            (active_project as Project).members.forEach((member: Member) => {
              if(member.username === user.user.username && member.role === "owner") { state = true; return;}
            });
            
            if(state) {
              webview.postMessage({
                type: "get-user",
                value: { isUserOwner: true},
              });
            }

            if(state === false) {
              webview.postMessage({
                type: "get-user",
                value: { isUserOwner: false},
              });
            }
            return;
          case "generate-pdf":
            await generate_pdf(value.issues, value.project);
            return;
        }
      },
      undefined,
      this._disposables
    );
  }
}
