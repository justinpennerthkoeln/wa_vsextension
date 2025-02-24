import * as vscode from 'vscode';

export function login(loginData: { email: string, password: string }) {
    return fetch(`http://localhost:4000/auth?email=${loginData.email}&password=${loginData.password}`, {
        method: 'get',
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

export function getUsers(filter: string) {
    return fetch(`http://localhost:4000/v1/users?filter=${filter}`, {
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