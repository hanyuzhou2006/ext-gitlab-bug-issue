import React, { useEffect, useState, useRef } from "react";
import ReactDOM from "react-dom";
import '@cloudogu/react-img-editor/lib/index.css'
import { TextField } from '@fluentui/react/lib/TextField';
import { Stack, IStackTokens, IStackStyles } from '@fluentui/react/lib/Stack';
import { PrimaryButton } from '@fluentui/react/lib/Button';
import { getUserAgent, createIssueMarkDown, getSelectedProfile } from "./util";
import { newIssue, uploadImage } from "./apis";
import useNodeSize from "./useNodeSize";
import { createScreenshot, Editor } from "./content-screenshot-editor";
import { LabelProp } from "./gitlab-label";
import { initializeIcons } from '@fluentui/react/lib/Icons';
import { Labels } from "./content-labels";

initializeIcons(/* optional base url */);

const editorStyles: IStackStyles = {
  root: {
    width: '75%',
  }
}

const formStyles: IStackStyles = {
  root: {
    flexGrow: 1,
  }
}
const editorTokens: IStackTokens = {
  childrenGap: 20,
}
const formTokens: IStackTokens = {
  childrenGap: 20,
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
  const [labels, setLabels] = useState<LabelProp[]>([]);

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
      const markdown = createIssueMarkDown(userAgent, url, steps, image, actual, expected);
      const issue = await newIssue(projectAddress, privateToken, title, markdown, labels);
      location.href = issue.web_url;
    } catch (e) {
      alert(e.message);
    }

  }

  return (
    <Stack horizontal tokens={editorTokens} styles={{
      root: { height: '100%' },
    }}>
      <Stack styles={editorStyles} >
        <main ref={ref} style={{ height: '100%' }}>
          <Editor width={width} height={height} stageRef={stageRef} url={screenshotUrl} />
        </main>
      </Stack>
      <Stack tokens={formTokens} styles={formStyles}>
        <TextField label="原始地址" value={url} readOnly />

        <TextField label="GitLab 项目地址" value={projectAddress} onChange={(e, value) => {
          setProjectAddress(value);
        }} errorMessage={checkProjectAddressMessage()} />

        <TextField label="Gitlab private_token" value={privateToken} type="password" required
          onChange={(e, value) => {
            setPrivateToken(value);
          }} errorMessage={checkPrivateTokenMessage()} />

        <TextField label="标题" value={title} required onChange={(e, value) => {
          setTitle(value);
        }} errorMessage={checkTitleMessage()} />

        <TextField label="环境" value={userAgent} readOnly />

        <TextField label="重现步骤" multiline value={steps} required onChange={(e, value) => {
          setSteps(value);
        }} errorMessage={checkStepsMessage()} />

        <TextField label="实际结果" multiline value={actual} required onChange={(e, value) => {
          setActual(value);
        }} errorMessage={checkActualMessage()} />

        <TextField label="预期结果" multiline value={expected} required onChange={(e, value) => {
          setExpected(value);
        }} errorMessage={checkExpectedMessage()} />

        <Labels labels={optionalLabels} onChange={(_e, labels) => {
          setLabels(labels);
        }} />
        <PrimaryButton onClick={submit}>提交</PrimaryButton>
      </Stack>

    </Stack>

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


ReactDOM.render(<Content />, document.getElementById('content'));