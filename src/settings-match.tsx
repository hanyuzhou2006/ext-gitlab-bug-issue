
import React, { useEffect, useState } from 'react';
import { PrimaryButton, TextField, Stack, MessageBar } from '@fluentui/react';
import { getRulesString, saveRulesString, transRules, serializeRules, getRules } from './util';
import { Rule } from './util';
import { UIEditorMode } from './settings-match-mode-ui';

export enum EditRuleMode {
  UI,
  EDITOR
}

export function SettingsMatch() {
  const [disabled, setDisabled] = useState(true);
  const [rulesString, setRulesString] = useState('');
  const [rules, setRules] = useState<Rule[]>([]);
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
    <Stack tokens={{
      childrenGap: 20
    }}>
      <PrimaryButton styles={{
        root: { width: '200px' }
      }} onClick={() => {
        toggleMode()
      }}>切换编辑模式</PrimaryButton>
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
          <TextField label="智能匹配" multiline value={rulesString} rows={10} onChange={(e, value) => {
            setRulesString(value);
            setDisabled(false);
          }} />
        )
      }
      <PrimaryButton text='保存' disabled={disabled} styles={{
        root: {
          width: '100px',
        }
      }} onClick={() => {
        if(mode === EditRuleMode.UI){
          commit(serializeRules(rules));
        }else{
          commit(rulesString);
        }
      }} />
      <MessageBar>
        匹配规则是: 网址中包含该关键字
      </MessageBar>
      <MessageBar>
        注意：智能匹配只会匹配第一个条件，如果有多个条件，只会匹配第一个条件。
      </MessageBar>
    </Stack>
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

