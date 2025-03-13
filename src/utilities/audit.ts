import * as vscode from 'vscode';
import { AuditResults, Settings } from '../webview/utilities/types';

const auditDiagnosticCollection = vscode.languages.createDiagnosticCollection('fairlyAccess-audit');

export async function doAudit(markIssuesOnSave: boolean) {
    auditDiagnosticCollection.clear();
    const document = vscode.window.activeTextEditor?.document;
    if(document && document.fileName.includes("html")) {
        return pocAudit(document.getText()).then((data) => {
						if(markIssuesOnSave) {
							markIssueLines(data, document, auditDiagnosticCollection);
						}
						return data;
					})
    } else {
		return {success: false};
	}
}

function pocAudit(filecontent: string): Promise<any> {

	const test: Promise<any> = fetch('http://217.154.85.189:4000/v1/audit', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			api_key: "1e05121b-247f-485b-ab2e-94757a11ca97",
			filecontent: filecontent
		})
	})
	.then(response => {
		return response.json().then(data => {
			return data;
		});
	});

	return test;
}

function markIssueLines(data: AuditResults, document: vscode.TextDocument, auditDiagnosticCollection: vscode.DiagnosticCollection) {
	const matches = data.matches;
	const diagnostics: vscode.Diagnostic[] = [];

	for (const match of matches) {
		if(match.lineIndex) {
			const line = match.lineIndex - 1;
			const range = document.lineAt(line).range;
			const linesCount = match.content.split(/\r\n|\r|\n/).length;
	
			if(linesCount > 1) {
				const start = new vscode.Position(line, (range.end.character - (match.content.split("\n")[0].length-1)));
				const end = new vscode.Position(line, range.end.character);
				const diagnostic = new vscode.Diagnostic(new vscode.Range(start, end), (match.suggestion) ? match.heading + "\n\n" +  match.suggestion : match.heading , vscode.DiagnosticSeverity.Warning);
				diagnostics.push(diagnostic);
			} else {
				const start = new vscode.Position(line, (range.end.character - (match.content.length)));
				const diagnostic = new vscode.Diagnostic(new vscode.Range(start, range.end), (match.suggestion) ? match.heading + "\n\n" +  match.suggestion : match.heading , vscode.DiagnosticSeverity.Warning);
				diagnostics.push(diagnostic);
			}
		}
	}
	auditDiagnosticCollection.set(document.uri, diagnostics);
}


export default doAudit;