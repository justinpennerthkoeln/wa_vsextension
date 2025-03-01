import * as vscode from 'vscode';

// Audit Sidebar
export const onRefreshProjectsInAuditSidebar = new vscode.EventEmitter<void>();
export const onLogoutInAuditSidebar = new vscode.EventEmitter<void>();
export const onLoginInAuditSidebar = new vscode.EventEmitter<void>();

// Projects Sidebar
export const onRefreshProjectsInProjectsSidebar = new vscode.EventEmitter<void>();
export const onLogoutInProjectsSidebar = new vscode.EventEmitter<void>();
export const onLoginInProjectsSidebar = new vscode.EventEmitter<void>();

// Projects Panel
export const onUpdateIssuesInProjectsPanel = new vscode.EventEmitter<void>();