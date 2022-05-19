import { LabelProp } from "./gitlab-label";

export function getUserAgent() {
  return navigator.userAgent;
}

/**
 * create gitlab issue description
 * ## 前提条件
 * 1. 浏览器环境 {userAgent}
 * 1. 测试地址 {orginUrl}
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
export function createIssueMarkDown(userAgent, orginUrl, steps, screenshot, actual, expected) {
  return `
  ## 前提条件
  1. 浏览器环境 ${userAgent}
  1. 测试地址 ${orginUrl}
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
}

export type ProjectsProfile = {
  [profileName: string]: {
    projectAddress: string,
    privateToken: string,
    labels?: LabelProp[],
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
  url: string,
  profile: string
}

/**
 * 
 * @param rulesString 
 */
export function transRules(rulesString: string): Rule[] {
  const rules = rulesString.split('\n');
  return rules.map(rule => {
    // split by ',' or empty space
    const ruleAttr = rule.split(/[,\s]+/);
    return {
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
      labels: profile.labels
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

