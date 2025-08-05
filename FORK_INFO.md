# Fork Information

## Original Repository
This is a fork of [wppconnect-team/wppconnect-server](https://github.com/wppconnect-team/wppconnect-server)

## Fork Maintainer
**Organization**: Unicaclub  
**Repository**: https://github.com/Unicaclub/Wppconect

## Changes Made in This Fork

### 2025-08-04 - Initial Fork Setup
- ✅ Updated all repository references from `wppconnect-team/wppconnect-server` to `Unicaclub/Wppconect`
- ✅ Changed package name from `@wppconnect/server` to `@unicaclub/wppconnect-server`
- ✅ Updated branding from "WPPConnect-Server" to "Unicaclub-WPPConnect-Server"
- ✅ Fixed code issues in `app.js`:
  - Fixed deprecated `new Buffer()` constructor
  - Improved variable declaration syntax
  - Removed unnecessary require() calls
- ✅ Updated README.md to reflect fork status
- ✅ Updated Git remote to point to Unicaclub repository
- ✅ Updated all configuration files and documentation

## Keeping Up to Date with Upstream

To sync with the original repository:

```bash
# Add upstream remote (only once)
git remote add upstream https://github.com/wppconnect-team/wppconnect-server.git

# Fetch upstream changes
git fetch upstream

# Merge upstream changes into main
git checkout main
git merge upstream/main

# Resolve any conflicts and push to your fork
git push origin main
```

## Credits

Original work by the [WPPConnect Team](https://github.com/wppconnect-team)  
Fork maintained by [Unicaclub](https://github.com/Unicaclub)
