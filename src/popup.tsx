import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import { createRoot } from  'react-dom/client';
//import { Stack, IStackTokens } from '@fluentui/react';
import { ChoiceGroup, IChoiceGroupOption } from '@fluentui/react/lib/ChoiceGroup';
import { getProfiles, getSelectedProfileName, setSelectedProfileName } from "./util";
import { Button, Radio, RadioGroup, makeStyles, Field } from '@fluentui/react-components';
import { FluentProvider, webLightTheme } from '@fluentui/react-components';

//import { initializeIcons } from '@fluentui/react/lib/Icons';
//initializeIcons(/* optional base url */);

//const stackTokens: IStackTokens = { childrenGap: 20 };

const useStyles = makeStyles({
  root: {
    minWidth: '300px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
  },
});

async function newIssue() {
  await chrome.runtime.sendMessage({ type: 'newIssue' });
}

async function setting() {
  await chrome.runtime.sendMessage({ type: 'setting' });
}

async function match() {
  await chrome.runtime.sendMessage({ type: 'match' });
}

async function getOptions() {
  const profiles = await getProfiles();
  const profileOptions = profiles.map(profile => {
    return {
      key: profile.profileName,
      text: profile.profileName
    }
  });
  return [{ key: '', text: '不使用任何配置' }]
    .concat(profileOptions)
    .concat({ key: 'auto', text: '智能匹配' });
}
function Popup() {
  const [options, setOptions] = React.useState<IChoiceGroupOption[]>([]);
  const [selectedKey, setSelectedKey] = React.useState('');
  const styles = useStyles();
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
  return (
    <div className={styles.root}>
      <div className={styles.content}>
        <Field>
          <RadioGroup value={selectedKey} onChange={(_, data) => {
            setSelectedKey(data.value);
            setSelectedProfileName(data.value);
          }}>
            {
              options.map(option => (
                <Radio key={option.key} label={option.text} value={option.key} />
              ))
            }
          </RadioGroup>
        </Field>
        {selectedKey === 'auto' && (
          <Button
            onClick={async () => {
              await match();
            }}
          >
            添加条件
          </Button>
        )}
      </div>
      <div className={styles.footer}>
        <Button
          appearance='primary'
          onClick={async () => {
            await newIssue();
          }}
        >
          创建 Issue
        </Button>
        <Button
          onClick={async () => {
            await setting();
          }}
        >
          设置配置
        </Button>
      </div>
    </div>
  );

  {/* // return (<Stack tokens={stackTokens} styles={{ */ }
  //   root: {
  //     minWidth: '300px',
  //   }
  // }}>
  //   <Stack>
  //     <RadioGroup options={options} selectedKey={selectedKey} onChange={onChangeKey} label="选择一个配置" />
  //     {
  //       selectedKey === 'auto' ? <Button onClick={async () => {
  //         await match();
  //       }}>添加条件</Button> : <></>

  //     }

  //   </Stack>
  //   <Stack horizontal horizontalAlign="space-between">
  //     <Button appearance='primary' onClick={async () => {
  //       await newIssue();
  //     }}>创建 Issue</Button>
  //     <Button onClick={async () => {
  //       await setting();
  //     }}>设置配置</Button>
  //   </Stack>
  // </Stack>
  // );
}
const AppRoot = ({children}) => (
  <FluentProvider theme={webLightTheme}>
    {children}
  </FluentProvider>
);

const App = () => (
  <AppRoot>
    <Popup />
  </AppRoot>
);

createRoot(document.getElementById('popup')).render(<App />);



