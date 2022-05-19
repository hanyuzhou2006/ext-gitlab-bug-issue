import React, { useEffect, useState } from 'react';
import { getProfiles, ProjectProfile } from './util'
import { DetailsList, IColumn, SelectionMode } from '@fluentui/react/lib/DetailsList';
import { PrimaryButton } from '@fluentui/react/lib/Button';
import { useBoolean } from '@fluentui/react-hooks';
import { initializeIcons } from '@fluentui/react/lib/Icons';
import { EditLabelsModal, EditProfileMoal, NewProfileModal } from './settings-profile-modal';
import { Actions } from './settings-profile-actions';
import { GitlabLabel } from './gitlab-label';
initializeIcons(/* optional base url */);

export function SettingsProfile() {
  const [profiles, setProfiles] = useState([]);
  const [updated, setUpdated] = useState(Date.now());
  const [isNewProfileModalOpened, { setTrue: openNewProfileModal, setFalse: closeNewProfileModal }] = useBoolean(false);
  const [editItem, setEditItem] = useState({} as ProjectProfile);
  const [isEditProfileModalOpened, { setTrue: openEditProfileModal, setFalse: closeEditProfileModal }] = useBoolean(false);
  const [isEditLabelsModalOpened, { setTrue: openEditLabelsModal, setFalse: closeEditLabelsModal }] = useBoolean(false);
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
      key: 'labels',
      name: '预置标签',
      minWidth: 300,
      isMultiline: true,
      onRender: (item: ProjectProfile) => {
        const labels = item.labels;
        return labels && labels.length > 0 ? labels.map(label =>
          <GitlabLabel key={label.name} name={label.name} color={label.color} textColor={label.textColor} />) : null;
      }
    }, {
      key: 'actions',
      name: '操作',
      minWidth: 100,
      onRender: (item: ProjectProfile) => {
        return <Actions item={item} setEditItem={setEditItem} setUpdated={setUpdated} openEditProfileModal={openEditProfileModal}
          openEditLabelsModal={openEditLabelsModal} />
      }
    }]
  }
  const columns = buildColumns();

  return (
    <>
      <NewProfileModal closeModal={closeNewProfileModal} setUpdated={setUpdated} isModalOpened={isNewProfileModalOpened} />
      <EditProfileMoal item={editItem} closeModal={closeEditProfileModal} setUpdated={setUpdated} isModalOpened={isEditProfileModalOpened} />
      <EditLabelsModal item={editItem} closeModal={closeEditLabelsModal} setUpdated={setUpdated} isModalOpened={isEditLabelsModalOpened} />
      <PrimaryButton styles={{
        root: {
          width: '200px',
        }
      }} onClick={() => openNewProfileModal()}>新建配置</PrimaryButton>
      <DetailsList selectionMode={SelectionMode.none} disableSelectionZone items={profiles} columns={columns} />
    </>
  );


}