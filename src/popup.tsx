import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import { Stack, IStackTokens } from '@fluentui/react';
import { DefaultButton, PrimaryButton } from '@fluentui/react/lib/Button';
import { Dropdown, IDropdownOption } from '@fluentui/react/lib/Dropdown';
import { getProfiles, getSelectedProfileName, setSelectedProfileName } from "./util";

import { initializeIcons } from '@fluentui/react/lib/Icons';
initializeIcons(/* optional base url */);

const stackTokens: IStackTokens = { childrenGap: 40 };

async function newIssue() {
  await chrome.runtime.sendMessage({ type: 'newIssue' });
}

async function setting() {
  chrome.runtime.sendMessage({ type: 'setting' });
}

function Popup() {
  const [options, setOptions] = React.useState<IDropdownOption[]>([]);
  const [selectedKey, setSelectedKey] = React.useState('');
  useEffect(() => {
    getProfiles().then((profiles) => {
      setOptions(profiles.map((profile) => {
        return { key: profile.profileName, text: profile.profileName };
      }));
    });
  }, [])
  useEffect(() => {
    getSelectedProfileName().then((profileName) => {
      setSelectedKey(profileName);
    });
  }, []);
  return (<Stack tokens={stackTokens}>
    <Dropdown
      placeholder="Select an profile"
      options={options}
      selectedKey={selectedKey}
      onChange={(e, option) => {
        setSelectedKey(option.key as string);
        setSelectedProfileName(option.key as string);
      }
      }
    />
    <PrimaryButton onClick={async () => {
      await newIssue();
    }}>NewBugIssue</PrimaryButton>

    <DefaultButton onClick={async () => {
      await setting();
    }}>Settings</DefaultButton>

  </Stack>
  );
}

ReactDOM.render(<Popup />, document.getElementById('popup'));



