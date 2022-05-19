import { Checkbox, Stack } from '@fluentui/react';
import React, { useState } from 'react';
import { GitlabLabel, LabelProp } from './gitlab-label';

export function Labels(props: { labels: LabelProp[], onChange: (e, labels: LabelProp[]) => void }) {
  const { labels = [], onChange } = props;
  const [selectedLabels, setSelectedLabels] = useState<LabelProp[]>([]);

  function onLabelChange(e, checked: boolean, label: LabelProp) {
    if (checked) {
      setSelectedLabels([...selectedLabels, label]);
    } else {
      setSelectedLabels(selectedLabels.filter(l => l.name !== label.name));
    }
    onChange(e, selectedLabels);
  }
  function isLabelChecked(label): boolean {
    return selectedLabels.some(l => l.name === label.name);
  }
  function onRenderLabel(label: LabelProp): JSX.Element {
    return <GitlabLabel name={label.name} color={label.color} textColor={label.textColor} />
  }

  return <Stack tokens={
    {
      childrenGap: 10
    }
  }>
    {
      labels.map((label) => {
        return <Checkbox key={label.name} label={label.name} onChange={(e, checked) => onLabelChange(e, checked, label)}
          checked={isLabelChecked(label)} onRenderLabel={
            () => onRenderLabel(label)
          }
        />
      })
    }
  </Stack>
}

