import React from 'react';

export type LabelProp = {
  name: string;
  color: string;
  textColor: string;
}
export function GitlabLabel(props: LabelProp): JSX.Element {
  const { name, color, textColor } = props;
  return <div style={{
    display: 'inline-block',
    padding: '2px 4px',
    marginRight: '4px',
    borderRadius: '2px',
    backgroundColor: color,
    color: textColor,
    fontSize: '0.8em',
    fontWeight: 'bold',
  }}>{name}</div>
}



