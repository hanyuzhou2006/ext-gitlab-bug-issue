import React, { useEffect, useState, MutableRefObject, useRef } from "react";
import ReactDOM from "react-dom";
import ReactImgEditor from '@cloudogu/react-img-editor'
import '@cloudogu/react-img-editor/lib/index.css'
import { TextField } from '@fluentui/react/lib/TextField';
import { Stack } from '@fluentui/react/lib/Stack';
import { PrimaryButton } from '@fluentui/react/lib/Button';
import { getUserAgent, createIssueMarkDown, getSelectedProfile } from "./util";
import { newIssue, uploadImage } from "./apis";

const createScreenshot = (stageRef: MutableRefObject<any>): { toBlob: () => Promise<Blob | null> } => ({
  toBlob: () => {
    const canvas = stageRef.current.clearAndToCanvas({
      pixelRatio: stageRef.current._pixelRatio,
    }) as HTMLCanvasElement;
    return new Promise<Blob | null>((resolve) => {
      canvas.toBlob((blob) => resolve(blob));
    });
  },
});

function Editor({ stageRef, url }) {
  const setStage = (stage: unknown) => {
    stageRef.current = stage;
  };
  return <ReactImgEditor getStage={setStage} src={url} />
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
  useEffect(() => {
    getSelectedProfile().then((profile) => {
      console.log(`profile: ${JSON.stringify(profile)}`);
      if (profile) {
        setProjectAddress(profile.projectAddress);
        setPrivateToken(profile.privateToken);
      }
    })
  }, []);

  function isValueValid() {
    return title && actual && expected && steps && url && screenshotUrl;
  }

  async function submit() {
    print();
    setChecked(true);
    if (!isValueValid()) return;
    try {
      const file = await screenshot.toBlob();
      const image = await uploadImage(projectAddress, privateToken, file);
      const markdown = createIssueMarkDown(userAgent, url, steps, image, actual, expected);
      const issue = await newIssue(projectAddress, privateToken, title, markdown);
      location.href = issue.web_url;
    } catch (e) {
      alert(e.message);
    }

  }
  function print() {
    console.log(`url: ${url}`);
    console.log(`screenshotUrl: ${screenshotUrl}`);
    console.log(`projectAddress: ${projectAddress}`);
    console.log(`privateToken: ${privateToken}`);
    console.log(`title: ${title}`);
    console.log(`userAgent: ${userAgent}`);
    console.log(`steps: ${steps}`);
    console.log(`actual: ${actual}`);
    console.log(`expected: ${expected}`);  
  }



  return (
    <Stack>
      <Editor stageRef={stageRef} url={screenshotUrl} />
      <Stack>
        <TextField label="原始地址" value={url} readOnly />

        <TextField label="GitLab 项目地址" value={projectAddress} onChange={(e, value) => {
          setProjectAddress(value);
        }} errorMessage={checked && !projectAddress && '请输入 GitLab 项目地址'} />

        <TextField label="Gitlab private_token" value={privateToken} type="password" required
          onChange={(e, value) => {
            setPrivateToken(value);
          }} errorMessage={checked && !privateToken && '请输入 private_token'} />

        <TextField label="标题" value={title} required onChange={(e, value) => {
          setTitle(value);
        }} errorMessage={checked && !title && '请输入标题'} />

        <TextField label="环境" value={userAgent} readOnly />

        <TextField label="重现步骤" multiline value={steps} required onChange={(e, value) => {
          setSteps(value);
        }} errorMessage={checked && !steps && '请输入重现步骤'} />

        <TextField label="实际结果" multiline value={actual} required onChange={(e, value) => {
          setActual(value);
        }} errorMessage={checked && !actual && '请输入实际结果'} />

        <TextField label="预期结果" multiline value={expected} required onChange={(e, value) => {
          setExpected(value);
        }} errorMessage={checked && !expected && '请输入期望结果'} />

      </Stack>
      <PrimaryButton onClick={submit}>提交</PrimaryButton>
    </Stack>

  )
}

ReactDOM.render(<Content />, document.getElementById('content'));