
import React, { useEffect, useState } from 'react';
import { getRulesString, saveRulesString, transRules, serializeRules, getRules } from './util';
import { Rule } from './util';
import { UIEditorMode } from './settings-match-mode-ui';
import { Button, Input, Label, Textarea, makeStyles, MessageBar,MessageBarBody } from '@fluentui/react-components';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    rowGap: '20px',
    alignItems: 'stretch',
  },
  largeButton: {
    width: '200px',
    height: '30px',
  },
  smallButton: {
    width: '100px',
    height: '32px',
  },
});

export enum EditRuleMode {
  UI,
  EDITOR
}

export function SettingsMatch() {
  const [disabled, setDisabled] = useState(true);
  const [rulesString, setRulesString] = useState('');
  const [rules, setRules] = useState<Rule[]>([]);

  const styles = useStyles();
  useEffect(() => {
    getRulesString().then(setRulesString);
  }, [])

  useEffect(() => {
    getRules().then(setRules)
  }, [])
  const [mode, toggleMode] = useMode(rules, setRules, rulesString, setRulesString);

  async function commit(rules: string) {
    saveRulesString(rules);
    setDisabled(true);
  }
  return (
    <div className={styles.container}>
      <Button appearance='primary' className={styles.largeButton} onClick={() => {
        toggleMode()
      }}>切换编辑模式</Button>
      {
        mode === EditRuleMode.UI && (
          <UIEditorMode rules={rules} setRules={(rules) => {
            setRules(rules);
            setDisabled(false);
          }} />
        )
      }
      {
        mode === EditRuleMode.EDITOR && (
          <>
            <Label htmlFor='rules-editor'>智能匹配</Label>
            <Textarea id='rules-editor'
              value={rulesString}
              rows={10}
              onChange={(_e, data) => {
                setRulesString(data.value);
                setDisabled(false);
              }} />
          </>
        )
      }
      <Button appearance='primary' value={'保存'} className={styles.smallButton} onClick={() => {
        if (mode === EditRuleMode.UI) {
          commit(serializeRules(rules));
        } else {
          commit(rulesString);
        }
      }}>保存</Button>
      <MessageBar>
        <MessageBarBody>
        匹配规则是: 网址中包含该关键字
      </MessageBarBody>
      </MessageBar>
      <MessageBar>
        <MessageBarBody>
        注意：智能匹配只会匹配第一个条件，如果有多个条件，只会匹配第一个条件。
      </MessageBarBody>
      </MessageBar>
    </div>
  );
}


function useMode(rules, setRules, rulesString, setRulesString): [EditRuleMode, () => void] {
  const [mode, setMode] = useState<EditRuleMode>(EditRuleMode.UI);
  function toggleMode() {
    if (mode === EditRuleMode.UI) {
      UIToEditor();
    } else {
      EditorToUI();
    }
  }

  function UIToEditor() {
    setRulesString(serializeRules(rules));
    setMode(EditRuleMode.EDITOR);
  }

  function EditorToUI() {
    setRules(transRules(rulesString));
    setMode(EditRuleMode.UI);
  }

  return [mode, toggleMode]
}



