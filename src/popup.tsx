import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import { Stack, IStackTokens } from '@fluentui/react';
import { DefaultButton, PrimaryButton } from '@fluentui/react/lib/Button';
import { ChoiceGroup, IChoiceGroupOption } from '@fluentui/react/lib/ChoiceGroup';
import { getProfiles, getSelectedProfileName, setSelectedProfileName } from "./util";

import { initializeIcons } from '@fluentui/react/lib/Icons';
initializeIcons(/* optional base url */);

const stackTokens: IStackTokens = { childrenGap: 20 };

async function newIssue() {
  await chrome.runtime.sendMessage({ type: 'newIssue' });
}

async function setting() {
  chrome.runtime.sendMessage({ type: 'setting' });
}

async function getOptions() {
  const profiles = await getProfiles();
  const profileOptions = profiles.map(profile => {
    return {
      key: profile.profileName,
      text: profile.profileName
    }
  });
  return [{ key: '', text: '不使用任何规则' }]
    .concat(profileOptions)
    .concat({ key: 'auto', text: '自动匹配' });
}
function Popup() {
  const [options, setOptions] = React.useState<IChoiceGroupOption[]>([]);
  const [selectedKey, setSelectedKey] = React.useState('');
  useEffect(() => {
    getOptions().then(setOptions);
  }, [])
  useEffect(() => {
    getSelectedProfileName().then((profileName) => {
      setSelectedKey(profileName);
    });
  }, []);
  function onChangeKey(_e, option: IChoiceGroupOption) {
    setSelectedKey(option.key as string);
    setSelectedProfileName(option.key as string);
  }
  return (<Stack tokens={stackTokens} styles={{
    root: {
      minWidth: '300px',
    }
  }}>
    <ChoiceGroup options={options} selectedKey={selectedKey} onChange={onChangeKey} label="选择一个规则" />
    <PrimaryButton onClick={async () => {
      await newIssue();
    }}>创建 Issue</PrimaryButton>

    <DefaultButton onClick={async () => {
      await setting();
    }}>设置规则</DefaultButton>

  </Stack>
  );
}

ReactDOM.render(<Popup />, document.getElementById('popup'));



