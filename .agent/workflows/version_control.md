---
description: How to manage application versions (1.0.0, 1.0.1, etc.)
---

# Version Control Workflow

This guide explains how to save your current application state as a specific version and how to move to the next version.

## 1. Save Current Version
When you are happy with your application and want to "save" it (e.g., as version 1.0.0):

1.  **Check Status**: See what files have changed.
    ```powershell
    git status
    ```

2.  **Stage Changes**: Prepare all files for saving.
    ```powershell
    git add .
    ```

3.  **Commit**: Save the changes with a message.
    ```powershell
    git commit -m "Release version 1.0.0"
    ```

4.  **Tag**: Mark this specific point as "v1.0.0".
    ```powershell
    git tag v1.0.0
    ```

## 2. Start Next Version (e.g., 1.0.1)
To start working on the next version:

1.  **Update Version**: Open `package.json` and change `"version": "1.0.0"` to `"version": "1.0.1"`.

2.  **Make Changes**: Continue coding and developing your app.

3.  **Repeat**: When 1.0.1 is ready, repeat the "Save Current Version" steps (using "1.0.1" instead of "1.0.0").

## 3. Go Back to an Old Version
If you need to see how the app looked at version 1.0.0:

```powershell
git checkout v1.0.0
```

To go back to the latest code:
```powershell
git checkout main
```
