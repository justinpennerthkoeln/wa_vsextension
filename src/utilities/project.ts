import * as vscode from 'vscode';
import { AuditResults } from '../../src/webview/utilities/types';

export function createProject(projectName: string, userToken: string) {
    return fetch('http://217.154.85.189:4000/v1/projects/create', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            project_name: projectName,
            user_token: userToken
        })
    }).then(response => {
        return response.json().then(data => {
            return data;
        });
    })
}

export function getProjects(userToken: string) {
    return fetch(`http://217.154.85.189:4000/v1/projects/all/${userToken}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    }).then(response => {
        return response.json().then(data => {
            return data;
        });
    }
    )
}

export function getProject(projectUuid: string) {
    return fetch(`http://217.154.85.189:4000/v1/projects/${projectUuid}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    }).then(response => {
        return response.json().then(data => {
            return data;
        });
    }
    )
}

export function deleteProject(projectUuid: string) {
    return fetch(`http://217.154.85.189:4000/v1/projects/${projectUuid}/delete`, {
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