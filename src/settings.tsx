import React, { PropsWithChildren } from 'react';
import ReactDOM from 'react-dom';
import { Stack, IStackTokens } from '@fluentui/react';
import { SettingsNav } from './settings-nav';
import { SettingsProfile } from './settings-profile';
import { SettingsMatch } from './settings-match';
import { HashRouter, Routes, Route, Outlet } from "react-router-dom";

const stackTokens: IStackTokens = { childrenGap: 20, padding: 20 };

function SettingsRoutes() {

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<SettingsApp />}>
          <Route index element={<SettingsProfile />}></Route>
          <Route path='match' element={<SettingsMatch />}></Route>
        </Route>
      </Routes>
    </HashRouter>
  );
}

function SettingsApp() {
  return <>
    <Stack horizontal tokens={{
      childrenGap: 20
    }}>
      <Stack>
        <SettingsNav />
      </Stack>
      <Stack styles={{
        root: {
          flexGrow: 1,
        }
      }}>
        <Outlet />
      </Stack>
    </Stack>
  </>
}

ReactDOM.render(<SettingsRoutes />, document.getElementById('settings'));

