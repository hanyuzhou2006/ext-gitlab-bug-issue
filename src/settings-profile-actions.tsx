import React from 'react';
import { IconButton } from '@fluentui/react';
import { delProjectProfile } from './util';

export function Actions(props) {
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