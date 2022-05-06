import React from 'react';
import ReactDOM from 'react-dom';
import { Stack, IStackTokens } from '@fluentui/react';
import { SettingsNav } from './settings-nav';
import { SettingsProfile } from './settings-profile';
import { SettingsMatch } from './settings-match';

const stackTokens: IStackTokens = { childrenGap: 20, padding: 20 };

function Settings() {

  return (
    <>
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
        <SettingsProfile />
        <SettingsMatch />
        </Stack>
      </Stack>
    </>
  );
}


ReactDOM.render(<Settings />, document.getElementById('settings'));

