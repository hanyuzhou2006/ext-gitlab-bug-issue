import React, { useEffect, useRef } from 'react';
import { GitlabLabel, GitlabLabels, LabelProp } from './gitlab-label';
import { RadioGroup, Radio, makeStyles } from '@fluentui/react-components';


const useStyles = makeStyles({
  root: {
    gap: '10px',
    display: 'flex',
    flexDirection: 'column',
  },
  scopeGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  radioItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
});
export function Labels(props: { labels: LabelProp[], onChange: (e, labels: string[]) => void }) {
  const { labels = [], onChange } = props;
  const { global, scoped } = groupByScope(labels);
  const scopedSelections = useRef<{ scope: string, key: string }[]>([]);
  const styles = useStyles();

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


  return <div className={styles.root}>
    <GitlabLabels labels={global} />
    {
      scoped.length && <>
        {
          scoped.map(({ scope, labels }) => {
            <RadioGroup key={scope} value={scopedSelections.current.find(s => s.scope === scope)?.key ?? labels[0].name}
              onChange={(_,data) => {
                onScopedLabelChanged(null,scope, data.value as string)
              }}
            >
              {labels.map(label => (
                <Radio key={label.name} value={label.name} label={<GitlabLabel
                  name={label.name} color={label.color} textColor={label.textColor} />} />
              ))}
            </RadioGroup>

          })
        }
      </>
    }
  </div>
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