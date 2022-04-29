
export function getUserAgent() {
  return navigator.userAgent;
}

/**
 * create gitlab issue description
 * ## 前提条件
 * 1. 浏览器环境 {userAgent}
 * 1. 测试地址 {orginUrl}
 * ## 测试时间
 * {now}
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
  /label ~bug
  `;

}

export type ProjectProfile = {
  profileName: string,
  projectAddress: string,
  privateToken: string,
}

export type ProjectsProfile = {
  [profileName: string]: {
    projectAddress: string,
    privateToken: string,
  }
}

/**
 * new a gitlab project profile
 */
export async function newProjectProfile(profile: ProjectProfile) {
  const profiles = await getProjectsProfile();
  profiles[profile.profileName] = {
    projectAddress: profile.projectAddress,
    privateToken: profile.privateToken,
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


/**
 * set gitlab projects profile
 */
export async function setProjectsProfile(profiles: ProjectsProfile) {
  await chrome.storage.local.set({ 'projectsProfile': JSON.stringify(profiles) });
}

/**
 * get gitlab projects profile
 */
export async function getProjectsProfile(): Promise<ProjectsProfile> {
  const profiles = await chrome.storage.local.get('projectsProfile');
  if (profiles.projectsProfile) {
    return JSON.parse(profiles.projectsProfile);
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
export async function getSelectedProfile(): Promise<ProjectProfile | null> {
  const selectedProfileName = await getSelectedProfileName();
  const projectsProfile = await getProjectsProfile();
  if (selectedProfileName && projectsProfile[selectedProfileName]) {
    const profile = projectsProfile[selectedProfileName];
    return {
      profileName: selectedProfileName,
      projectAddress: profile.projectAddress,
      privateToken: profile.privateToken,
    }
  }
  return null;
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
