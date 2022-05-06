
import React, { useEffect, useState } from 'react';
import { PrimaryButton, TextField, Stack } from '@fluentui/react';
import { getRulesString, saveRulesString } from './util';



export function SettingsMatch() {
  const [rules, setRules] = useState('');
  useEffect(() => {
    getRulesString().then(setRules);
  }, [])
  async function commit(rules: string) {
    await saveRulesString(rules);
  }
  return (
    <Stack tokens={{
      childrenGap: 20
    }}>
      <TextField label="智能匹配" multiline value={rules} rows={10} onChange={(e, value) => {
        setRules(value);
      }} />
      <PrimaryButton text='保存' styles={{
        root: {
          width: '100px',
        }
      }} onClick={() => {
        commit(rules);
      }} />
    </Stack>
  );
}

