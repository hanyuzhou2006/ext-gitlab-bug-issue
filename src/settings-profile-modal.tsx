import React, { useEffect, useRef } from 'react';
import { Modal, Stack, TextField, IStackTokens, DefaultButton, PrimaryButton, Dropdown, IDropdownOption } from '@fluentui/react';
import { newProjectProfile } from './util';
import { listLabels } from './apis';
import { GitlabLabel, LabelProp } from './gitlab-label';

const stackTokens: IStackTokens = { childrenGap: 20, padding: 20 };

export function NewProfileModal(props) {
  const { isModalOpened, closeModal, setUpdated } = props;
  const [profileName, setProfileName] = React.useState('');
  const [projectAddress, setProjectAddress] = React.useState('');
  const [privateToken, setPrivateToken] = React.useState('');

  async function newProfile() {
    try {
      await newProjectProfile({
        profileName,
        projectAddress,
        privateToken
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
  async function submit() {
    const projectAddress = projectAddressRef.current.value;
    const privateToken = privateTokenRef.current.value;
    await newProjectProfile({
      profileName: item.profileName,
      projectAddress,
      privateToken
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
    return <>
      {options.map(option => {
        const label = option.data as LabelProp;
        return <GitlabLabel key={label.name} name={label.name} color={label.color} textColor={label.textColor} />
      })}
    </>;
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