import React, { useEffect, useState, MutableRefObject, useRef } from "react";
import ReactDOM from "react-dom";
import ReactImgEditor from '@cloudogu/react-img-editor'
import '@cloudogu/react-img-editor/lib/index.css'
import { TextField } from '@fluentui/react/lib/TextField';
import { Stack, IStackTokens, IStackStyles } from '@fluentui/react/lib/Stack';
import { PrimaryButton } from '@fluentui/react/lib/Button';
import { getUserAgent, createIssueMarkDown, getSelectedProfile } from "./util";
import { newIssue, uploadImage } from "./apis";
import useNodeSize from "./useNodeSize";

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

function Editor({ width, height, stageRef, url }) {
  const setStage = (stage: unknown) => {
    stageRef.current = stage;
  };
  return <ReactImgEditor width={width} height={height} getStage={setStage} src={url} />
}




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