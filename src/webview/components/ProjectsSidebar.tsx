import React, { useEffect, useState } from 'react';
import { useApp } from './Store';
import { vscode } from '../utilities/vscode';
import { buildDateFromString } from '../../utilities/buildDateFromString';
import LoadingCircle from './LoadingCircle';

const ProjectsSidebar = () => {
  const { userProjects, userToken, actions } = useApp();
  const [projectName, setProjectName] = useState('');
  const [projectCreated, setProjectCreated] = useState<boolean | null>(null);

  const handleProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (projectName.trim()) {
      vscode.postMessage({ type: 'create-project', value: { projectName, userToken: userToken } });
      setProjectName('');
    }
  };

  useEffect(() => {
    vscode.postMessage({ type: 'get-user' });

    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      if (message.type === 'get-user') {
        if (message.value.success) {
          actions.setUserToken(message.value.user.uuid);
          vscode.postMessage({ type: 'get-projects', userToken: message.value.user.uuid });
          return;
        } else {
          actions.setUserToken(null);
          return;
        } 
      }
      if (message.type === 'project-created') {
        if(message.value.success === false) {
          setProjectCreated(false);
          return;
        }
        setProjectCreated(true);
        actions.setUserProjects(message.value)
        return;
      }
      if(message.type === 'get-projects') {
        if(message.value.length == 0) {
          actions.setUserProjects([]);
          return;
        }
        actions.setUserProjects(message.value);
        return;
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [actions]);

  return (
    <div>
      <h2>Projects</h2>
      <p>Work with your Projects</p>

      {userToken == null && 
        <p className='warning'>Log in to use this feature</p>
      }

      {userToken != null && (
        <section id="projects-sidebar-content">
          <form onSubmit={handleProjectSubmit}>
            <h3>Create a New Project</h3>
            <input
              type="text"
              id="project-name"
              placeholder="Project Name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
            />
            <button type='submit'>Create Project</button>
          </form>

          { projectCreated && 
            <h3 className="success">Project created successfully</h3>
          }

          { projectCreated == false && 
            <h3 className="warning">Something went wrong try again</h3>
          }


          <h2>Your Projects</h2>
          {userProjects && userProjects.length == 0 &&
            <p>No projects found</p>
          }

          {userProjects === null ? (
            <>
              <LoadingCircle />            
            </>
          ) : (
            <>
              {userProjects.map((project) => (
                <div key={project.id} className="project-sidebar-item">
                  <h3>{project.name}</h3>
                  <div>
                    <p>{buildDateFromString(project.inserted_at)}</p>
                    <button onClick={() => {
                      vscode.postMessage({ type: 'set-active-project', activeProject: project})
                      vscode.postMessage({ type: 'open-project' });
                      }}>
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
                </div>
              ))}
            </>
          )}
        </section>
      )}
    </div>
  );
};

export default ProjectsSidebar;