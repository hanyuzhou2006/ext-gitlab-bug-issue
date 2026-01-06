import React, { useEffect, useRef } from 'react';
//import { IStackTokens, IDropdownOption } from '@fluentui/react';
import { newProjectProfile } from './util';
import { listLabels } from './apis';
import { GitlabLabel, GitlabLabels, LabelProp } from './gitlab-label';
import { Button, Input, makeStyles, Field, Dialog, DialogActions, DialogBody, DialogContent, DialogTitle, DialogSurface, Dropdown, tokens, Option } from '@fluentui/react-components';

// const stackTokens: IStackTokens = { childrenGap: 20, padding: 20 };

const extractionModeOptions = [
  { key: 'text', text: '全文本' },
  { key: 'json', text: 'JSON' },
  { key: 'regex', text: '正则表达式' },
];

const useStyles = makeStyles({
  // Stack (vertical)
  verticalStack: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    padding: '20px',
    width: '600px', // 对应原来的 styles.root.width
  },
  // Stack (horizontal)
  horizontalStack: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: '40px',
  },
  // Dialog 表面样式
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
  // <Modal isOpen={isModalOpened} onDismiss={closeModal} isBlocking={false}>
  //   <Stack tokens={stackTokens} styles={{
  //     root: {
  //       width: '600px',
  //     }
  //   }}>
  //     <Input ="名称" value={profileName} required onChange={(e, value) => {
  //       setProfileName(value);
  //     }} />
  //     <Input label="GitLab 地址" value={projectAddress} required onChange={(e, value) => {
  //       setProjectAddress(value);
  //     }} />
  //     <Input label="Gitlab private_token" value={privateToken} required onChange={(e, value) => {
  //       setPrivateToken(value);
  //     }} />
  //     <Input label="版本路径" value={versionPath} onChange={(e, value) => {
  //       setVersionPath(value);
  //     }} />
  //     <Dropdown label="版本解析模式" selectedKey={versionExtractionMode} options={extractionModeOptions} 
  //       onChange={(e, option) => {
  //         setVersionExtractionMode(option.key as 'text' | 'json' | 'regex');
  //       }} />
  //     <Input label="版本解析规则" value={versionExtractionRule} 
  //       placeholder={getExtractionRulePlaceholder(versionExtractionMode)}
  //       onChange={(e, value) => {
  //         setVersionExtractionRule(value);
  //       }} 
  //       description={getExtractionRuleDescription(versionExtractionMode)}
  //       disabled={versionExtractionMode === 'text'}
  //     />
  //     <Stack horizontal horizontalAlign='end' tokens={{
  //       childrenGap: 40
  //     }}>
  //       <Button onClick={closeModal}>Cancel</Button>
  //       <Button appearance='primary' onClick={newProfile}>New</Button>
  //     </Stack>
  //   </Stack>
  // </Modal>
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

  // <Modal isOpen={isModalOpened} onDismiss={closeModal} isBlocking={false}>
  //   <Stack tokens={stackTokens} styles={{
  //     root: {
  //       width: '600px',
  //     }
  //   }}>
  //     <TextField label="名称" value={item.profileName} readOnly />
  //     <TextField label="GitLab 地址" defaultValue={item.projectAddress} required componentRef={
  //       projectAddressRef
  //     } />
  //     <TextField label="Gitlab private_token" defaultValue={item.privateToken} required componentRef={
  //       privateTokenRef
  //     } />
  //     <TextField label="版本路径" defaultValue={item.versionPath} componentRef={
  //       versionPathRef
  //     } />
  //     <Dropdown label="版本解析模式" selectedKey={versionExtractionMode} options={extractionModeOptions} 
  //       onChange={(e, option) => {
  //         setVersionExtractionMode(option.key as 'text' | 'json' | 'regex');
  //       }} />
  //     <TextField label="版本解析规则" value={versionExtractionRule} 
  //       placeholder={getExtractionRulePlaceholder(versionExtractionMode)}
  //       onChange={(e, value) => {
  //         setVersionExtractionRule(value);
  //       }} 
  //       description={getExtractionRuleDescription(versionExtractionMode)}
  //       disabled={versionExtractionMode === 'text'}
  //     />
  //     <Stack horizontal horizontalAlign='end' tokens={{
  //       childrenGap: 40
  //     }}>
  //       <Button onClick={closeModal}>Cancel</Button>
  //       <Button onClick={submit}>Update</Button>
  //     </Stack>
  //   </Stack>
  // </Modal>
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

  // function onChange(event: React.FormEvent<HTMLDivElement>, item: IDropdownOption) {
  //   if (item) {
  //     setSelectedKeys(
  //       item.selected ? [...selectedKeys, item.key as string] : selectedKeys.filter(key => key !== item.key),
  //     );
  //   }
  // };

  // function onRenderOption(option): JSX.Element {
  //   const label = option.data as LabelProp;
  //   return <GitlabLabel name={label.name} color={label.color} textColor={label.textColor} />
  // }

  // function onRenderTitle(options) {
  //   const labels = options.map(option => {
  //     return option.data;
  //   });
  //   return <GitlabLabels labels={labels} />;
  // }

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
  // <Modal isOpen={isModalOpened} onDismiss={closeModal} isBlocking={false}>
  //   <Stack tokens={stackTokens} styles={{
  //     root: {
  //       width: '600px',
  //     }
  //   }}>
  //     <TextField label="名称" value={item?.profileName} readOnly />
  //     <Dropdown label="预置标签" options={options} multiSelect selectedKeys={selectedKeys} onChange={onChange}
  //       onRenderOption={onRenderOption} onRenderTitle={onRenderTitle}
  //     />
  //     <Stack horizontal horizontalAlign='end' tokens={{
  //       childrenGap: 40
  //     }}>
  //       <Button onClick={closeModal}>Cancel</Button>
  //       <Button onClick={submit}>Update</Button>
  //     </Stack>
  //   </Stack>
  // </Modal>

}