import * as vscode from 'vscode';
import { AuditResults } from '../../src/webview/utilities/types';

export function addIssue(projectUuid: string, userToken: string, auditResults: AuditResults) {
    const filename = vscode.window.activeTextEditor?.document.fileName.split('/').pop();
    if (!filename) {
        return false;
    }

    return fetch(`http://217.154.85.189:4000/v1/projects/${projectUuid}/add_issue`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            user_token: userToken,
            audit_results: auditResults,
            filename: filename
        })
    }).then(response => {
        return response.json().then(data => {
            return data.success;
        });
    })
}

export function deleteIssue(issueUuid: string) {
    return fetch(`http://217.154.85.189:4000/v1/issues/${issueUuid}/delete`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    }).then(response => {
        return response.json().then(data => {
            return data;
        });
    })
}