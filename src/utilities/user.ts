import * as vscode from 'vscode';


export function login() {
    const document = vscode.window.activeTextEditor?.document;
    if(document && document.fileName.includes("html")) {
        return fetch('http://localhost:4000/auth', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        }).then(response => {
            return response.json()
            .then(data => {
                return data;
            });
        });
    }
}