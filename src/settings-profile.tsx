import React, { useEffect, useState, version } from 'react';
import { getProfiles, ProjectProfile } from './util'
import { useBoolean } from '@fluentui/react-hooks';
import { EditLabelsModal, EditProfileMoal, NewProfileModal } from './settings-profile-modal';
import { Actions } from './settings-profile-actions';
import { GitlabLabels } from './gitlab-label';

import { Button, MessageBar, DataGrid, DataGridBody, DataGridCell, DataGridHeader, DataGridRow, TableColumnDefinition, createTableColumn, makeStyles } from '@fluentui/react-components';

const VERSION_EXTRACTION_MODE_MAP = {
  'text': '全文本',
  'json': 'JSON',
  'regex': '正则表达式'
};

const useStyles = makeStyles({
  newButton: {
    width: '200px',
  },
  addressColumn: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: 'block', // 确保 span 表现为块级元素以便截断生效
  },
  labelsContainer: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap', 
    gap: '4px',       
    alignItems: 'center',
  },
  root: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '16px',
    width: '100%',
  }
});

const columnSizingOptions = {
  labels: {
    idealWidth: 300,
  },
};
export function SettingsProfile() {
  const [profiles, setProfiles] = useState([]);
  const [updated, setUpdated] = useState(Date.now());
  const [isNewProfileModalOpened, { setTrue: openNewProfileModal, setFalse: closeNewProfileModal }] = useBoolean(false);
  const [editItem, setEditItem] = useState({} as ProjectProfile);
  const [isEditProfileModalOpened, { setTrue: openEditProfileModal, setFalse: closeEditProfileModal }] = useBoolean(false);
  const [isEditLabelsModalOpened, { setTrue: openEditLabelsModal, setFalse: closeEditLabelsModal }] = useBoolean(false);
  const styles = useStyles();

  useEffect(() => {
    getProfiles().then(setProfiles);
  }, [updated])

  const columns: TableColumnDefinition<ProjectProfile>[] = [
    createTableColumn({
      columnId: 'profileName',
      renderHeaderCell: () => '配置名称',
      renderCell: (item) =>item.profileName,
    }),
    createTableColumn({
      columnId: 'projectAddress',
      renderHeaderCell: () => '项目地址',
      renderCell: (item) => (
        <span className={styles.addressColumn} title={item.projectAddress}>
          {item.projectAddress}
        </span>
      ),
    }),
    createTableColumn({
      columnId: 'privateToken',
      renderHeaderCell: () => 'Private Token',
      renderCell: (item) => item.privateToken.substring(0, 6) + '...',
    }),
    createTableColumn({
      columnId: 'labels',
      renderHeaderCell: () => '预置标签',
      renderCell: (item) => {
        const labels = item.labels;
        if (labels && labels.length > 0) {
          return (
            <div className={styles.labelsContainer}>
              <GitlabLabels labels={labels} />
            </div>
          );
        }
        return null;
      },
    }),
    createTableColumn({
      columnId: 'versionPath',
      renderHeaderCell: () => '版本路径',
      renderCell: (item) =>item.versionPath,
    }),
    createTableColumn({
      columnId: 'versionExtractionMode',
      renderHeaderCell: () => '版本解析模式',
      renderCell: (item) =>VERSION_EXTRACTION_MODE_MAP[item.versionExtractionMode] || VERSION_EXTRACTION_MODE_MAP['text'],
    }),
    createTableColumn({
      columnId: 'versionExtractionRule',
      renderHeaderCell: () => '版本解析规则',
      renderCell: (item) =>item.versionExtractionRule || '-',
    }),
    createTableColumn({
      columnId: 'actions',
      renderHeaderCell: () => '操作',
      renderCell: (item) => <div>
        <Actions item={item} setEditItem={setEditItem} setUpdated={setUpdated} openEditProfileModal={openEditProfileModal}
          openEditLabelsModal={openEditLabelsModal} />
      </div>,
    }),
  ]

  return (
  <div className={styles.root}>
      <NewProfileModal closeModal={closeNewProfileModal} setUpdated={setUpdated} isModalOpened={isNewProfileModalOpened} />
      <EditProfileMoal item={editItem} closeModal={closeEditProfileModal} setUpdated={setUpdated} isModalOpened={isEditProfileModalOpened} />
      <EditLabelsModal item={editItem} closeModal={closeEditLabelsModal} setUpdated={setUpdated} isModalOpened={isEditLabelsModalOpened} />
      <Button
        appearance='primary' className={styles.newButton}
        onClick={() => openNewProfileModal()}>新建配置</Button>
      <DataGrid
        items={profiles}
        columns={columns}
        resizableColumns
        columnSizingOptions={columnSizingOptions}
        sortable={false}
        getRowId={(item) => item.profileName}
        focusMode="composite"
      >
        <DataGridHeader>
          <DataGridRow>
            {({ renderHeaderCell }) => (
              <DataGridCell>
                {renderHeaderCell()}
              </DataGridCell>
            )}
          </DataGridRow>
        </DataGridHeader>

        <DataGridBody>
          {({ item, rowId }) => (
            <DataGridRow key={rowId}>
              {({ renderCell }) => (
                <DataGridCell>
                  {renderCell(item)}
                </DataGridCell>
              )}
            </DataGridRow>
          )}
        </DataGridBody>
      </DataGrid>
      <MessageBar>
        注意：预置标签将会直接添加到 issue 中，预置 Scoped Label 将要求在创建 issue 时进行选择。
      </MessageBar>
    </div>
  )
}