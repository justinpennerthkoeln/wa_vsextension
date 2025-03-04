import * as vscode from 'vscode';

export async function generateSingleIssuePdf(issue: any) {
    try {
        await fetch('http://217.154.70.96:4000/v1/pdf/gen_single_issue/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ issue: issue }),
        }).then(response => {
            return response.json()
        }).then(data => {
            // Open the PDF in the default PDF viewer
            vscode.env.openExternal(vscode.Uri.parse("http://217.154.70.96:4000/v1/pdf/" + data.pdf_path));
        });
    } catch (error) {
        throw new Error('Failed to generate PDF');
    }
}


export async function generateProjectPdf(issues: any, project: any) {
    try {
        await fetch('http://217.154.70.96:4000/v1/pdf/gen_project/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ issues: issues, project: project}),
        }).then(response => {
            return response.json()
        }).then(data => {
            // Open the PDF in the default PDF viewer
            vscode.env.openExternal(vscode.Uri.parse("http://217.154.70.96:4000/v1/pdf/" + data.pdf_path));
        });
    } catch (error) {
        throw new Error('Failed to generate PDF');
    }
}

export async function generateAuditPdf(issues: any) {
    try {
        await fetch('http://217.154.70.96:4000/v1/pdf/gen_audit/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ issues: issues }),
        }).then(response => {
            return response.json()
        }).then(data => {
            // Open the PDF in the default PDF viewer
            vscode.env.openExternal(vscode.Uri.parse("http://217.154.70.96:4000/v1/pdf/" + data.pdf_path));
        });
    } catch (error) {
        throw new Error('Failed to generate PDF');
    }
}