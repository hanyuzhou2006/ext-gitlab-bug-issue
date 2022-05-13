import React, { useEffect, useState } from 'react';
import { getProfiles, ProjectProfile } from './util'
import { DetailsList, IColumn, SelectionMode } from '@fluentui/react/lib/DetailsList';
import { PrimaryButton } from '@fluentui/react/lib/Button';
import { useBoolean } from '@fluentui/react-hooks';
import { initializeIcons } from '@fluentui/react/lib/Icons';
import { EditProfileMoal, NewProfileModal } from './settings-profile-modal';
import { Actions } from './settings-profile-actions';
initializeIcons(/* optional base url */);

export function SettingsProfile() {
  const [profiles, setProfiles] = useState([]);
  const [updated, setUpdated] = useState(Date.now());
  const [isNewProfileModalOpened, { setTrue: openNewProfileModal, setFalse: closeNewProfileModal }] = useBoolean(false);
  const [editItem, setEditItem] = useState({} as ProjectProfile);
  const [isEditProfileModalOpened, { setTrue: openEditProfileModal, setFalse: closeEditProfileModal }] = useBoolean(false);
  useEffect(() => {
    getProfiles().then(setProfiles);
  }, [updated])

  function buildColumns(): IColumn[] {
    return [{
      key: 'profileName',
      name: '配置名称',
      fieldName: 'profileName',
      minWidth: 100,
      maxWidth: 300,
      onRender: (item: ProjectProfile) => {
        return <span>{item.profileName}</span>;
      }
    }, {
      key: 'projectAddress',
      name: '项目地址',
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
      name: '操作',
      minWidth: 100,
      onRender: (item: ProjectProfile) => {
        return <Actions item={item} setEditItem={setEditItem} setUpdated={setUpdated} openEditProfileModal={openEditProfileModal} />
      }
    }]
  }
  const columns = buildColumns();

  return (
    <>
      <NewProfileModal closeModal={closeNewProfileModal} setUpdated={setUpdated} isModalOpened={isNewProfileModalOpened} />
      <EditProfileMoal item={editItem} closeModal={closeEditProfileModal} setUpdated={setUpdated} isModalOpened={isEditProfileModalOpened} />
      <PrimaryButton styles={{
        root: {
          width: '200px',
        }
      }} onClick={() => openNewProfileModal()}>新建配置</PrimaryButton>
      <DetailsList selectionMode={SelectionMode.none} disableSelectionZone items={profiles} columns={columns} />
    </>
  );


}