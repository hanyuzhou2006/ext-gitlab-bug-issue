## Requirements

+ nodejs 18

## Dev

+ npm i --force
+ npm run dev
+ the `prod` folder is the extension 

## Production

+ npm run build
+ the `prod` folder is the extension 

## Gitlab Private Token

+ 通过页面执行创建 issue 时，需要调用 Gitlab API, 需要 api 权限的 token
+ https://docs.gitlab.com/ee/user/profile/personal_access_tokens.html


## Gitlab Restful API
1. [New issue](https://docs.gitlab.com/ee/api/issues.html#new-issue)
1. [Upload a file](https://docs.gitlab.com/ee/api/projects.html#upload-a-file)
1. [List labels](https://docs.gitlab.com/ee/api/labels.html#list-labels)

## Automatic Publishing to Microsoft Edge Add-ons

This repository includes a GitHub Action that automatically publishes the extension to Microsoft Edge Add-ons store when a new tag is pushed.

### Setup

To enable automatic publishing, you need to configure the following secrets in your GitHub repository settings (Settings → Secrets and variables → Actions):

1. **EDGE_PRODUCT_ID**: Your extension's product ID from the Microsoft Edge Add-ons dashboard
2. **EDGE_CLIENT_ID**: Client ID from the Microsoft Edge Add-ons API
3. **EDGE_API_KEY**: API Key from the Microsoft Edge Add-ons API

### How to get the required credentials:

1. Go to [Microsoft Partner Center](https://partner.microsoft.com/dashboard)
2. Navigate to your Edge extension in the dashboard
3. Get the **Product ID** from the extension overview page
4. Go to the **Publish API** section in Partner Center
5. Click **Enable** to opt-in to the API key management experience (if not already enabled)
6. Click **Generate new credentials** to get:
   - **Client ID**: Your unique client identifier
   - **API Key**: Your authentication key (note: expires every 72 days and needs to be updated)
7. Store these values as GitHub secrets in your repository

**Note**: The API uses v1.1 authentication with API keys. The older v1 authentication (using client secrets and access token URLs) will be deprecated on December 31, 2024.

For more information, see the [official Microsoft Edge Extensions API documentation](https://learn.microsoft.com/en-us/microsoft-edge/extensions/update/api/using-addons-api).

### Publishing a new version:

Simply create and push a new tag:

```bash
git tag v0.0.4
git push origin v0.0.4
```

The GitHub Action will automatically build and publish the extension to the Microsoft Edge Add-ons store.
  