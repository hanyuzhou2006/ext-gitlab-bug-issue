import { LabelProp } from "./gitlab-label";
import { translateProjectUrl } from "./util";
export async function uploadImage(projectAddress: string, privateToken: string, file: Blob) {
  const projectApiUrl = translateProjectUrl(projectAddress);
  const formData = new FormData();
  formData.append('file', file, 'screenshot.png');
  const res = await fetch(`${projectApiUrl}/uploads`, {
    method: 'POST',
    headers: {
      'PRIVATE-TOKEN': privateToken
    },
    redirect: 'follow',
    body: formData
  });
  if (res.status >= 200 && res.status < 400) {
    const data = await res.json();
    return data.markdown;
  } else {
    try {
      const data = await res.json();
      console.log(data);
      throw new Error(JSON.stringify(data.message));
    } catch (_e) {
      throw new Error(`upload image failed, status: ${res.status}`);
    }
  }

}

export async function newIssue(projectAddress: string, privateToken: string, title: string, markdown: string,
  labels: LabelProp[]) {
  const description = markdown;
  const projectApiUrl = translateProjectUrl(projectAddress);
  const issueLabels = labels.map(label=>label.name).join(",");

  const res = await fetch(`${projectApiUrl}/issues`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'PRIVATE-TOKEN': privateToken
    },
    body: JSON.stringify({
      title,
      description,
      labels: issueLabels
    })
  })
  if (res.status >= 200 && res.status < 400) {
    const data = await res.json();
    return data;
  } else {
    try {
      const data = await res.json();
      console.log(data);
      throw new Error(JSON.stringify(data.message));
    } catch (_e) {
      throw new Error(`create issue failed, status: ${res.status}`);
    }
  }

}


export async function listLabels(projectAddress: string, privateToken: string) {
  const projectApiUrl = translateProjectUrl(projectAddress);
  const res = await fetch(`${projectApiUrl}/labels?per_page=100`, {
    method: 'GET',
    headers: {
      'PRIVATE-TOKEN': privateToken
    }
  })
  if (res.status >= 200 && res.status < 400) {
    const data = await res.json();
    const initalData = data.map(item => ({
      name: item.name,
      color: item.color,
      textColor: item.text_color,
    }));
    // 去重
    const uniqueData = initalData.filter((item, index, self) =>
      index === self.findIndex(t => (
        t.name === item.name
      ))
    );
    return uniqueData;
  } else {
    try {
      const data = await res.json();
      console.log(data);
      throw new Error(JSON.stringify(data.message));
    } catch (_e) {
      throw new Error(`list labels failed, status: ${res.status}`);
    }
  }
}