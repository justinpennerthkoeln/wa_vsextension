import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AuditSidebar from './components/AuditSidebar';
import ProjectsSidebar from './components/ProjectsSidebar';
import ProjectsPanel from './components/ProjectsPanel';
import IssuePanel from './components/IssuePanel';
import SettingsSidebar from './components/SettingsSidebar';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/projects" element={<ProjectsSidebar />} />
        <Route path="/audit" element={<AuditSidebar />} />
        <Route path="/project" element={<ProjectsPanel />} />
        <Route path="/issue" element={<IssuePanel />} />
        <Route path="/settings" element={<SettingsSidebar/>} />
      </Routes>
    </Router>
  );
}

export default App;
