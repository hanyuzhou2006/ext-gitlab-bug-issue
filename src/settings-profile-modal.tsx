import React, { useEffect, useRef } from 'react';
import { Modal, Stack, TextField, IStackTokens, DefaultButton, PrimaryButton, Dropdown, IDropdownOption } from '@fluentui/react';
import { newProjectProfile } from './util';
import { listLabels } from './apis';
import { GitlabLabel, GitlabLabels, LabelProp } from './gitlab-label';

const stackTokens: IStackTokens = { childrenGap: 20, padding: 20 };

const extractionModeOptions: IDropdownOption[] = [
  { key: 'text', text: '全文本' },
  { key: 'json', text: 'JSON' },
  { key: 'regex', text: '正则表达式' },
];

export function NewProfileModal(props) {
  const { isModalOpened, closeModal, setUpdated } = props;
  const [profileName, setProfileName] = React.useState('');
  const [projectAddress, setProjectAddress] = React.useState('');
  const [privateToken, setPrivateToken] = React.useState('');
  const [versionPath, setVersionPath] = React.useState('');
  const [versionExtractionMode, setVersionExtractionMode] = React.useState<'text' | 'json' | 'regex'>('text');
  const [versionExtractionRule, setVersionExtractionRule] = React.useState('');
  async function newProfile() {
    try {
      await newProjectProfile({
        profileName,
        projectAddress,
        privateToken,
        versionPath,
        versionExtractionMode,
        versionExtractionRule,
      });
    } catch (err) {
      alert(err.message);
    }

    closeModal();
    setUpdated(Date.now());
  };


  return <Modal isOpen={isModalOpened} onDismiss={closeModal} isBlocking={false}>
    <Stack tokens={stackTokens} styles={{
      root: {
        width: '600px',
      }
    }}>
      <TextField label="名称" value={profileName} required onChange={(e, value) => {
        setProfileName(value);
      }} />
      <TextField label="GitLab 地址" value={projectAddress} required onChange={(e, value) => {
        setProjectAddress(value);
      }} />
      <TextField label="Gitlab private_token" value={privateToken} required onChange={(e, value) => {
        setPrivateToken(value);
      }} />
      <TextField label="版本路径" value={versionPath} onChange={(e, value) => {
        setVersionPath(value);
      }} />
      <Dropdown label="版本解析模式" selectedKey={versionExtractionMode} options={extractionModeOptions} 
        onChange={(e, option) => {
          setVersionExtractionMode(option.key as 'text' | 'json' | 'regex');
        }} />
      <TextField label="版本解析规则" value={versionExtractionRule} 
        placeholder={versionExtractionMode === 'json' ? '例如: version 或 data.version' : versionExtractionMode === 'regex' ? '例如: version: (.+)' : ''}
        onChange={(e, value) => {
          setVersionExtractionRule(value);
        }} 
        description={versionExtractionMode === 'json' ? 'JSON路径，如 version 或 data.version' : versionExtractionMode === 'regex' ? '正则表达式，第一个捕获组或完整匹配' : '全文本模式不需要解析规则'}
        disabled={versionExtractionMode === 'text'}
      />
      <Stack horizontal horizontalAlign='end' tokens={{
        childrenGap: 40
      }}>
        <DefaultButton onClick={closeModal}>Cancel</DefaultButton>
        <PrimaryButton onClick={newProfile}>New</PrimaryButton>
      </Stack>
    </Stack>
  </Modal>
}

export function EditProfileMoal(props) {
  const { isModalOpened, closeModal, setUpdated, item } = props;
  const projectAddressRef = useRef(null);
  const privateTokenRef = useRef(null);
  const versionPathRef = useRef(null);
  const [versionExtractionMode, setVersionExtractionMode] = React.useState<'text' | 'json' | 'regex'>('text');
  const [versionExtractionRule, setVersionExtractionRule] = React.useState('');

  useEffect(() => {
    if (item) {
      setVersionExtractionMode(item.versionExtractionMode || 'text');
      setVersionExtractionRule(item.versionExtractionRule || '');
    }
  }, [item]);

  async function submit() {
    const projectAddress = projectAddressRef.current.value;
    const privateToken = privateTokenRef.current.value;
    const versionPath = versionPathRef.current.value;
    await newProjectProfile({
      profileName: item.profileName,
      projectAddress,
      privateToken,
      versionPath,
      versionExtractionMode,
      versionExtractionRule,
    });
    closeModal();
    setUpdated(Date.now());
  }

  return <Modal isOpen={isModalOpened} onDismiss={closeModal} isBlocking={false}>
    <Stack tokens={stackTokens} styles={{
      root: {
        width: '600px',
      }
    }}>
      <TextField label="名称" value={item.profileName} readOnly />
      <TextField label="GitLab 地址" defaultValue={item.projectAddress} required componentRef={
        projectAddressRef
      } />
      <TextField label="Gitlab private_token" defaultValue={item.privateToken} required componentRef={
        privateTokenRef
      } />
      <TextField label="版本路径" defaultValue={item.versionPath} componentRef={
        versionPathRef
      } />
      <Dropdown label="版本解析模式" selectedKey={versionExtractionMode} options={extractionModeOptions} 
        onChange={(e, option) => {
          setVersionExtractionMode(option.key as 'text' | 'json' | 'regex');
        }} />
      <TextField label="版本解析规则" value={versionExtractionRule} 
        placeholder={versionExtractionMode === 'json' ? '例如: version 或 data.version' : versionExtractionMode === 'regex' ? '例如: version: (.+)' : ''}
        onChange={(e, value) => {
          setVersionExtractionRule(value);
        }} 
        description={versionExtractionMode === 'json' ? 'JSON路径，如 version 或 data.version' : versionExtractionMode === 'regex' ? '正则表达式，第一个捕获组或完整匹配' : '全文本模式不需要解析规则'}
        disabled={versionExtractionMode === 'text'}
      />
      <Stack horizontal horizontalAlign='end' tokens={{
        childrenGap: 40
      }}>
        <DefaultButton onClick={closeModal}>Cancel</DefaultButton>
        <PrimaryButton onClick={submit}>Update</PrimaryButton>
      </Stack>
    </Stack>
  </Modal>
}

export function EditLabelsModal(props) {
  const { isModalOpened, closeModal, setUpdated, item } = props;
  const [selectedKeys, setSelectedKeys] = React.useState<string[]>([]);
  const [labels, setLabels] = React.useState<LabelProp[]>([]);
  const options = labels.map(label => {
    return {
      key: label.name,
      text: label.name,
      data: label
    }
  });
  useEffect(() => {
    if (item && item.labels) {
      const keys = item.labels?.map(label => label.name);
      setSelectedKeys(keys);
    } else {
      setSelectedKeys([]);
    }
  }, [item]);

  useEffect(() => {
    if (item && item.projectAddress && item.privateToken) {
      listLabels(item.projectAddress, item.privateToken).then(labels => {
        setLabels(labels);
      });
    } else {
      setLabels([]);
    }
  }, [item]);

  async function submit() {
    const selectedLabels = selectedKeys.map(key => {
      const label = labels.find(label => label.name === key);
      return label;
    });
    await newProjectProfile({
      profileName: item.profileName,
      projectAddress: item.projectAddress,
      privateToken: item.privateToken,
      labels: selectedLabels,
      versionPath: item.versionPath,
      versionExtractionMode: item.versionExtractionMode,
      versionExtractionRule: item.versionExtractionRule,
    });
    closeModal();
    setUpdated(Date.now());
  }

  function onChange(event: React.FormEvent<HTMLDivElement>, item: IDropdownOption) {
    if (item) {
      setSelectedKeys(
        item.selected ? [...selectedKeys, item.key as string] : selectedKeys.filter(key => key !== item.key),
      );
    }
  };

  function onRenderOption(option: IDropdownOption): JSX.Element {
    const label = option.data as LabelProp;
    return <GitlabLabel name={label.name} color={label.color} textColor={label.textColor} />
  }

  function onRenderTitle(options: IDropdownOption[]) {
    const labels = options.map(option => {
      return option.data;
    });
    return <GitlabLabels labels={labels} />;
  }

  return <Modal isOpen={isModalOpened} onDismiss={closeModal} isBlocking={false}>
    <Stack tokens={stackTokens} styles={{
      root: {
        width: '600px',
      }
    }}>
      <TextField label="名称" value={item?.profileName} readOnly />
      <Dropdown label="预置标签" options={options} multiSelect selectedKeys={selectedKeys} onChange={onChange}
        onRenderOption={onRenderOption} onRenderTitle={onRenderTitle}
      />
      <Stack horizontal horizontalAlign='end' tokens={{
        childrenGap: 40
      }}>
        <DefaultButton onClick={closeModal}>Cancel</DefaultButton>
        <PrimaryButton onClick={submit}>Update</PrimaryButton>
      </Stack>
    </Stack>
  </Modal>

}