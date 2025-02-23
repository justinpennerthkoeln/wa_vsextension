import React, { useEffect, useState } from 'react';

import { useApp } from './Store';
import '../../../media/auditSidebar.css';
import { vscode } from '../utilities/vscode';
import { Match, Project } from '../utilities/types';


const AuditSidebar = () => {
  const { auditResults, userProjects, userToken, actions } = useApp();
  const [loginError, setLoginError] = useState(false);

  const handleAudit = () => {
    vscode.postMessage({ type: 'audit' });
  };

  const handleAddIssue = (e: React.FormEvent) => {
    // Get selected option from form
    e.preventDefault();
    const select = document.getElementById('add-issue');
    // @ts-ignore
    const project_uuid = select?.value;
    if(project_uuid) {
      vscode.postMessage({ type: 'add-issue', value: { project_uuid, userToken, auditResults } });
    }
  };

  useEffect(() => {
    // Post the login message only once on component mount
    vscode.postMessage({ type: 'login' });

    // Handler for messages from the VS Code extension
    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      if (message.type === 'login') {
        if (message.value.success) {
          actions.setUserToken(message.value);
          vscode.postMessage({ type: 'get-projects', userToken: message.value.user_key });
        } else {
          setLoginError(true);
        }
        return;
      }
      if(message.type === 'auditResults') {
        actions.setAuditResults(message.value);
        return;
      }
      if (message.type === 'login') {
        if (message.value.success) {
          actions.setUserToken(message.value);
        } else {
          actions.setUserToken(null);
        }
        return;
      }
      if(message.type === 'get-projects') {
        if(message.value.length == 0) {
          actions.setUserProjects(null);
          return;
        }
        actions.setUserProjects(message.value);
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [actions]);

  return (
    <div>
      <h2>Analysis</h2>
      <p>Audit the Current Page</p>

      <section id="audit-sidebar-content">
        {auditResults === null && 
          <button onClick={handleAudit}>Audit</button>
        }

        {auditResults &&
          <>
            <div id="audit-results-sidebar">
              <button type="button">Genereate PDF</button>
              { loginError &&
                <h3 className="warning">Error logging in</h3>
              }
              { loginError == false && userProjects == null &&
                <h3 className="warning">Create a project to use function</h3>
              }

              
              { userProjects &&
                <form action="" onSubmit={handleAddIssue} >
                  <select name="" id="add-issue" size={userProjects.length}>
                    {
                      userProjects.map((project: Project, index: number) => (
                        <option key={index} value={project.uuid}>{project.name}</option>
                      ))
                    }
                  </select>
                  <button>Add to Project</button>
                </form>
              }
              <h2>Audit Results</h2>
              {
                // @ts-ignore
                auditResults.matches.map((match: Match, index: number) => (
                  <div key={index} className="audit-result" >
                    <h3>{match.heading}</h3>
                    <pre>
                      {match.content}
                    </pre>
                    <p>Line Index: {match.lineIndex? match.lineIndex : "Could not be found"}</p>
                  </div>
                ))
              }
            </div>
          </>
        }
      </section>
    </div>
  );
};

export default AuditSidebar;