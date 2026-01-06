import React, { PropsWithChildren } from 'react';
import ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';
//import {IStackTokens } from '@fluentui/react';
import { SettingsNav } from './settings-nav';
import { SettingsProfile } from './settings-profile';
import { SettingsMatch } from './settings-match';
import { HashRouter, Routes, Route, Outlet, Navigate } from "react-router-dom";
import { makeStyles } from '@fluentui/react-components';
//import { FluentProvider, teamsLightTheme } from '@fluentui/react-components';
import { FluentProvider, webLightTheme } from '@fluentui/react-components';

//const stackTokens: IStackTokens = { childrenGap: 20, padding: 20 };

const useStyles = makeStyles({
  commons: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    minWidth: 0,
    overflow: 'hidden'
  },
  onlet: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    flex: '1 1 auto',
    minWidth: 0,
    overflow: 'auto',
    flexShrink: 1,
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    width: '208px'
  }
});
function SettingsRoutes() {

  return (
    <HashRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <Routes>
        <Route element={<SettingsApp />}>
          <Route path="/profile" element={<SettingsProfile />}></Route>
          <Route path='/match' element={<SettingsMatch />}></Route>
          <Route index element={<Navigate to="/profile" />}></Route>
        </Route>
      </Routes>
    </HashRouter>
  );
}

function SettingsApp() {
  const styles = useStyles();
  return <>
    <div className={styles.commons}>
      <div className={styles.nav}>
        <SettingsNav />
      </div>
      <div className={styles.onlet}>
        <Outlet />
      </div>
    </div>
  </>
}



const AppRoot = ({ children }) => (
  <FluentProvider theme={webLightTheme}>
    {children}
  </FluentProvider>
);


const App = () => (
  <AppRoot>
    <SettingsRoutes />
  </AppRoot>
);

createRoot(document.getElementById('settings')).render(<App />);


