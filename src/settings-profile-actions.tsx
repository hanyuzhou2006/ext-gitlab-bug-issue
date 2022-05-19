import React from 'react';
import { IconButton } from '@fluentui/react';
import { delProjectProfile } from './util';

export function Actions(props) {
  const { item, setUpdated, setEditItem, openEditProfileModal, openEditLabelsModal } = props;
  return <>
    <EditAction item={item} setEditItem={setEditItem} openEditProfileModal={openEditProfileModal} />
    <DelAction item={item} setUpdated={setUpdated} />
    <EditLabelsAction item={item} setEditItem={setEditItem}  setUpdated={setUpdated} openEditLabelsModal={openEditLabelsModal} />
  </>
}

function DelAction(props) {
  const { item, setUpdated } = props;
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

function EditAction(props) {
  const { item, setEditItem, openEditProfileModal } = props;

  return <IconButton styles={{
    root: {
      maxHeight: '16px',
    }
  }} iconProps={{
    iconName: 'Edit',
  }} onClick={async () => {
    setEditItem(item);
    openEditProfileModal();
  }} />
}

function EditLabelsAction(props) {
  const { item, setEditItem, openEditLabelsModal } = props;
  return <IconButton styles={{
    root: {
      maxHeight: '16px',
    }
  }
  } iconProps={{
    iconName: 'Label',
  }} onClick={async () => {
    setEditItem(item);
    openEditLabelsModal();
  }}
  />
}