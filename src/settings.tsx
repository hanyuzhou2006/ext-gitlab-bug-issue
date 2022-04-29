import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { getProfiles, newProjectProfile, delProjectProfile, ProjectProfile } from './util'
import { DetailsList, IColumn, DetailsListLayoutMode } from '@fluentui/react/lib/DetailsList';
import { PrimaryButton } from '@fluentui/react/lib/Button';
import { Stack, IStackTokens } from '@fluentui/react';
import { TextField } from '@fluentui/react/lib/TextField';

import { initializeIcons } from '@fluentui/react/lib/Icons';
initializeIcons(/* optional base url */);

const stackTokens: IStackTokens = { childrenGap: 20 };


function Settings() {
  const [profiles, setProfiles] = React.useState([]);
  const [profileName, setProfileName] = React.useState('');
  const [projectAddress, setProjectAddress] = React.useState('');
  const [privateToken, setPrivateToken] = React.useState('');
  const [updated, setUpdated] = React.useState(Date.now());
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
    }, {
      key: 'projectAddress',
      name: 'Project Address',
      fieldName: 'projectAddress',
      minWidth: 100,
    }, {
      key: 'privateToken',
      name: 'Private Token',
      fieldName: 'privateToken',
      minWidth: 100,
    }, {
      key: 'delete',
      name: 'Delete',
      minWidth: 100,
      onRender(item: ProjectProfile) {
        return <PrimaryButton onClick={async () => {
          await delProjectProfile(item.profileName);
          setUpdated(Date.now());
        }}>Delete</PrimaryButton>
      }
    }]
  }
  const columns = buildColumns();
  return (
    <Stack tokens={stackTokens}>
      <TextField label="名称" value={profileName} required onChange={(e, value) => {
        setProfileName(value);
      }} />
      <TextField label="GitLab 地址" value={projectAddress} required onChange={(e, value) => {
        setProjectAddress(value);
      }} />
      <TextField label="Gitlab private_token" value={privateToken} required onChange={(e, value) => {
        setPrivateToken(value);
      }} />
      <PrimaryButton onClick={async () => {
        await newProjectProfile({
          profileName,
          projectAddress,
          privateToken
        })
        setUpdated(Date.now());
      }}>New Profile</PrimaryButton>
      <DetailsList disableSelectionZone layoutMode={DetailsListLayoutMode.justified} items={profiles} columns={columns} />
    </Stack>
  );
}


ReactDOM.render(<Settings />, document.getElementById('settings'));

