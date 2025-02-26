import React, { useEffect, useState } from 'react';

import { useApp } from './Store';
import '../../../media/auditSidebar.css';
import { vscode } from '../utilities/vscode';
import { Match, Project } from '../utilities/types';


const AuditSidebar = () => {
  const { auditResults, userProjects, userToken, actions } = useApp();
  const [isIssueAdded, setIsIssueAdded] = useState<boolean | null>(null);
  const [isNotHtml, setIsNotHtml] = useState<boolean | null>(null);

  const handleAudit = () => {
    setIsNotHtml(false);
    vscode.postMessage({ type: 'audit' });
  };

  const handleAddIssue = (e: React.FormEvent) => {
    e.preventDefault();
    setIsIssueAdded(null);
    const select = document.getElementById('add-issue');
    // @ts-ignore
    const project_uuid = select?.value;
    if(project_uuid) {
      vscode.postMessage({ type: 'add-issue', value: { project_uuid, userToken, auditResults } });
    }
  };

  const handlePdfGeneration = (e: React.MouseEvent, auditResults: any) => {
    e.preventDefault();
    vscode.postMessage({ type: 'generate-pdf', value: auditResults });
  };

  useEffect(() => {
    vscode.postMessage({ type: 'get-user' });

    // Handler for messages from the VS Code extension
    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      if (message.type === 'get-user') {
        if (message.value.success) {
          actions.setUserToken(message.value.user.uuid);
          vscode.postMessage({ type: 'get-projects', userToken: message.value.user.uuid });
          return;
        }
      }
      if(message.type === 'auditResults') {
        if(!message.value.success) {
          setIsNotHtml(true);
          return;
        }
        actions.setAuditResults(message.value);
        return;
      }
      if(message.type === 'get-projects') {
        if(message.value.length == 0) {
          actions.setUserProjects(null);
          return;
        }
        actions.setUserProjects(message.value);
      }
      if(message.type === 'add-issue') {
        if(message.value.success == false) {
          setIsIssueAdded(true);
          return;
        }
        setIsIssueAdded(false);
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
        <button onClick={handleAudit}>Audit</button>
        {isNotHtml &&
          <p className='warning'>Only HTML files can be audited</p>
        }

        {auditResults && auditResults.numberOfErrors === 0 &&
          <p className='success'>No issues found</p>
        }

        {auditResults && auditResults.numberOfErrors > 0 &&
          <>
            <button type="button" onClick={
              (e) => {
                handlePdfGeneration(e, auditResults);
              }
            }>Genereate PDF</button>
            <h3>Audit Results</h3>
            <div id="audit-results-sidebar">
              {
                // @ts-ignore
                auditResults.matches.map((match: Match, index: number) => (
                  <div key={index} className="audit-result" onClick={
                    (e) => {
                      vscode.postMessage({ type: 'highlight', value: {line: match.lineIndex} });
                    }
                  } onMouseOut={
                    (e) => {
                      vscode.postMessage({ type: 'unhighlight', value: {line: match.lineIndex} });
                    }
                  }>
                    <h3>{match.heading}</h3>
                    <p>Line Index: {match.lineIndex? match.lineIndex : "Could not be found"}</p>
                  </div>
                ))
              }

              { userToken == null &&
                <p className='warning'>Log in to use Projects-Feature</p>
              }
              { userProjects &&
                <>
                  <h3>Add Issue to Project</h3>
                  <form action="" onSubmit={handleAddIssue} >
                    <select name="" id="add-issue">
                      {
                        userProjects.map((project: Project, index: number) => (
                          <option key={index} value={project.uuid}>{project.name}</option>
                        ))
                      }
                    </select>
                    <button>Add to Project</button>
                    { isIssueAdded !== null &&
                      <>
                        <p className='success' hidden={isIssueAdded}>Added Issue</p>
                        <p className='warning' hidden={!isIssueAdded}>Select A html file.</p>
                      </>
                    }
                  </form>
                </>
              }
              
            </div>
          </>
        }
      </section>
    </div>
  );
};

export default AuditSidebar;