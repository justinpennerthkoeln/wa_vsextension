import * as vscode from 'vscode';

export async function login(loginData: { email: string, password: string }) {
    const email = loginData.email;
    const password = loginData.password;
    return await fetch(`http://217.154.85.189:4000/auth?email=${email}&password=${password}`, {
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
    return fetch(`http://217.154.85.189:4000/v1/users?filter=${filter}`, {
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
    return fetch(`http://217.154.85.189:4000/v1/projects/${projectUuid}/add_member`, {
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

export function deleteUser(memberUuid: string) {
    return fetch(`http://217.154.85.189:4000/v1/projects/${memberUuid}/delete_member`, {
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