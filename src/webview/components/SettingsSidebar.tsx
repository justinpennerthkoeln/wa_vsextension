import React, { useEffect, useState } from 'react';
import { useApp } from './Store';
import { vscode } from '../utilities/vscode';
import '../../../media/auditSidebar.css';
import { User } from '../utilities/types';

const SeetingsSidebar = () => {
  const { actions } = useApp();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginError, setLoginError] = useState(false);
  const [user, setUser] = useState<any | null>(null);
  const [settings, setSettings] = useState<any | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(false);
    const email = (document.getElementById('email') as HTMLInputElement).value;
    const password = (document.getElementById('password') as HTMLInputElement).value;
    vscode.postMessage({ type: 'login', value: { email, password } });
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    vscode.postMessage({ type: 'logout' });
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    vscode.postMessage({ type: 'save-settings', value: { run: (document.getElementById('run') as HTMLInputElement).checked } });
  };

  useEffect(() => {

    // Check if the user is logged in. If not, show the login form. If so, get user information
    vscode.postMessage({ type: 'get-user' });
    vscode.postMessage({ type: 'get-settings' });

    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      if (message.type === 'login') {
        if (message.value.success) {
          setIsLoggedIn(true);
          setUser(message.value.user);
          return;
        }
        setLoginError(true)
        return;
      }
      if (message.type === 'get-user') {
        if (message.value.success) {
          setUser(message.value.user);
          setIsLoggedIn(true);
          return;
        }
      }
      if (message.type === 'get-settings') {
        if (message.value.success) {
          setSettings(message.value.settings);
          return;
        }
        setSettings({run: true});
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [actions]);

  return (
    <div>
      <h2>Settings</h2>
      <p>Settings for the extension</p>

      {!isLoggedIn &&
        <form action="" id="login-form" onSubmit={
          (e) => {
            handleLogin(e);
          }
        }>
          <label htmlFor="email">E-mail</label>
          <input type="email" id="email" name="email" />
          <label htmlFor="password">Password</label>
          <input type="password" id="password" name="password" />
          <button type="submit">Login</button>
          {loginError && <p className='warning'>Invalid login</p>}
        </form>
      }
      
      {isLoggedIn && user && settings &&
        <>
          <p>Welcome, {user.username}</p>
          <button onClick={handleLogout}>Logout</button>
          <form action="" id="settings-form" onSubmit={
            (e) => {
              e.preventDefault();
              handleSaveSettings(e);
            }
          }>
            <label htmlFor="run">Run on page load</label>
            <input type="checkbox" id="run" name="run" defaultChecked={settings.run} />
            <button type="submit">Save</button>
          </form>
        </>
      }

    </div>
  );
};

export default SeetingsSidebar;