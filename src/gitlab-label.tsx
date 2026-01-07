import React from 'react';

export type LabelProp = {
  name: string;
  color: string;
  textColor: string;
}
export function GitlabLabel(props: LabelProp): JSX.Element {
  const { name: labelName, color, textColor } = props;
  // if name is a scope, then render a scoped label
  if (labelName.includes('::')) {
    const [scope, name] = labelName.split('::');
    return (
      <GitlabScopedLabel scope={scope} name={name} color={color} textColor={textColor} />
    );
  }

  return <GitlabCommonLabel name={labelName} color={color} textColor={textColor} />
}

const labelStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  overflow: 'hidden',
  borderRadius: '0.75rem',
  color: '#fff',
  fontSize: '0.875em',
  position: 'relative',
  lineHeight: '16px',
}

const labelNameStyle: React.CSSProperties = {
  paddingLeft: '0.5rem',
  paddingRight: '0.5rem',
  paddingTop: '0.25rem',
  paddingBottom: '0.25rem',
  display: 'inline-block',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  verticalAlign: 'top',
  whiteSpace: 'nowrap',
  maxWidth: '100%',
}

function GitlabCommonLabel(props: LabelProp): JSX.Element {
  const { name, color, textColor } = props;
  return <span style={{
    ...labelStyle,
    backgroundColor: color,
    color: textColor,
  }}>
    <span style={labelNameStyle}>{name}</span>
  </span>
}

function GitlabScopedLabel(props) {
  const { scope, name, color, textColor } = props;
  return <span style={{
    ...labelStyle,
    color: textColor,
    boxShadow: `0 0 0 2px ${color} inset`,
  }}>
    <span style={{
      ...labelNameStyle,
      backgroundColor: color,
      paddingRight: '0.25rem',
    }}>{scope}</span>
    <span style={{
      ...labelNameStyle,
      paddingLeft: '0.25rem',
      color: '#000',
    }}>{name}</span>
  </span>
}

export function GitlabLabels(props: {
  labels: LabelProp[];
}): JSX.Element {
  const { labels } = props;
  return <div style={{
    display: 'block',
  }}>
    {labels.map(label => (
      <GitlabLabel
        key={label.name}
        name={label.name}
        color={label.color}
        textColor={label.textColor}
      />
    ))}
  </div>
}