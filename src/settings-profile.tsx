import React, { useEffect, useState } from 'react';
import { getProfiles, ProjectProfile } from './util'
import { DetailsList, IColumn, SelectionMode } from '@fluentui/react/lib/DetailsList';
import { PrimaryButton } from '@fluentui/react/lib/Button';
import { useBoolean } from '@fluentui/react-hooks';
import { initializeIcons } from '@fluentui/react/lib/Icons';
import { EditLabelsModal, EditProfileMoal, NewProfileModal } from './settings-profile-modal';
import { Actions } from './settings-profile-actions';
import { GitlabLabel, GitlabLabels } from './gitlab-label';
import { MessageBar, Stack } from '@fluentui/react';
initializeIcons(/* optional base url */);

const VERSION_EXTRACTION_MODE_MAP = {
  'text': '全文本',
  'json': 'JSON',
  'regex': '正则表达式'
};

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
        if (labels && labels.length > 0) {
          return <GitlabLabels labels={labels} />
        }

        return null;
      }
    }, {
      key: 'versionPath',
      name: '版本路径',
      minWidth: 100,
      onRender: (item: ProjectProfile) => {
        return <span>{item.versionPath}</span>
      },
    }, {
      key: 'versionExtractionMode',
      name: '版本解析模式',
      minWidth: 100,
      onRender: (item: ProjectProfile) => {
        return <span>{VERSION_EXTRACTION_MODE_MAP[item.versionExtractionMode] || VERSION_EXTRACTION_MODE_MAP['text']}</span>
      },
    }, {
      key: 'versionExtractionRule',
      name: '版本解析规则',
      minWidth: 150,
      onRender: (item: ProjectProfile) => {
        return <span>{item.versionExtractionRule || '-'}</span>
      },
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
      <MessageBar>
        注意：预置标签将会直接添加到 issue 中，预置 Scoped Label 将要求在创建 issue 时进行选择。
      </MessageBar>
    </>
  );


}