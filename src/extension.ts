import { commands, ExtensionContext } from "vscode";
import * as vscode from "vscode";
import { ProjectsPanel } from "./panels/ProjectsPanel";
import { IssuePanel } from "./panels/IssuePanel";
import { AuditSidebarProvider } from "./panels/AuditSidebarProvider";
import { ProjectsSidebarProvider } from "./panels/ProjectsSidebarProvider";
import { SettingsSidebarProvider } from "./panels/SettingsSidebarProvider";

export function activate(context: ExtensionContext) {

  const showProjectsPanel = commands.registerCommand("accessibility.openProjectPanel", () => {
    ProjectsPanel.render(context.extensionUri, context);
  });
  const closeProjectsPanel = commands.registerCommand("accessibility.closeProjectPanel", () => {
    ProjectsPanel.currentPanel?.dispose();
  });

  const showIssuePanel = commands.registerCommand("accessibility.openIssuePanel", () => {
    IssuePanel.render(context.extensionUri);
  });
  const closeIssuePanel = commands.registerCommand("accessibility.closeIssuePanel", () => {
    IssuePanel.currentPanel?.dispose();
  });

  const auditSidebarProvider = new AuditSidebarProvider(context.extensionUri, context);
  const projectsSidebarProvider = new ProjectsSidebarProvider(context.extensionUri, context);
  const settingsSidebarProvider = new SettingsSidebarProvider(context.extensionUri, context);

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider("vstodo-sidebar", auditSidebarProvider)
	);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider("vstodo-sidebar2", projectsSidebarProvider)
  );

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider("vstodo-sidebar3", settingsSidebarProvider)
  )

  context.subscriptions.push(showProjectsPanel);
  context.subscriptions.push(showIssuePanel);
  context.subscriptions.push(closeProjectsPanel);
  context.subscriptions.push(closeIssuePanel);
}
