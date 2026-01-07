import { LabelProp } from "./gitlab-label";

export function getUserAgent() {
  return navigator.userAgent;
}

/**
 * create gitlab issue description
 * ## 前提条件
 * 1. 浏览器环境 {userAgent}
 * 1. 测试地址 {orginUrl}
 * 1. 版本 {version}
 * 1. 测试时间 {now}
 * ## 重现步骤
 * {steps}
 * ## 相关截图
 * {screenshot}
 * ## 实际结果
 * {actual}
 * ## 期望结果
 * {expected}
 * @returns {string}
 */
export function createIssueMarkDown(userAgent: string, orginUrl: string, steps: string,
  screenshot: string, actual: string, expected: string, version?: string) {
  return `
  ## 前提条件
  1. 浏览器环境 ${userAgent}
  1. 测试地址 ${orginUrl}
  1. 版本 ${version}
  1. 测试时间 ${new Date().toLocaleString()}
  ## 重现步骤
  ${steps}
  ## 相关截图
  ${screenshot}
  ## 实际结果
  ${actual}
  ## 期望结果
  ${expected}

  `;

}

export type ProjectProfile = {
  profileName: string,
  projectAddress: string,
  privateToken: string,
  labels?: LabelProp[],
  versionPath: string,
  versionExtractionMode?: 'text' | 'json' | 'regex',
  versionExtractionRule?: string,
}

export type ProjectsProfile = {
  [profileName: string]: {
    projectAddress: string,
    privateToken: string,
    labels?: LabelProp[],
    versionPath: string,
    versionExtractionMode?: 'text' | 'json' | 'regex',
    versionExtractionRule?: string,
  }
}

/**
 * new a gitlab project profile
 * if profileName is `auto`, throw error
 */
export async function newProjectProfile(profile: ProjectProfile) {
  if (profile.profileName === 'auto') {
    throw new Error('auto profile name is not allowed');
  }
  const profiles = await getProjectsProfile();
  profiles[profile.profileName] = {
    projectAddress: profile.projectAddress,
    privateToken: profile.privateToken,
    labels: profile.labels || [],
    versionPath: profile.versionPath || '',
    versionExtractionMode: profile.versionExtractionMode || 'text',
    versionExtractionRule: profile.versionExtractionRule || '',
  }
  await setProjectsProfile(profiles);
}

/**
 * del a gitlab project profile
 */
export async function delProjectProfile(profileName: string) {
  const profiles = await getProjectsProfile();
  delete profiles[profileName];
  await setProjectsProfile(profiles);
  // if it is the selected profile, set default profile to ''
  const selectedProfileName = await getSelectedProfileName();
  if (selectedProfileName === profileName) {
    await setSelectedProfileName('');
  }
}

function serializeProfiles(profiles: ProjectsProfile) {
  return JSON.stringify(profiles);
}

function deserializeProfiles(json: string) {
  // convert labels to array if it is not array
  const profile = JSON.parse(json, (key, value) => {
    if (key === 'labels') {
      if (Array.isArray(value)) {
        // remove null or undefined
        return value.filter(item => item);
      } else {
        return value.split(',').map(label => ({
          name: label,
        }));
      }
    }
    return value;
  });
  return profile;
}

/**
 * set gitlab projects profile
 */
export async function setProjectsProfile(profiles: ProjectsProfile) {
  await chrome.storage.local.set({ 'projectsProfile': serializeProfiles(profiles) });
}

/**
 * get gitlab projects profile
 */
export async function getProjectsProfile(): Promise<ProjectsProfile> {
  const profiles = await chrome.storage.local.get('projectsProfile');
  if (profiles.projectsProfile) {
    return deserializeProfiles(profiles.projectsProfile);
  }
  return {};
}


export async function getProfiles(): Promise<ProjectProfile[]> {
  const projectsProfile = await getProjectsProfile();
  return Object.keys(projectsProfile).map(key => {
    const profile = projectsProfile[key];
    return {
      profileName: key,
      projectAddress: profile.projectAddress,
      privateToken: profile.privateToken,
      labels: profile.labels || [],
      versionPath: profile.versionPath || '',
      versionExtractionMode: profile.versionExtractionMode || 'text',
      versionExtractionRule: profile.versionExtractionRule || '',
    }
  })
}


/**
 * set selected profileName
 */
export async function setSelectedProfileName(profileName: string) {
  await chrome.storage.local.set({ 'selectedProfile': profileName });
}

/**
 * get selected profileName
 */
export async function getSelectedProfileName(): Promise<string> {
  const selectedProfile = await chrome.storage.local.get('selectedProfile');
  if (selectedProfile.selectedProfile) {
    return selectedProfile.selectedProfile;
  }
  return '';
}

/**
 * get selected profile
 */
export async function getSelectedProfile(url: string): Promise<ProjectProfile | null> {
  const selectedProfileName = await getSelectedProfileName();
  if (selectedProfileName === 'auto') {
    return getProfileByUrl(url);
  }
  return await getProjectProfile(selectedProfileName);
}


/**
 * tranlate gitlab project url to gitlab project api address
 * if url is not gitlab project api address, try tranlate it
 * for example http://git.sansi.net:6100/liuxia/test-api will be translated to http://git.sansi.net:6100/api/v4/projects/liuxia%2Ftest-api
 */
export function translateProjectUrl(projectUrl: string) {
  if (projectUrl.indexOf('/api/v4/projects/') > -1) {
    return projectUrl;
  }
  const url = new URL(projectUrl);
  const pathname = url.pathname;
  // replace prefix / to ''
  // replace suffix / to ''
  // replace suffix .git to ''
  const projectName = pathname.replace(/^\//, '').replace(/\/$/, '').replace(/\.git$/, '');
  // encodeURIComponent is used to encode the project name
  return `${url.origin}/api/v4/projects/${encodeURIComponent(projectName)}`;
}

export type Rule = {
  id: number;
  url: string,
  profile: string
}

/**
 * 
 * @param rulesString 
 */
export function transRules(rulesString: string): Rule[] {
  const rules = rulesString.split('\n');
  return rules.map((rule,index) => {
    // split by ',' or empty space
    const ruleAttr = rule.split(/[,\s]+/);
    return {
      id: index + 1,
      url: ruleAttr[0],
      profile: ruleAttr[1]
    }
  }).filter(rule => rule.url && rule.profile);

}

export function saveRulesString(ruleString: string) {
  chrome.storage.local.set({ 'rules': ruleString });
}

export async function getRulesString(): Promise<string> {
  const rules = await chrome.storage.local.get('rules');
  if (rules.rules) {
    return rules.rules;
  }
  return '';
}

export async function getRules(): Promise<Rule[]> {
  const rulesString = await getRulesString();
  return transRules(rulesString);
}

export function serializeRules(rules: Rule[]) {
  return rules.map(rule => `${rule.url} ${rule.profile}`).join('\n');
}

/**
 * 智能匹配规则
 * 模糊匹配 url
 * @param url
 */
export async function matchRules(url: string): Promise<Rule | null> {
  const rules = await getRules();
  const matchedRule = rules.find(rule => {
    return url.indexOf(rule.url) > -1;
  });
  return matchedRule;
}

/**
 * get Project Profile by key
 * 
 */
export async function getProjectProfile(key: string): Promise<ProjectProfile | null> {
  const projectsProfile = await getProjectsProfile();
  if (projectsProfile[key]) {
    const profile = projectsProfile[key];
    return {
      profileName: key,
      projectAddress: profile.projectAddress,
      privateToken: profile.privateToken,
      labels: profile.labels,
      versionPath: profile.versionPath,
      versionExtractionMode: profile.versionExtractionMode || 'text',
      versionExtractionRule: profile.versionExtractionRule || '',
    }
  }
  return null;
}

/**
 * 根据 url 获取 profile
 */
export async function getProfileByUrl(url: string): Promise<ProjectProfile | null> {
  const rule = await matchRules(url);
  if (rule) {
    return await getProjectProfile(rule.profile);
  }
  return null;
}

/**
 * Extract version from text based on extraction mode and rule
 * @param text - The raw text response from version URL
 * @param mode - Extraction mode: 'text', 'json', or 'regex'
 * @param rule - Extraction rule (JSON path for 'json' mode, regex pattern for 'regex' mode)
 * @returns Extracted version string
 * 
 * Note: JSON mode supports simple dot notation (e.g., "version" or "data.version") 
 * but does not support array indices.
 */
export function extractVersion(text: string, mode: 'text' | 'json' | 'regex' = 'text', rule?: string): string {
  if (!text) {
    return '';
  }

  // Default mode: return full text
  if (mode === 'text' || !mode) {
    return text.trim();
  }

  // JSON mode: extract value using JSON path
  if (mode === 'json' && rule) {
    try {
      const json = JSON.parse(text);
      // Support simple JSON path like "version" or "data.version"
      const paths = rule.split('.');
      let value = json;
      for (const path of paths) {
        if (value && typeof value === 'object' && path in value) {
          value = value[path];
        } else {
          return '';
        }
      }
      return String(value).trim();
    } catch (e) {
      console.error('Failed to parse JSON:', e);
      return '';
    }
  }

  // Regex mode: extract value using regex pattern
  if (mode === 'regex' && rule) {
    try {
      const regex = new RegExp(rule);
      const match = text.match(regex);
      if (match) {
        // Return first capture group if exists, otherwise return full match
        return (match[1] !== undefined ? match[1] : match[0]).trim();
      }
      return '';
    } catch (e) {
      console.error('Invalid regex pattern:', e);
      return '';
    }
  }

  return text.trim();
}


