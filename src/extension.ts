import { commands, ExtensionContext } from "vscode";
import * as vscode from "vscode";
import { ProjectsPanel } from "./panels/ProjectsPanel";
import { IssuePanel } from "./panels/IssuePanel";
import { AuditSidebarProvider } from "./panels/AuditSidebarProvider";
import { ProjectsSidebarProvider } from "./panels/ProjectsSidebarProvider";
import { SettingsSidebarProvider } from "./panels/SettingsSidebarProvider";
import {doAudit} from "./utilities/audit";
import { AuditResults } from "./webview/utilities/types";
import { generateAuditPdf } from "./utilities/pdf_gen";

export function activate(context: ExtensionContext) {

  // Access settings from the configuration and add an event listener for changes
  var config = vscode.workspace.getConfiguration('fairlyAccess');
  var isEnabled = config.get<boolean>('enable');
  var auditOnSave = config.get<boolean>('auditOnSave');
  var markIssuesOnSave = config.get<boolean>('markIssuesOnSave');
  var generatePdfOnSave = config.get<boolean>('generatePdfOnSave');

  vscode.workspace.onDidChangeConfiguration((e) => {
    if (e.affectsConfiguration('fairlyAccess.enable')) {
      isEnabled = vscode.workspace.getConfiguration('fairlyAccess').get<boolean>('enable');
    }
    if (e.affectsConfiguration('fairlyAccess.auditOnSave')) {
      auditOnSave = vscode.workspace.getConfiguration('fairlyAccess').get<boolean>('auditOnSave');
    }
    if (e.affectsConfiguration('fairlyAccess.markIssuesOnSave')) {
      markIssuesOnSave = vscode.workspace.getConfiguration('fairlyAccess').get<boolean>('markIssuesOnSave');
    }
    if (e.affectsConfiguration('fairlyAccess.generatePdfOnSave')) {
      generatePdfOnSave = vscode.workspace.getConfiguration('fairlyAccess').get<boolean>('generatePdfOnSave');
    }
  });

  // Register commands
  const showProjectsPanel = commands.registerCommand("fairlyAccess.openProjectPanel", () => {
    ProjectsPanel.render(context.extensionUri, context);
  });
  const closeProjectsPanel = commands.registerCommand("fairlyAccess.closeProjectPanel", () => {
    ProjectsPanel.currentPanel?.dispose();
  });

  const showIssuePanel = commands.registerCommand("fairlyAccess.openIssuePanel", () => {
    IssuePanel.render(context.extensionUri, context);
  });
  const closeIssuePanel = commands.registerCommand("fairlyAccess.closeIssuePanel", () => {
    IssuePanel.currentPanel?.dispose();
  });

  const auditCommand = commands.registerCommand("fairlyAccess.audit", async () => {
    await doAudit(markIssuesOnSave as boolean);
  });

  // Register the onDidSaveTextDocument event to trigger the audit on save
  vscode.workspace.onDidSaveTextDocument(async (document) => {
		if (auditOnSave && document.fileName.includes("html")) {
      const auditResults: AuditResults = await doAudit(markIssuesOnSave as boolean);
      if (generatePdfOnSave) {
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

  context.subscriptions.push(auditCommand);

	context.subscriptions.push(vscode.window.registerWebviewViewProvider("vstodo-sidebar", auditSidebarProvider));
  context.subscriptions.push(vscode.window.registerWebviewViewProvider("vstodo-sidebar2", projectsSidebarProvider));
  context.subscriptions.push(vscode.window.registerWebviewViewProvider("vstodo-sidebar3", settingsSidebarProvider));
  context.subscriptions.push(showProjectsPanel);
  context.subscriptions.push(showIssuePanel);
  context.subscriptions.push(closeProjectsPanel);
  context.subscriptions.push(closeIssuePanel);
}
