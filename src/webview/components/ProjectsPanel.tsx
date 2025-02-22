import React, { useEffect, useState } from 'react';
import { useApp } from './Store';
import '../../../media/projectPanel.css';
import { vscode } from '../utilities/vscode';
import { Issue, Member } from '../utilities/types';

const ProjectsPanel = () => {
  const { activeProject, actions } = useApp();

  const handleDeleteUser = (e: React.FormEvent, user_uuid: string) => {
    e.preventDefault();
    e.currentTarget.closest('.user')?.remove();
    vscode.postMessage({ type: 'delete-user', value: { project_uuid: activeProject?.uuid, user_uuid: user_uuid } });
  };

  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // @ts-ignore
    const user_uuid = e.currentTarget.querySelector('input[type="hidden"]')?.value;
    if(user_uuid) {
      vscode.postMessage({ type: 'add-user', value: {user_uuid: user_uuid, project_uuid: activeProject?.uuid} });
    }
  };

  useEffect(() => {
    vscode.postMessage({ type: 'get-project' });

    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      if (message.type === 'get-project') {
        if (message.value.success) {
          actions.setActiveProject(message.value.project)
        } 
        return;
      }
      if (message.type === 'delete-user') {
        if (message.value.success) {
          actions.setActiveProject(message.value.project)
        }
      }
      if(message.type === "add-user") {
        if(message.value.success) {
          actions.setActiveProject(message.value.project)
        }
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [actions]);

  if(activeProject == null) {
    return (
      <div>
        <h2>No Project found</h2>
        <p>Select project from the sidebar</p>
      </div>
    )
  }


  return (
    <div id="projects-panel">
      <section id="projects-panel-header">
        <div>
          <h2>{activeProject.name}</h2>
          <button id="flag">Member</button>
          <button id="delete-btn">Delete</button>
        </div>
        <p>Created: {activeProject.inserted_at}</p>
      </section>

      <section id="projects-panel-content">
        <div id="issues" className="container">
          <h3>Issues</h3>
          {
            activeProject.issues.map((issue:Issue) => (
              <div className="issue" id={issue.uuid}>
                <p>FileName</p>
                <p>Kevin P.</p>
                <p>Created: {issue.inserted_at}</p>
                <button>-&gt;</button>
              </div>
            ))
          }
          <div className="issue">
            <p>login.html</p>
            <p>Kevin P.</p>
            <p>Created: 12.03.2025</p>
            <button>-&gt;</button>
          </div>
        </div>
        <div id="users" className="container">
          <h3>Users</h3>
          {
            activeProject.members.map((user: Member) => (
              <div className="user" key={user.uuid} id={user.uuid}>
                <p>{user.username}</p>
                <p>{user.role}</p>
                <p>Added: {user.inserted_at}</p>
                <button onClick={(event) => handleDeleteUser(event, user.uuid)}>Delete</button>
              </div>
            ))
          }
          <div id="add-user">
            <h3>Add User</h3>
            <form action="" id="add-user-form" onSubmit={handleAddUserSubmit}>
              <input type="hidden" value="db3d7292-d17a-4a31-9173-c227d7cefada" />
              <input type="text" placeholder="User Name" />
              <button>Add</button>
            </form>
          </div>
        </div>
      </section>

      {/* Add your audit sidebar content here */}
    </div>
  );
};

export default ProjectsPanel;