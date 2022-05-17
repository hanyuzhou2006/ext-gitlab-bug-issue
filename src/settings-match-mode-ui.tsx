
import React, { useState } from 'react';
import { TextField, Stack, DetailsList, IColumn, SelectionMode, DefaultButton, IDragDropContext, IDragDropEvents } from '@fluentui/react';
import { Actions } from './settings-match-actions';
import { Rule } from './util';
import { getTheme, mergeStyles } from '@fluentui/react/lib/Styling';
import { IconButton } from '@fluentui/react';

const theme = getTheme();
const dragEnterClass = mergeStyles({
  backgroundColor: theme.palette.neutralLight,
});

export function UIEditorMode(props:{rules:Rule[],setRules:(rules:Rule[])=>void}){
  const {rules,setRules} = props;
  function onDel(index: number) {
    const newRules = rules.filter((_, i) => i !== index);
    setRules(newRules);
  }

  function onUrlChange(index:number, value:string) {
    const rule = { ...rules[index] };
    rule.url = value;
    const newRules = [
      ...rules
    ]
    newRules[index] = rule;
    setRules(newRules);
  }

  function onProfileChange(index:number, value:string) {
    const rule = { ...rules[index] };
    rule.profile = value;
    const newRules = [
      ...rules
    ]
    newRules[index] = rule;
    setRules(newRules);
  }

  const columns: IColumn[] = [
    {
      key: 'order',
      name: '排序',
      minWidth: 60,
      maxWidth: 100,
      onRender: (item) => {
        return <IconButton iconProps={
          {
            iconName: 'Sort',
          }
        }/>
      }
    },
    {
      key: 'url',
      name: '网址',
      minWidth: 200,
      fieldName: 'url',
      onRender: (item, index) => {
        return <TextField value={item.url} onChange={(_e, value) => {
          onUrlChange(index, value);
        }} />
      }
    },
    {
      key: 'profile',
      name: '配置',
      minWidth: 200,
      fieldName: 'profile',
      onRender: (item, index) => {
        return <TextField value={item.profile} onChange={(_e, value) => {
          onProfileChange(index, value);
        }} />
      }
    },
    {
      key: 'actions',
      name: '操作',
      minWidth: 100,
      onRender: (_item, index) => {
        return <Actions onDel={() => { onDel(index) }} />
      }
    }
  ]

  function addDefaultRule() {
    const newRules = [...rules, { url: '', profile: '' }]
    setRules(newRules);
  }

  const [dragItem, setDragItem] = useState<Rule | undefined>();

  function insertBeforeItem(item: Rule): void {
    const insertIndex = rules.indexOf(item);
    const items = rules.filter(itm => dragItem !== itm);
    items.splice(insertIndex, 0, dragItem);
    setRules(items);
  }

  function dragDropEvents(): IDragDropEvents {
    return {
      canDrop: (dropContext?: IDragDropContext, dragContext?: IDragDropContext) => {
        return true;
      },
      canDrag: (item?: any) => {
        return true;
      },
      onDragEnter: (item?: any, event?: DragEvent) => {
        // return string is the css classes that will be added to the entering element.
        return dragEnterClass;
      },
      onDragLeave: (item?: any, event?: DragEvent) => {
        return;
      },
      onDrop: (item?: any, event?: DragEvent) => {
        if (dragItem) {
          insertBeforeItem(item);
        }
      },
      onDragStart: (item?: any, itemIndex?: number, selectedItems?: any[], event?: MouseEvent) => {
        setDragItem(item);
      },
      onDragEnd: (item?: any, event?: DragEvent) => {
        setDragItem(undefined);
      },
    };
  }

  return (
    <>
      <DetailsList selectionMode={SelectionMode.none} items={rules} columns={columns}
        dragDropEvents={dragDropEvents()}
      />
      <Stack tokens={{
        padding: 10
      }} >
        <DefaultButton iconProps={{
          iconName: 'Add'
        }} onClick={
          () => { addDefaultRule() }
        } />
      </Stack>
    </>
  );
}


