import React, { useEffect, useState, useRef } from "react";
import { createRoot } from  'react-dom/client';
import ReactDOM from "react-dom";
import '@sansitech/react-img-editor/lib/index.css'
import { getUserAgent, createIssueMarkDown, getSelectedProfile, extractVersion } from "./util";
import { newIssue, uploadImage } from "./apis";
import useNodeSize from "./useNodeSize";
import { createScreenshot, Editor } from "./content-screenshot-editor";
import { LabelProp } from "./gitlab-label";
import { Labels } from "./content-labels";
import { FluentProvider, webLightTheme } from '@fluentui/react-components';

import { Input, Field, makeStyles, Button, Textarea } from '@fluentui/react-components';


const useStyles = makeStyles({
  root: {
    display: 'flex',
    height: '100%',
    gap: '20px',
  },
  editor: {
    width: '75%',
  },
  form: {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  editoken: {
    gap: '20px',
  },
  formtoken: {
    gap: '20px',
  }
});

async function getVersion(url: string, versionPath: string, extractionMode?: 'text' | 'json' | 'regex', extractionRule?: string) {
  const origin = new URL(url).origin;
  // Remove leading slash from versionPath to avoid double slashes
  const cleanVersionPath = versionPath.startsWith('/') ? versionPath.substring(1) : versionPath;
  const versionUrl = `${origin}/${cleanVersionPath}`;
  return fetch(versionUrl).then(res => {
    if (res.status >= 200 && res.status < 400) {
      return res.text().then(text => {
        return extractVersion(text, extractionMode, extractionRule);
      });
    }
    return '';
  });
}

function Content() {
  const [screenshotUrl, setScreenshotUrl] = useState('');

  const stageRef = useRef<unknown>(null);
  const screenshot = createScreenshot(stageRef);
  const [projectAddress, setProjectAddress] = useState('');
  const [privateToken, setPrivateToken] = useState('');
  const [title, setTitle] = useState('');
  const [actual, setActual] = useState('');
  const [expected, setExpected] = useState('');
  const userAgent = getUserAgent();
  const [url, setUrl] = useState('');
  const [steps, setSteps] = useState('');
  const [checked, setChecked] = useState(false);
  const [optionalLabels, setOptionalLabels] = useState<LabelProp[]>([]);
  const [labels, setLabels] = useState<string[]>([]);
  const [version, setVersion] = useState('');
  const styles = useStyles();

  const { ref, width, height } = useNodeSize();

  useEffect(() => {
    chrome.runtime.sendMessage({ type: 'getScreenshotUrl' }, (response) => {
      if (response.screenshotUrl) {
        setScreenshotUrl(response.screenshotUrl);
      }
    });
  }, []);

  useEffect(() => {
    chrome.runtime.sendMessage({ type: 'getUrl' }, (response) => {
      if (response.url) {
        setUrl(response.url);
      }
    });
  }, []);

  // get selected projectAddress and privateToken
  // and optional labels
  useEffect(() => {
    if (url) {
      getSelectedProfile(url).then((profile) => {
        if (profile) {
          setProjectAddress(profile.projectAddress);
          setPrivateToken(profile.privateToken);
          setOptionalLabels(profile.labels);
          if (profile.versionPath) {
            getVersion(url, profile.versionPath, profile.versionExtractionMode, profile.versionExtractionRule).then((version) => {
              setVersion(version.trim());
            });
          }
        }
      })
    }
  }, [url]);


  function isValueValid() {
    return title && actual && expected && steps && url && screenshotUrl;
  }

  async function submit() {
    setChecked(true);
    if (!isValueValid()) return;
    try {
      const file = await screenshot.toBlob();
      const image = await uploadImage(projectAddress, privateToken, file);
      const markdown = createIssueMarkDown(userAgent, url, steps, image, actual, expected, version);
      const issue = await newIssue(projectAddress, privateToken, title, markdown, labels);
      location.href = issue.web_url;
    } catch (e) {
      alert(e.message);
    }

  }

  return(
    <div className={styles.root}>
      <div className={styles.editor}>
        <main ref={ref} style={{ height: '100%' }}>
          <Editor width={width} height={height} stageRef={stageRef} url={screenshotUrl} />
        </main>
      </div>
      <div className={styles.form}>
        <Field label="原始地址">
          <Input value={url} readOnly />
        </Field>
        <Field label="版本">
          <Input value={version} onChange={(e, data) => {
            setVersion(data.value);
          }} />
        </Field>
        <Field label="GitLab 项目地址" validationMessage={checkProjectAddressMessage()}>
          <Input value={projectAddress} onChange={(e, data) => {
            setProjectAddress(data.value);
          }} />
        </Field>
        <Field label="Gitlab private_token" validationMessage={checkPrivateTokenMessage()}>
          <Input value={privateToken} type="password" required onChange={(e, data) => { setPrivateToken(data.value); }} />
        </Field>
        <Field label="标题" validationMessage={checkTitleMessage()}>
          <Input value={title} onChange={(e, data) => {
            setTitle(data.value);
          }} 
          />
        </Field>
        <Field label="环境">
          <Input value={userAgent} readOnly/>
        </Field>
        <Field label="重现步骤" validationMessage={checkActualMessage()}>
          <Textarea value={steps} required onChange={(e, data) => {
            setSteps(data.value);
            }} />
        </Field>
        <Field label="实际结果" validationMessage={checkActualMessage()}>
          <Textarea value={actual} required onChange={(e, data) => {
            setActual(data.value);
            }} />
        </Field>
        <Field label="预期结果" validationMessage={checkExpectedMessage()}>
          <Textarea value={expected} required onChange={(e, data) => {
            setExpected(data.value);
          }} />
        </Field>
        <Labels labels={optionalLabels} onChange={(e, labels) => {
          setLabels(labels);
        }} />
        <Button appearance="primary" onClick={submit}>提交</Button>
      </div>
    </div>
  )

  function checkProjectAddressMessage(): string | JSX.Element {
    return checked && !projectAddress && '请输入 GitLab 项目地址';
  }

  function checkTitleMessage(): string | JSX.Element {
    return checked && !title && '请输入标题';
  }

  function checkStepsMessage(): string | JSX.Element {
    return checked && !steps && '请输入重现步骤';
  }

  function checkActualMessage(): string | JSX.Element {
    return checked && !actual && '请输入实际结果';
  }

  function checkExpectedMessage(): string | JSX.Element {
    return checked && !expected && '请输入期望结果';
  }

  function checkPrivateTokenMessage(): string | JSX.Element {
    return checked && !privateToken && '请输入 private_token';
  }
}

const AppRoot = ({children}) => (
  <FluentProvider theme={webLightTheme}>
    {children}
  </FluentProvider>
);


const App = () => (
  <AppRoot>
    <Content />
  </AppRoot>
);

createRoot(document.getElementById('content')).render(<App />);