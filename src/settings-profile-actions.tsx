import React from 'react';
// import { IconButton } from '@fluentui/react';
import { delProjectProfile } from './util';
import { Button, makeStyles } from '@fluentui/react-components';
import { DeleteRegular, EditRegular, TagRegular } from '@fluentui/react-icons';
import {
  Dialog,
  DialogTrigger,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogActions,
  DialogContent,
} from "@fluentui/react-components";

const useStyles = makeStyles({
  del: {
    color: 'red',
  },
  edit: {
    color: 'blue',
  },
  editLabels: {
    color: 'blue',
  },
});

export function Actions(props) {
  const { item, setUpdated, setEditItem, openEditProfileModal, openEditLabelsModal } = props;
  return <>
    <EditAction item={item} setEditItem={setEditItem} openEditProfileModal={openEditProfileModal} />
    <DelAction item={item} setUpdated={setUpdated} />
    <EditLabelsAction item={item} setEditItem={setEditItem} setUpdated={setUpdated} openEditLabelsModal={openEditLabelsModal} />
  </>
}

function DelAction(props) {
  const styles = useStyles();
  const { item, setUpdated } = props;
  // return <Button
  //   className={styles.del}
  //   icon={<DeleteRegular />}
  //   appearance='subtle'
  //   aria-label='删除配置'
  // onClick={async () => {
  //   await delProjectProfile(item.profileName);
  //   setUpdated(Date.now());
  // }} />
  return (
    <Dialog>
      <DialogTrigger disableButtonEnhancement>
        <Button className={styles.del} icon={<DeleteRegular />} appearance="subtle" aria-label="删除配置" />
      </DialogTrigger>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>确认删除</DialogTitle>
          <DialogContent>
            您确定要删除项目名称为 <b>{item.profileName}</b> 的配置吗？此操作无法撤销。
          </DialogContent>
          <DialogActions>
            <Button appearance="primary" onClick={async () => {
              await delProjectProfile(item.profileName);
              setUpdated(Date.now());
            }}  >确认</Button>
            <DialogTrigger disableButtonEnhancement>
              <Button appearance="secondary">关闭</Button>
            </DialogTrigger>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}

function EditAction(props) {
  const { item, setEditItem, openEditProfileModal } = props;
  const styles = useStyles();

  return <Button
    className={styles.edit}
    icon={<EditRegular />}
    appearance='subtle'
    aria-label='修改配置'
    onClick={async () => {
      setEditItem(item);
      openEditProfileModal();
    }} />
}

function EditLabelsAction(props) {
  const { item, setEditItem, openEditLabelsModal } = props;
  const styles = useStyles();
  return <Button
    className={styles.editLabels}
    icon={<TagRegular />}
    appearance='subtle'
    aria-label='修改标签'
    onClick={async () => {
      setEditItem(item);
      openEditLabelsModal();
    }}
  />
}