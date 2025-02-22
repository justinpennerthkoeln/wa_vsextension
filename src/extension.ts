import { commands, ExtensionContext } from "vscode";
import * as vscode from "vscode";
import { ProjectsPanel } from "./panels/ProjectsPanel";
import { IssuePanel } from "./panels/IssuePanel";
import { AuditSidebarProvider } from "./panels/AuditSidebarProvider";
import { ProjectsSidebarProvider } from "./panels/ProjectsSidebarProvider";

export function activate(context: ExtensionContext) {

  const showProjectsPanel = commands.registerCommand("accessibility.openProjectPanel", () => {
    ProjectsPanel.render(context.extensionUri, context);
  });
  const showIssuePanel = commands.registerCommand("accessibility.openIssuePanel", () => {
    IssuePanel.render(context.extensionUri);
  });

  const auditSidebarProvider = new AuditSidebarProvider(context.extensionUri);
  const projectsSidebarProvider = new ProjectsSidebarProvider(context.extensionUri, context);

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider("vstodo-sidebar", auditSidebarProvider)
	);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider("vstodo-sidebar2", projectsSidebarProvider)
  );

  context.subscriptions.push(showProjectsPanel);
  context.subscriptions.push(showIssuePanel);
}
