import React, { useEffect } from 'react';
import { useApp } from './Store';
import '../../../media/issuePanel.css';
import { vscode } from '../utilities/vscode';
import LoadingCircle from './LoadingCircle';
import Flag from './Flag';
import { buildDateFromString } from '../../utilities/buildDateFromString';
import { Match } from '../utilities/types';

const IssuePanel = () => {
  const { activeProject, actions } = useApp();
  const [isUserOwner, setIsUserOwner] = React.useState<boolean | null>(null);
  const [activeIssue, setActiveIssue] = React.useState<any | null>(null);
  const [pressedDeleteBtn, setPressedDeleteBtn] = React.useState<boolean>(false);

  const handlePdfGeneration = () => {
    vscode.postMessage({ type: 'generate-pdf', value: { issue: activeIssue } });
  };

  useEffect(() => {
    vscode.postMessage({ type: 'get-project' });
    vscode.postMessage({ type: 'get-issue' });

    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      if (message.type === 'get-issue') {
        if (message.value.success) {
          setActiveIssue(message.value.issue);
          actions.setActiveIssue(message.value.issue);
        }
        return;
      }
      if (message.type === 'get-project') {
        if (message.value.success) {
          actions.setActiveProject(message.value.project);
          vscode.postMessage({ type: 'get-user' });
        }
        return;
      }
      if (message.type === 'get-user') {
        setIsUserOwner(message.value.isUserOwner);
        return;
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [actions]);

  return (
    <div id="issue-panel">
      {activeProject == null && 
        <>
          <LoadingCircle/>
        </>
      }

      {activeProject != null &&
       <>
        <section id="issue-panel-header">
          <div>
            <h2>{activeProject.name}</h2>
            { isUserOwner !== null &&
              <Flag flag={(isUserOwner) ? "owner" : "member"}></Flag>
            }
            { pressedDeleteBtn ? (
                <div className="pull-right">
                  <LoadingCircle/>
                </div>
              ) : (
                <button className="delete-btn"
                    onClick={
                      (e) => {
                        e.preventDefault();
                        vscode.postMessage({ type: 'delete-issue', value: { issueUuid: activeIssue.uuid } });
                        setPressedDeleteBtn(true);
                      }
                    }
                  >
                    Delete
                </button>
              )
            }
          </div>
          <p>Created: {buildDateFromString(activeProject.inserted_at)}</p>
          <p id="error-msg" hidden={true} className='warning'>You aren't allowed to delete this Project</p>
          <p id="error-msg" hidden={true} className='warning'>Something went wrong. Please reopen panel.</p>
        </section>

        {
          activeIssue == null &&
          <>
            <LoadingCircle/>
          </>
        }

        <>
          {activeIssue != null && 
            <section id="issue-panel-content">
              <div id="issue-panel-content-header">
                <h3>{activeIssue.filename} - {activeIssue.matches_count} Issues</h3>
                <button
                  onClick={
                    (e) => {
                      e.preventDefault();
                      handlePdfGeneration();
                    }
                  }
                >Generate PDF</button>
              </div>
              <div id="issues-panel">
                {
                  (Object.values(activeIssue.matches) as Match[]).map((match: Match, index: number) => (
                    <div className="container issue" key={index}>
                      <div className="issue-content-header">
                        <h4>{match.heading}</h4>
                        <h4>Line: {(match.lineIndex) ? match.lineIndex : "Could't get line Index"}</h4>
                      </div>
                      <pre>
                        {match.content}
                      </pre>
                      <div className="issue-description">
                        <h4>Description</h4>
                        <p>{match.description}</p>
                        <a href={match.url} target="_blank" rel="noreferrer">
                          More info
                        </a>
                      </div>
                      { (match.fixable) &&
                        <div id="suggestion-content">
                          <h4>Suggesstion</h4>
                          <pre>
                            {match.suggestion}
                          </pre>
                        </div>
                      }
                    </div>
                  )
                )}
              </div>
            </section>
          }
        </>
        
       </>
      }
    </div>
  );
};

export default IssuePanel;