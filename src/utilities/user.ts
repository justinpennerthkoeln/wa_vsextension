import * as vscode from 'vscode';

export async function login(loginData: { email: string, password: string }) {
    return await fetch(`http://192.168.178.52:4000/auth?email=${loginData.email}&password=${loginData.password}`, {
        method: 'get',
        headers: {
            'Content-Type': 'application/json',
        }
    }).then(async (response) => {
        return await response.json()
            .then(async (data) => {
                return await data;
            });
    });
}

export function getUsers(filter: string) {
    return fetch(`http://192.168.178.52:4000/v1/users?filter=${filter}`, {
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