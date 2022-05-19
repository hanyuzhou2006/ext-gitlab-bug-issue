import { ChoiceGroup, IChoiceGroupOption, Stack } from '@fluentui/react';
import React, { useEffect, useState, useRef } from 'react';
import { GitlabLabel, GitlabLabels, LabelProp } from './gitlab-label';

export function Labels(props: { labels: LabelProp[], onChange: (e, labels: string[]) => void }) {
  const { labels = [], onChange } = props;
  const { global, scoped } = groupByScope(labels);
  const scopedSelections = useRef<{ scope: string, key: string }[]>([]);

  function getSelectedLabels(): string[] {
    return [...global.map(label => label.name), ...scopedSelections.current.map(({ scope, key }) => key)];
  }

  function onScopedLabelChanged(e, scope: string, label: string) {
    const newSelections = scopedSelections.current.filter(selection => selection.scope !== scope);
    if (label) {
      newSelections.push({ scope, key: label });
    }
    scopedSelections.current = newSelections;
    onChange(null, getSelectedLabels());
  }

  useEffect(() => {
    const initial = scoped.map(({ scope, labels }) => {
      return { scope, key: labels[0]?.name }
    });
    scopedSelections.current = initial;
    onChange(null, getSelectedLabels());
  }, [labels]);



  function onRenderLabel(label: LabelProp): JSX.Element {
    return <GitlabLabel name={label.name} color={label.color} textColor={label.textColor} />
  }

  return <Stack tokens={
    {
      childrenGap: 10
    }
  }>
    <GitlabLabels labels={global} />
    {
      scoped.length && <>
        {
          scoped.map(({ scope, labels }) => {
            const options: IChoiceGroupOption[] = labels.map(label => {
              return {
                key: label.name,
                text: '',
                onRenderField: (props, render) => {
                  return <>
                    {render!(props)}
                    {onRenderLabel(label)}
                  </>
                },
              }
            });
            return <ChoiceGroup key={scope} defaultSelectedKey={options[0]?.key} label={scope} options={options} onChange={(e, option) => {
              onScopedLabelChanged(e, scope, option.key)
            }} />
          })
        }
      </>
    }
  </Stack>
}

// if label.name contains '::', it is a scope label
// return an object with global labels and scoped labels
// if a scope labels length is 1, it is a global label
// the scoped labels are grouped by scope  as an array of objects
function groupByScope(labels: LabelProp[]): { global: LabelProp[], scoped: { scope: string, labels: LabelProp[] }[] } {
  const global: LabelProp[] = [];
  const scoped: LabelProp[] = [];
  labels.forEach(label => {
    if (label.name.includes('::')) {
      scoped.push(label);
    } else {
      global.push(label);
    }
  });
  const scopedGroups = groupByScopeScope(scoped);
  const realScopedGroups = [];
  scopedGroups.forEach(group => {
    if (group.labels.length === 1) {
      global.push(group.labels[0]);
    } else {
      realScopedGroups.push(group);
    }
  });
  return {
    global,
    scoped: realScopedGroups,
  }
}

function groupByScopeScope(labels: LabelProp[]): { scope: string, labels: LabelProp[] }[] {
  const groups: { scope: string, labels: LabelProp[] }[] = [];
  labels.forEach(label => {
    const [scope] = label.name.split('::');
    const group = groups.find(g => g.scope === scope);
    if (group) {
      group.labels.push(label);
    } else {
      groups.push({
        scope,
        labels: [label],
      });
    }
  });
  return groups;

}