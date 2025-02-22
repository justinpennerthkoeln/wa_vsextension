import React from 'react';
import { useApp } from './Store';
import '../../../media/issuePanel.css';

const IssuePanel = () => {
  const { userProjects, actions } = useApp();

  return (
    <div>
      <section id="projects-panel-header">
        <div>
          <h2>Testproject - Issues</h2>
          <button id="flag">Member</button>
          <button id="delete-btn">Delete</button>
        </div>
        <p>Created: 12.03.2025</p>
      </section>

      <section id="issue-panel-content">
        <h3>login.html / Kevin P.</h3>
        <div id="issues-panel">
          <div className="container issue">
            <div className="issue-content-header">
              <h4>Provide text content for elements</h4>
              <h4>Line: 3</h4>
            </div>
            <pre>
              &lt;label&gt;&lt;/label&gt;
            </pre>
            <h4>Suggestion</h4>
            <pre>
              &lt;label&gt;Test Content&lt;/label&gt;
            </pre>
          </div>
          <div className="container issue">
            <div className="issue-content-header">
              <h4>Provide for Attribute</h4>
              <h4>Line: 3</h4>
            </div>
            <pre>
              &lt;label for=""&gt;&lt;/label&gt;
            </pre>
            <h4>Suggestion</h4>
            <pre>
              &lt;label for="username"&gt;&lt;/label&gt;
            </pre>
          </div>
        </div>
      </section>
      {/* Add your audit sidebar content here */}
    </div>
  );
};

export default IssuePanel;