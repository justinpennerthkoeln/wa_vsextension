import { commands, ExtensionContext } from "vscode";
import * as vscode from "vscode";
import { ProjectsPanel } from "./panels/ProjectsPanel";
import { IssuePanel } from "./panels/IssuePanel";
import { AuditSidebarProvider } from "./panels/AuditSidebarProvider";
import { ProjectsSidebarProvider } from "./panels/ProjectsSidebarProvider";
import { SettingsSidebarProvider } from "./panels/SettingsSidebarProvider";
import doAudit from "./utilities/audit";
import { AuditResults, Settings } from "./webview/utilities/types";
import { evalSettings } from "./utilities/settings";
import { generateAuditPdf } from "./utilities/pdf_gen";

export function activate(context: ExtensionContext) {

  // Register commands
  const showProjectsPanel = commands.registerCommand("accessibility.openProjectPanel", () => {
    ProjectsPanel.render(context.extensionUri, context);
  });
  const closeProjectsPanel = commands.registerCommand("accessibility.closeProjectPanel", () => {
    ProjectsPanel.currentPanel?.dispose();
  });

  const showIssuePanel = commands.registerCommand("accessibility.openIssuePanel", () => {
    IssuePanel.render(context.extensionUri, context);
  });
  const closeIssuePanel = commands.registerCommand("accessibility.closeIssuePanel", () => {
    IssuePanel.currentPanel?.dispose();
  });

  const audit = commands.registerCommand("accessibility.audit", async () => {
    doCommandAudit();
  });

  vscode.workspace.onDidSaveTextDocument(async (document) => {
    const settings: Settings = context.globalState.get("settings") as Settings;
    const isAuditEnabledOnSave = evalSettings(settings, "auto-audit");
    const isPdfEnabledOnSave = evalSettings(settings, "auto-pdf");
		if (isAuditEnabledOnSave && document.fileName.includes("html")) {
      const auditResults: AuditResults = await doAudit(settings);
      if (isPdfEnabledOnSave) {
        var issue = [
          {
            filename: vscode.window.activeTextEditor?.document.fileName.split('/').pop(),
            inserted_at: new Date().toISOString(),
            matches: auditResults.matches,
            matches_count: auditResults.matches.length
          }
        ]
        generateAuditPdf(issue);
      }
		}
	});

  // Panel Provider initialization
  const auditSidebarProvider = new AuditSidebarProvider(context.extensionUri, context);
  const projectsSidebarProvider = new ProjectsSidebarProvider(context.extensionUri, context);
  const settingsSidebarProvider = new SettingsSidebarProvider(context.extensionUri, context);

  context.subscriptions.push(audit);

	context.subscriptions.push(vscode.window.registerWebviewViewProvider("vstodo-sidebar", auditSidebarProvider));
  context.subscriptions.push(vscode.window.registerWebviewViewProvider("vstodo-sidebar2", projectsSidebarProvider));
  context.subscriptions.push(vscode.window.registerWebviewViewProvider("vstodo-sidebar3", settingsSidebarProvider))
  context.subscriptions.push(showProjectsPanel);
  context.subscriptions.push(showIssuePanel);
  context.subscriptions.push(closeProjectsPanel);
  context.subscriptions.push(closeIssuePanel);
}
function doCommandAudit() {
  throw new Error("Function not implemented.");
}

