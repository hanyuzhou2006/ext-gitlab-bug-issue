# Publishing to Microsoft Edge Add-ons

This repository includes a GitHub Actions workflow that automatically publishes the extension to the Microsoft Edge Add-ons store when a new tag is pushed.

## Prerequisites

Before the automated publishing can work, you need to configure the following secrets in your GitHub repository:

### Required Secrets

1. **EDGE_PRODUCT_ID**: The product ID of your Edge extension
   - This is a unique identifier for your extension in the Edge Add-ons store
   - You can find this in the Microsoft Partner Center

2. **EDGE_CLIENT_ID**: The client ID for the Edge Add-ons API
   - Generated in the Microsoft Partner Center API credentials section

3. **EDGE_API_KEY**: The API key for the Edge Add-ons API
   - Generated in the Microsoft Partner Center API credentials section
   - **Important**: API keys expire every 72 days and need to be regenerated

### How to Configure Secrets

1. Go to your repository on GitHub
2. Navigate to **Settings** > **Secrets and variables** > **Actions**
3. Click **New repository secret**
4. Add each of the three secrets listed above

### How to Get API Credentials

Follow the official Microsoft documentation to generate your API credentials:

[Using the Microsoft Edge Add-ons API](https://docs.microsoft.com/en-us/microsoft-edge/extensions-chromium/publish/api/using-addons-api)

The documentation covers:
- How to enable API access in Partner Center
- How to generate Client ID and API Key
- How to find your Product ID

## How to Trigger a Release

Once the secrets are configured, you can trigger a release by pushing a new tag:

```bash
# Create and push a new tag
git tag v0.0.4
git push origin v0.0.4
```

The workflow will automatically:
1. Check out the repository
2. Install dependencies
3. Build the extension
4. Create a zip package
5. Publish to Microsoft Edge Add-ons

## Troubleshooting

If the workflow fails:

1. **Check that all secrets are configured**: Missing or empty secrets will cause the action to fail immediately
2. **Verify the zip file is created**: Check the workflow logs for the "Verify package zip exists" step
3. **Review API error messages**: The Edge Add-ons API may reject the submission for various reasons (e.g., validation errors, existing submission in review, etc.)

For detailed API error codes and their meanings, refer to:
[Microsoft Edge Add-ons API Reference](https://docs.microsoft.com/en-us/microsoft-edge/extensions-chromium/publish/api/addons-api-reference)
