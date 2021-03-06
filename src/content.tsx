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
  const [labels, setLabels] = useState<string[]>([]);

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
        <TextField label="????????????" value={url} readOnly />

        <TextField label="GitLab ????????????" value={projectAddress} onChange={(e, value) => {
          setProjectAddress(value);
        }} errorMessage={checkProjectAddressMessage()} />

        <TextField label="Gitlab private_token" value={privateToken} type="password" required
          onChange={(e, value) => {
            setPrivateToken(value);
          }} errorMessage={checkPrivateTokenMessage()} />

        <TextField label="??????" value={title} required onChange={(e, value) => {
          setTitle(value);
        }} errorMessage={checkTitleMessage()} />

        <TextField label="??????" value={userAgent} readOnly />

        <TextField label="????????????" multiline value={steps} required onChange={(e, value) => {
          setSteps(value);
        }} errorMessage={checkStepsMessage()} />

        <TextField label="????????????" multiline value={actual} required onChange={(e, value) => {
          setActual(value);
        }} errorMessage={checkActualMessage()} />

        <TextField label="????????????" multiline value={expected} required onChange={(e, value) => {
          setExpected(value);
        }} errorMessage={checkExpectedMessage()} />

        <Labels labels={optionalLabels} onChange={(_e, labels) => {
          setLabels(labels);
        }} />
        <PrimaryButton onClick={submit}>??????</PrimaryButton>
      </Stack>

    </Stack>

  )

  function checkProjectAddressMessage(): string | JSX.Element {
    return checked && !projectAddress && '????????? GitLab ????????????';
  }

  function checkTitleMessage(): string | JSX.Element {
    return checked && !title && '???????????????';
  }

  function checkStepsMessage(): string | JSX.Element {
    return checked && !steps && '?????????????????????';
  }

  function checkActualMessage(): string | JSX.Element {
    return checked && !actual && '?????????????????????';
  }

  function checkExpectedMessage(): string | JSX.Element {
    return checked && !expected && '?????????????????????';
  }

  function checkPrivateTokenMessage(): string | JSX.Element {
    return checked && !privateToken && '????????? private_token';
  }
}


ReactDOM.render(<Content />, document.getElementById('content'));