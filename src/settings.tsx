import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { getProfiles, newProjectProfile, delProjectProfile, ProjectProfile } from './util'
import { DetailsList, IColumn, DetailsListLayoutMode, SelectionMode } from '@fluentui/react/lib/DetailsList';
import { PrimaryButton, DefaultButton, IconButton } from '@fluentui/react/lib/Button';
import { Stack, IStackTokens } from '@fluentui/react';
import { TextField } from '@fluentui/react/lib/TextField';
import { useBoolean } from '@fluentui/react-hooks';

import { initializeIcons } from '@fluentui/react/lib/Icons';

import { Modal } from '@fluentui/react';
initializeIcons(/* optional base url */);

const stackTokens: IStackTokens = { childrenGap: 20, padding: 20 };


function Settings() {
  const [profiles, setProfiles] = React.useState([]);
  const [profileName, setProfileName] = React.useState('');
  const [projectAddress, setProjectAddress] = React.useState('');
  const [privateToken, setPrivateToken] = React.useState('');
  const [updated, setUpdated] = React.useState(Date.now());
  const [isModalOpened, { toggle: toggleOpenModal, setTrue: openModal, setFalse: closeModal }] = useBoolean(false);

  useEffect(() => {
    getProfiles().then(setProfiles);
  }, [updated])

  function buildColumns(): IColumn[] {
    return [{
      key: 'profileName',
      name: 'Profile Name',
      fieldName: 'profileName',
      minWidth: 100,
      maxWidth: 300,
      onRender: (item: ProjectProfile) => {
        return <span>{item.profileName}</span>;
      }
    }, {
      key: 'projectAddress',
      name: 'Project Address',
      fieldName: 'projectAddress',
      minWidth: 100,
      onRender: (item: ProjectProfile) => {
        return <span>{item.projectAddress}</span>;
      }
    }, {
      key: 'privateToken',
      name: 'Private Token',
      fieldName: 'privateToken',
      minWidth: 400,
      onRender: (item: ProjectProfile) => {
        return <span>{item.privateToken.substring(0, 6) + '...'}</span>
      }
    }, {
      key: 'delete',
      name: 'Delete',
      minWidth: 100,
      onRender: (item: ProjectProfile) => {
        return <IconButton styles={{
          root: {
            maxHeight: '16px',
          }
        }} iconProps={{
          iconName: 'Delete',
          styles: {
            root: {
              color: 'red',
            }
          }
        }} onClick={async () => {
          await delProjectProfile(item.profileName);
          setUpdated(Date.now());
        }} />
      }
    }]
  }
  const columns = buildColumns();


  function newProfileModal(profile?: ProjectProfile) {
    if (profile) {
      setProfileName(profile.profileName);
      setProjectAddress(profile.projectAddress);
      setPrivateToken(profile.privateToken);
    }
    openModal();
  }

  return (
    <>
      <Modal isOpen={isModalOpened} onDismiss={closeModal} isBlocking={false}>
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
            <PrimaryButton onClick={async () => {
              await newProjectProfile({
                profileName,
                projectAddress,
                privateToken
              })
              closeModal();
              setUpdated(Date.now());
            }}>New</PrimaryButton>
          </Stack>
        </Stack>
      </Modal>
      <PrimaryButton onClick={() => newProfileModal()}>New Profile</PrimaryButton>
      <DetailsList selectionMode={SelectionMode.none} disableSelectionZone  items={profiles} columns={columns} />
    </>
  );
}


ReactDOM.render(<Settings />, document.getElementById('settings'));

