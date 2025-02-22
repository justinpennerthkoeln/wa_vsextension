import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AuditSidebar from './components/AuditSidebar';
import ProjectsSidebar from './components/ProjectsSidebar';
import ProjectsPanel from './components/ProjectsPanel';
import IssuePanel from './components/IssuePanel';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/projects" element={<ProjectsSidebar />} />
        <Route path="/audit" element={<AuditSidebar />} />
        <Route path="/projects/:projectId" element={<ProjectsPanel />} />
        <Route path="/projects/:projectId/issues/:issueId" element={<IssuePanel />} />
      </Routes>
    </Router>
  );
}

export default App;
