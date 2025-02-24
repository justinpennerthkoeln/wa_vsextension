import React, { useEffect, useState } from 'react';
import { useApp } from './Store';
import { vscode } from '../utilities/vscode';
import '../../../media/settingsSidebar.css';
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
    vscode.postMessage({ type: 'save-settings', 
      value: [
        { 
          checked: (document.getElementById('auto-audit') as HTMLInputElement).checked,
          name: 'Run Audit on page Save',
          identifier: 'auto-audit'
        },
        {
          checked: (document.getElementById('auto-pdf') as HTMLInputElement).checked,
          name: 'Generate PDF on page Save',
          identifier: 'auto-pdf'
        },
        {
          checked: (document.getElementById('auto-mark') as HTMLInputElement).checked,
          name: 'Mark issues in code on page Save',
          identifier: 'auto-mark'
        }
      ] });
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
        setSettings(
          [
            { checked: false, name: 'Run Audit on page Save', identifier: 'auto-audit' },
            { checked: false, name: 'Generate PDF on page Save', identifier: 'auto-pdf' },
            { checked: false, name: 'Mark issues in code on page Save', identifier: 'auto-mark' }
          ]
        );
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
          <h3>Welcome, {user.username}</h3>
          <button onClick={handleLogout}>Logout</button>

          <h3>Your Settings</h3>
          <form action="" id="settings-form" onSubmit={
            (e) => {
              e.preventDefault();
              handleSaveSettings(e);
            }
          }>
              {settings.map((setting: any, index: number) => {
                return (
                  <div key={index} className="container">
                    <div>
                      <label htmlFor={setting.name}>{setting.name}</label>
                      <input type="checkbox" id={setting.identifier} name={setting.name} defaultChecked={setting.checked} />
                    </div>
                  </div>
                );
              })}
            <button type="submit">Save</button>
          </form>
        </>
      }

    </div>
  );
};

export default SeetingsSidebar;