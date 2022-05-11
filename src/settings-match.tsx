
import React, { useEffect, useState } from 'react';
import { PrimaryButton, TextField, Stack, MessageBar } from '@fluentui/react';
import { getRulesString, saveRulesString } from './util';



export function SettingsMatch() {
  const [rules, setRules] = useState('');
  useEffect(() => {
    getRulesString().then(setRules);
  }, [])
  async function commit(rules: string) {
    saveRulesString(rules);
    setDisabled(true);
  }
  const [disabled, setDisabled] = useState(true);

  return (
    <Stack tokens={{
      childrenGap: 20
    }}>
      <TextField label="智能匹配" multiline value={rules} rows={10} onChange={(e, value) => {
        setRules(value);
        setDisabled(false);
      }} />
      <PrimaryButton text='保存' disabled={disabled} styles={{
        root: {
          width: '100px',
        }
      }} onClick={() => {
        commit(rules);
      }} />
      <MessageBar>
        注意：智能匹配只会匹配第一个条件，如果有多个条件，只会匹配第一个条件。
      </MessageBar>
    </Stack>
  );
}

