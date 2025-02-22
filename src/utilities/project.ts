import * as vscode from 'vscode';
import { AuditResults } from '../../src/webview/utilities/types';

export function createProject(projectName: string, userToken: string) {
    return fetch('http://localhost:4000/v1/projects/create', {
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
    return fetch(`http://localhost:4000/v1/projects/all/${userToken}`, {
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
    return fetch(`http://localhost:4000/v1/projects/${projectUuid}`, {
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

export function addUser(projectUuid: string, userUuid: string) {
    return fetch(`http://localhost:4000/v1/projects/${projectUuid}/add_member`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            user_token: userUuid
        })
    }).then(response => {
        return response.json().then(data => {
            return data;
        });
    })
}

export function addIssue(projectUuid: string, userToken: string, auditResults: AuditResults) {
    return fetch(`http://localhost:4000/v1/projects/${projectUuid}/add_issue`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            user_token: userToken,
            audit_results: auditResults
        })
    }).then(response => {
        return response.json().then(data => {
            return data;
        });
    })
}