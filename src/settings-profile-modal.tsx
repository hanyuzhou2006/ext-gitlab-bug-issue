import React, { useEffect, useRef } from 'react';
import { newProjectProfile } from './util';
import { listLabels } from './apis';
import { GitlabLabel, GitlabLabels, LabelProp } from './gitlab-label';
import { Button, Input, makeStyles, Field, Dialog, DialogActions, DialogBody, DialogContent, DialogTitle, DialogSurface, Dropdown, tokens, Option } from '@fluentui/react-components';

const extractionModeOptions = [
  { key: 'text', text: '全文本' },
  { key: 'json', text: 'JSON' },
  { key: 'regex', text: '正则表达式' },
];

const useStyles = makeStyles({
  verticalStack: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    padding: '20px',
    width: '600px', 
  },
  horizontalStack: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: '40px',
  },
  surface: {
    maxWidth: '640px', // 略大于 600px 以留出 padding
  }
});

function getExtractionRulePlaceholder(mode: 'text' | 'json' | 'regex'): string {
  switch (mode) {
    case 'json':
      return '例如: version 或 data.version';
    case 'regex':
      return '例如: version: (.+)';
    default:
      return '';
  }
}

function getExtractionRuleDescription(mode: 'text' | 'json' | 'regex'): string {
  switch (mode) {
    case 'json':
      return 'JSON路径，如 version 或 data.version';
    case 'regex':
      return '正则表达式，第一个捕获组或完整匹配';
    default:
      return '全文本模式不需要解析规则';
  }
}

export function NewProfileModal(props) {
  const { isModalOpened, closeModal, setUpdated } = props;
  const [profileName, setProfileName] = React.useState('');
  const [projectAddress, setProjectAddress] = React.useState('');
  const [privateToken, setPrivateToken] = React.useState('');
  const [versionPath, setVersionPath] = React.useState('');
  const [versionExtractionMode, setVersionExtractionMode] = React.useState<'text' | 'json' | 'regex'>('text');
  const [versionExtractionRule, setVersionExtractionRule] = React.useState('');
  const styles = useStyles();
  async function newProfile() {
    try {
      await newProjectProfile({
        profileName,
        projectAddress,
        privateToken,
        versionPath,
        versionExtractionMode,
        versionExtractionRule,
      });
    } catch (err) {
      alert(err.message);
    }

    closeModal();
    setUpdated(Date.now());
  };


  return (
    <Dialog open={isModalOpened} onOpenChange={(e, data) => !data.open && closeModal()}>
      <DialogSurface className={styles.surface}>
        <DialogBody>
          <DialogTitle>新建项目配置</DialogTitle>
          <DialogContent className={styles.verticalStack}>
            <Field label={'名称'}>
              <Input value={profileName} required onChange={(e, data) => {
                setProfileName(data.value);
              }} />
            </Field>
            <Field label={'GitLab 地址'}>
              <Input value={projectAddress} required onChange={(e, data) => {
                setProjectAddress(data.value);
              }} />
            </Field>
            <Field label={'Gitlab private_token'}>
              <Input value={privateToken} type="password" required onChange={(e, data) => {
                setPrivateToken(data.value);
              }} />
            </Field>
            <Field label={'版本路径'}>
              <Input value={versionPath} required onChange={(e, data) => {
                setVersionPath(data.value);
              }} />
            </Field>
            <Field label={'版本解析模式'}>
              <Dropdown
                value={extractionModeOptions.find(o => o.key === versionExtractionMode)?.text}
                onOptionSelect={(e, data) => setVersionExtractionMode(data.selectedOptions[0] as any)}
              >
                {extractionModeOptions.map((option) => (
                  <Option key={option.key} value={option.key}>{option.text}</Option>
                ))}
              </Dropdown>
            </Field>
            <Field label={'版本解析规则'} hint={getExtractionRuleDescription(versionExtractionMode)}>
              <Input value={versionExtractionRule} 
              placeholder={getExtractionRulePlaceholder(versionExtractionMode)} 
              disabled={versionExtractionMode === 'text'}
              onChange={(e, data) => {
                setVersionExtractionRule(data.value);
              }} />
            </Field>

            <div className={styles.horizontalStack}>
              <Button onClick={closeModal}>Cancel</Button>
              <Button appearance='primary' onClick={newProfile}>New</Button>
            </div>

          </DialogContent>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  )
}

export function EditProfileMoal(props) {
  const { isModalOpened, closeModal, setUpdated, item } = props;
  const projectAddressRef = useRef(null);
  const privateTokenRef = useRef(null);
  const versionPathRef = useRef(null);
  const [versionExtractionMode, setVersionExtractionMode] = React.useState<'text' | 'json' | 'regex'>('text');
  const [versionExtractionRule, setVersionExtractionRule] = React.useState('');
  const styles = useStyles();

  useEffect(() => {
    if (item) {
      setVersionExtractionMode(item.versionExtractionMode || 'text');
      setVersionExtractionRule(item.versionExtractionRule || '');
    }
  }, [item]);

  async function submit() {
    const projectAddress = projectAddressRef.current.value;
    const privateToken = privateTokenRef.current.value;
    const versionPath = versionPathRef.current.value;
    await newProjectProfile({
      profileName: item.profileName,
      projectAddress,
      privateToken,
      versionPath,
      versionExtractionMode,
      versionExtractionRule,
    });
    closeModal();
    setUpdated(Date.now());
  }

  return (
    <Dialog open={isModalOpened} onOpenChange={closeModal}>
      <DialogSurface className={styles.surface}>
        <DialogBody>
          <DialogContent className={styles.verticalStack}>
            <Field label={'名称'}>
              <Input value={item.profileName} readOnly />
            </Field>
            <Field label={'GitLab 地址'}>
              <Input defaultValue={item.projectAddress} required ref={projectAddressRef} />
            </Field>
            <Field label={'Gitlab private_token'}>
              <Input defaultValue={item.privateToken} type="password" required ref={privateTokenRef} />
            </Field>
            <Field label={'版本路径'}>
              <Input defaultValue={item.versionPath} required ref={versionPathRef} />
            </Field>
            <Field label={'版本解析模式'}>
              <Dropdown
                value={extractionModeOptions.find(o => o.key === versionExtractionMode)?.text}
                onOptionSelect={(e, data) => setVersionExtractionMode(data.selectedOptions[0] as 'text' | 'json' | 'regex')}
              >
                {extractionModeOptions.map((option) => (
                  <Option key={option.key} value={option.key}>{option.text}</Option>
                ))}
              </Dropdown>
            </Field>
            <Field label={'版本解析规则'} hint={getExtractionRuleDescription(versionExtractionMode)}>
              <Input value={versionExtractionRule}
                disabled={versionExtractionMode === 'text'}
                placeholder={getExtractionRulePlaceholder(versionExtractionMode)}
                onChange={(e, data) => {
                  setVersionExtractionRule(data.value);
                }} />
            </Field>
            <div className={styles.horizontalStack}>
              <Button onClick={closeModal}>Cancel</Button>
              <Button appearance='primary' onClick={submit}>Save</Button>
            </div>
          </DialogContent>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  )
}

export function EditLabelsModal(props) {
  const { isModalOpened, closeModal, setUpdated, item } = props;
  const [selectedKeys, setSelectedKeys] = React.useState<string[]>([]);
  const [labels, setLabels] = React.useState<LabelProp[]>([]);
  const styles = useStyles();
  const options = labels.map(label => {
    return {
      key: label.name,
      text: label.name,
      data: label
    }
  });
  useEffect(() => {
    if (item && item.labels) {
      const keys = item.labels?.map(label => label.name);
      setSelectedKeys(keys);
    } else {
      setSelectedKeys([]);
    }
  }, [item]);

  useEffect(() => {
    if (item && item.projectAddress && item.privateToken) {
      listLabels(item.projectAddress, item.privateToken).then(labels => {
        setLabels(labels);
      });
    } else {
      setLabels([]);
    }
  }, [item]);

  async function submit() {

    const selectedLabels = selectedKeys.map(key => {
      const label = labels.find(label => label.name === key);
      return label;
    });
    await newProjectProfile({
      profileName: item.profileName,
      projectAddress: item.projectAddress,
      privateToken: item.privateToken,
      labels: selectedLabels,
      versionPath: item.versionPath,
      versionExtractionMode: item.versionExtractionMode,
      versionExtractionRule: item.versionExtractionRule,
    });
    closeModal();
    setUpdated(Date.now());
  }

  return (
    <Dialog open={isModalOpened} onOpenChange={closeModal}>
      <DialogSurface className={styles.surface}>
        <DialogBody>
          <DialogContent className={styles.verticalStack}>
            <Field label="名称">
              <Input value={item?.profileName} readOnly />
            </Field>
            <Field label="预制标签">
              <Dropdown
                multiselect
                selectedOptions={selectedKeys}
                value={selectedKeys.join(', ')}
                onOptionSelect={(e, data) => setSelectedKeys(data.selectedOptions)}

              >
                {labels.map((label) => (
                  <Option text={label.name} key={label.name} value={label.name}>
                    <GitlabLabel name={label.name} color={label.color} textColor={label.textColor} />
                  </Option>
                ))}
              </Dropdown>
            </Field>
            <div className={styles.horizontalStack}>
              <Button onClick={closeModal}>Cancel</Button>
              <Button onClick={submit}>Update</Button>
            </div>
          </DialogContent>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  )
}