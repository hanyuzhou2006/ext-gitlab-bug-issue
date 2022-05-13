import React, { useRef } from 'react';
import { Modal, Stack, TextField, IStackTokens, DefaultButton, PrimaryButton } from '@fluentui/react';
import { newProjectProfile } from './util';

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
      }/>

      <Stack horizontal horizontalAlign='end' tokens={{
        childrenGap: 40
      }}>
        <DefaultButton onClick={closeModal}>Cancel</DefaultButton>
        <PrimaryButton onClick={submit}>Update</PrimaryButton>
      </Stack>
    </Stack>
  </Modal>
}