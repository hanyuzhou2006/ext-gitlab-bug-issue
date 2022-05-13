import React, { useEffect } from 'react';
import { getProfiles, ProjectProfile } from './util'
import { DetailsList, IColumn, SelectionMode } from '@fluentui/react/lib/DetailsList';
import { PrimaryButton } from '@fluentui/react/lib/Button';
import { useBoolean } from '@fluentui/react-hooks';
import { initializeIcons } from '@fluentui/react/lib/Icons';
import { NewProfileModal } from './settings-profile-modal';
import { Actions } from './settings-profile-actions';
initializeIcons(/* optional base url */);

export function SettingsProfile() {
  const [profiles, setProfiles] = React.useState([]);
  const [updated, setUpdated] = React.useState(Date.now());
  const [isNewProfileModalOpened, { setTrue: openNewProfileModal, setFalse: closeNewProfileModal }] = useBoolean(false);

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
      key: 'actions',
      name: 'Actions',
      minWidth: 100,
      onRender: (item: ProjectProfile) => {
        return <Actions item={item} setUpdated={setUpdated} />
      }
    }]
  }
  const columns = buildColumns();

  return (
    <>
      <NewProfileModal closeModal={closeNewProfileModal} setUpdated={setUpdated} isModalOpened={isNewProfileModalOpened} />
      <PrimaryButton styles={{
        root: {
          width: '200px',
        }
      }} onClick={() => openNewProfileModal()}>New Profile</PrimaryButton>
      <DetailsList selectionMode={SelectionMode.none} disableSelectionZone items={profiles} columns={columns} />
    </>
  );


}