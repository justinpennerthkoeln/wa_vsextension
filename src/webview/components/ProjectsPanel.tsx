import React, { use, useEffect, useState } from 'react';
import { useApp } from './Store';
import '../../../media/projectPanel.css';
import { vscode } from '../utilities/vscode';
import { Issue, Member } from '../utilities/types';
import { buildDateFromString } from '../../utilities/buildDateFromString';
import Flag from './Flag.tsx';
import LoadingCircle from './LoadingCircle.tsx';

const ProjectsPanel = () => {
  const { activeProject, actions } = useApp();
  const [users, setUsers] = useState<any | null>(null);
  const [deleteUserError, setDeleteUserError] = useState(false);
  const [deleteProjectPermissionError, setDeleteProjectPermissionError] = useState(false);
  const [deleteProjectServerError, setDeleteProjectServerError] = useState(false);
  const [isUserOwner, setIsUserOwner] = useState<boolean | null>(null);

  /**
   * Handle functions
   */
  const handleDeleteUser = (e: React.FormEvent, user_uuid: string, user_role) => {
    e.preventDefault();

    if(user_role === "owner") {
      setDeleteUserError(true);
      return;
    }
    setDeleteUserError(false);
    e.currentTarget.closest('.user')?.remove();
    vscode.postMessage({ type: 'delete-user', value: { member_uuid: user_uuid } });
  };

  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // @ts-ignore
    const user_uuid = e.currentTarget.querySelector('select[id="selected-user"]')?.value;
    const select = document.getElementById('select-input');
    if(user_uuid) {
      setUsers([]);
      select?.setAttribute('value', '');
      vscode.postMessage({ type: 'add-user', value: {user_uuid: user_uuid, project_uuid: activeProject?.uuid} });
    }
  };

  const handleUserSelect = (e: React.FormEvent) => {
    e.preventDefault();
    const select = document.getElementById('select-input');
    // @ts-ignore
    const filter = select?.value;
    if(filter == "") {
      setUsers([])
      return;
    }
    if(filter) {
      vscode.postMessage({ type: 'get-users', value: {filter: filter} });
    }
  };

  const handleProjectDelete = (e: React.FormEvent) => {
    e.preventDefault();
    if(!isUserOwner) {
      setDeleteProjectPermissionError(true);
      return;
    }
    setDeleteProjectPermissionError(false);
    vscode.postMessage({ type: 'delete-project', value: { project_uuid: activeProject?.uuid } });
  };
 
  /**
   * message event listener
   */
  useEffect(() => {
    vscode.postMessage({ type: 'get-project' });

    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      if (message.type === 'get-project') {
        if (message.value.success) {
          actions.setActiveProject(message.value.project)
          vscode.postMessage({ type: 'get-user' });
        }
        return;
      }
      if (message.type === 'delete-user') {
        if (message.value.success) {
          actions.setActiveProject(message.value.project)
        }
        return;
      }
      if(message.type === "add-user") {
        if(message.value.success) {
          actions.setActiveProject(message.value.project)
        }
        return;
      }
      if(message.type === "get-users") {
        setUsers(message.value);
        return;
      }
      if(message.type === "delete-project") {
        if(!message.value.success) {
          setDeleteProjectServerError(true);
        }
        return;
      }
      if(message.type === "get-user") {
        setIsUserOwner(message.value.isUserOwner);
        return;
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [actions]);

  if(activeProject == null) {
    return (
      <LoadingCircle/>
    )
  }

  return (
    <div id="projects-panel">
      <section id="projects-panel-header">
        <div>
          <h2>{activeProject.name}</h2>
          { isUserOwner !== null &&
            <Flag flag={(isUserOwner)?"owner":"member"}></Flag>
          }
          <button id="delete-btn" onClick={
            (e) => {handleProjectDelete(e);}
          } hidden={!isUserOwner}>Delete</button>
        </div>
        <p>Created: {buildDateFromString(activeProject.inserted_at)}</p>
        <p id="error-msg" hidden={!deleteProjectPermissionError} className='warning'>You aren't allowed to delete this Project</p>
        <p id="error-msg" hidden={!deleteProjectServerError} className='warning'>Something went wrong. Please reopen panel.</p>
      </section>

      <section id="projects-panel-content">
        <div id="issues" className="container">
          <h3>Issues</h3>
          { activeProject.issues.length === 0 && <p>No issues found</p> }
          {
            activeProject.issues.map((issue:Issue) => (
              <div className="issue" id={issue.uuid}>
                <p>{issue.filename}</p>
                <p>{issue.user.username}</p>
                <p>Created: {buildDateFromString(issue.inserted_at)}</p>
                <button onClick={
                  () => {
                    vscode.postMessage({ type: 'set-active-issue', activeIssue: issue.uuid})
                    vscode.postMessage({ type: 'open-issue' });
                  }
                }>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    className="arrow-right bi bi-arrow-right"
                    viewBox="0 0 16 16"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10.354 7.354a.5.5 0 0 0 0-.708l-4-4a.5.5 0 0 0-.708.708L8.293 7 5.646 9.646a.5.5 0 0 0 .708.708l4-4z"
                    />
                  </svg>
                </button>
              </div>
            ))
          }
        </div>
        <div id="users" className="container">
          <h3>Users</h3>
          {
            activeProject.members.map((user: Member) => (
              <div className="user" key={user.uuid} id={user.uuid}>
                <p>{user.username}</p>
                <p>{user.role}</p>
                <p>Added: {buildDateFromString(user.inserted_at)}</p>
                <button onClick={(event) => handleDeleteUser(event, user.uuid, user.role)}>Delete</button>
              </div>
            ))
          }
          <p id="error-msg" hidden={!deleteUserError} className='warning'>You are not allowed to delete the Owner</p>
          <div id="add-user">
            <h3>Add User</h3>
            <form action="" id="add-user-form" onSubmit={handleAddUserSubmit}>
              <div id="input-container">
                <input type="text" placeholder="User Name" id="select-input" onChange={handleUserSelect}/>
                <button>Add</button>
              </div>
              { users &&
                <select name="" id="selected-user" hidden={users.length === 0} size={users.length}>
                  {
                    users.map((user: Member) => (
                      <option value={user.uuid}>{user.username}</option>
                    ))
                  }
                </select>
              }
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProjectsPanel;