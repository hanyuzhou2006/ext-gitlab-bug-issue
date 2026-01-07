
import React, { useEffect, useState } from 'react';
import { Actions } from './settings-match-actions';
import { ProjectProfile, Rule } from './util';
import { makeStyles, tokens} from '@fluentui/react-components';
import { getProfiles } from './util';
import { AddRegular, ArrowSortRegular } from '@fluentui/react-icons';
import { Dropdown, Option, Input, Button, DataGridHeader, DataGridRow, DataGridCell, DataGridHeaderCell, DataGridBody, DataGrid, TableColumnDefinition, createTableColumn, TableColumnSizingOptions, TableRowId} from '@fluentui/react-components';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import {SortableContext,useSortable,verticalListSortingStrategy,arrayMove} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';


const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  fullWidth: {
    width: '100%',
    minWidth: 0,
  },
  button: {
    width: '100%',
  },
  dragging: {
    backgroundColor: tokens.colorNeutralBackground3,
    boxShadow: tokens.shadow16,
    zIndex: 1,
    position: 'relative'
  }
});



const columnSizingOptions: TableColumnSizingOptions = {
  order: { idealWidth: 100, },
  url: { idealWidth: 900, },
  profile: { idealWidth: 300, },
  actions: { idealWidth: 200, },
};


interface SortableRowProps {
  item: Rule;
  rowId: TableRowId;
  columns: TableColumnDefinition<Rule>[];
}

function createRule(partial?: Partial<Rule>): Rule {
  return {
    id: Date.now() + Math.random(),
    url: '',
    profile: '',
    ...partial,
  };
}


function SortableRow({item,rowId,columns}:SortableRowProps) {
  const styles = useStyles();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({id: rowId});

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  return (
    <DataGridRow ref={setNodeRef} style={style} className={isDragging ? styles.dragging : ''}>
      {(column) => (
        <DataGridCell>{column.columnId === 'order' ? (<Button appearance='subtle' icon={<ArrowSortRegular/>} style={{cursor: 'grab'}} {...attributes} {...listeners}/>): (column.renderCell(item))}</DataGridCell>
      )}
    </DataGridRow>
  );
}

function ProfileSelection(props: { profile: string, setProfile: (profile: string) => void }) {
  const { profile, setProfile } = props;
  const [profiles, setProfiles] = useState<ProjectProfile[]>([]);
  const styles = useStyles();
  useEffect(() => {
    getProfiles().then(setProfiles);
  }, [])
  const options = profiles.map(profile => ({
    value: profile.profileName,
    label: profile.profileName
  }))

  return <Dropdown
    className={styles.fullWidth}
    placeholder="选择一项配置"
    value={profile}
    onOptionSelect={(_, data) => {
      setProfile(data.optionValue as string);
    }}
  >
    {options.map(option => (
      <Option key={option.value} value={option.value}>
        {option.label}
      </Option>
    ))}
  </Dropdown>
}


export function UIEditorMode(props: { rules: Rule[], setRules: (rules: Rule[]) => void }) {
  const { rules, setRules } = props;
  const styles = useStyles();
  function onDel(id: number) {
    const newRules = rules.filter(r => r.id !== id);
    setRules(newRules);
  }

  function onUrlChange(id: number, value: string) {
    const newRules = rules.map(r => 
      r.id === id ? { ...r, url: value } : r
    );
    setRules(newRules);
  }

  function onProfileChange(id: number, value: string) {
    const newRules = rules.map(r => 
      r.id === id ? { ...r, profile: value } : r
    );
    setRules(newRules);
  }

  const columns: TableColumnDefinition<Rule>[] = [
    createTableColumn({
      columnId: 'order',
      renderHeaderCell: () => '排序',
      renderCell: () => null,
    }),
    createTableColumn({
      columnId: 'url',
      renderHeaderCell: () => '网址',
      renderCell(item) {
        return <Input className={styles.fullWidth} value={item.url} type='text' onChange={(_, data) => {
          onUrlChange(item.id, data.value);
        }} />
      },
    }),
    createTableColumn({
      columnId: 'profile',
      renderHeaderCell: () => '配置',
      renderCell(item) {
        const index = rules.indexOf(item);
        return <ProfileSelection profile={item.profile} setProfile={(profile) => {
          onProfileChange(item.id, profile);
        }} />
      },
    }),
    createTableColumn({
      columnId: 'actions',
      renderHeaderCell: () => '操作',
      renderCell(item) {
        const index = rules.indexOf(item);
        return <Actions onDel={() => { onDel(item.id) }} />
      },
    }),
  ]

  function addDefaultRule() {
    setRules([...rules, createRule()]);
  }

  //处理拖拽结果
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = rules.findIndex((r) => r.id === active.id);
      const newIndex = rules.findIndex((r) => r.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        setRules(arrayMove(rules, oldIndex, newIndex));
      }
    }
  };

  return (
    <div className={styles.root}>
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={rules.map(r => r.id)} strategy={verticalListSortingStrategy}>
        <DataGrid items={rules} columns={columns}
        resizableColumns
        columnSizingOptions={columnSizingOptions}
        sortable={false}
        getRowId={(item) => item.id}
        focusMode="composite"
      >
        <DataGridHeader>
          <DataGridRow
          >
            {({ renderHeaderCell }) => (
              <DataGridHeaderCell>{renderHeaderCell()}</DataGridHeaderCell>
            )}
          </DataGridRow>
        </DataGridHeader>
        <DataGridBody<Rule>>
          {({ item, rowId }) => (
            <SortableRow 
            key={rowId} 
            item={item} 
            rowId={rowId} 
            columns={columns} 
          />
          )}
        </DataGridBody>
      </DataGrid>
        </SortableContext>
      </DndContext>
      <div style={{ padding: '10px', width: '100%', boxSizing: 'border-box' }}>
        <Button size='large' className={styles.button} onClick={() => setRules([...rules, createRule()])}
        ><AddRegular/></Button>
      </div>
    </div>
  );
}


