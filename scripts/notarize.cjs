const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const envPath = path.join(rootDir, '.env');

function loadEnv() {
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx > 0) {
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
        if (!process.env[key]) process.env[key] = val;
      }
    });
  }
}

function getNotaryAuthArgs() {
  loadEnv();

  const keychainProfile = process.env.APPLE_KEYCHAIN_PROFILE;
  if (keychainProfile) {
    return `--keychain-profile "${keychainProfile}"`;
  }

  const appleId = process.env.APPLE_ID;
  const password = process.env.APPLE_APP_SPECIFIC_PASSWORD || process.env.APPLE_PASSWORD;
  const teamId = process.env.APPLE_TEAM_ID || 'LP2ZL75UD2';

  if (appleId && password) {
    return `--apple-id "${appleId}" --team-id "${teamId}" --password "${password}"`;
  }

  // Check if default "chatty-notary" keychain profile exists
  try {
    execSync('xcrun notarytool history --keychain-profile "chatty-notary"', {
      stdio: 'ignore',
    });
    return `--keychain-profile "chatty-notary"`;
  } catch {
    return null;
  }
}

function notarizeAndStapleTarget(targetPath) {
  if (!fs.existsSync(targetPath)) {
    console.warn(`⚠️ Target not found for notarization: ${targetPath}`);
    return false;
  }

  const authArgs = getNotaryAuthArgs();
  if (!authArgs) {
    console.log(
      `\nℹ️  Skipping automatic Apple Notarization (no credentials found in .env or "chatty-notary" keychain profile).`
    );
    console.log(
      `   To enable automatic notarization & stapling on every release, either:`
    );
    console.log(
      `   1) Run once: xcrun notarytool store-credentials "chatty-notary" --apple-id "YOUR_EMAIL" --team-id "LP2ZL75UD2" --password "YOUR_APP_SPECIFIC_PASSWORD"`
    );
    console.log(
      `   2) Or add APPLE_ID and APPLE_APP_SPECIFIC_PASSWORD to .env\n`
    );
    return false;
  }

  const isAppBundle = targetPath.endsWith('.app');
  let submitPath = targetPath;
  let tempZipPath = null;

  try {
    if (isAppBundle) {
      tempZipPath = path.join(path.dirname(targetPath), 'Chatty-notarize-temp.zip');
      if (fs.existsSync(tempZipPath)) fs.unlinkSync(tempZipPath);
      console.log(`\n📦 Zipping ${path.basename(targetPath)} for Apple Notary Service...`);
      execSync(`ditto -c -k --keepParent "${targetPath}" "${tempZipPath}"`, {
        stdio: 'inherit',
      });
      submitPath = tempZipPath;
    }

    console.log(`🚀 Submitting ${path.basename(submitPath)} to Apple Notary Service...`);
    execSync(`xcrun notarytool submit "${submitPath}" ${authArgs} --wait`, {
      stdio: 'inherit',
    });

    console.log(`📎 Stapling notarization ticket to ${path.basename(targetPath)}...`);
    execSync(`xcrun stapler staple "${targetPath}"`, { stdio: 'inherit' });

    console.log(`✅ Validating stapled ticket on ${path.basename(targetPath)}...`);
    execSync(`xcrun stapler validate "${targetPath}"`, { stdio: 'inherit' });

    return true;
  } finally {
    if (tempZipPath && fs.existsSync(tempZipPath)) {
      try {
        fs.unlinkSync(tempZipPath);
      } catch {}
    }
  }
}

// Electron-Builder afterSign hook (runs after signing Chatty.app and BEFORE packaging into DMG)
exports.default = async function afterSign(context) {
  const { electronPlatformName, appOutDir } = context;
  if (electronPlatformName !== 'darwin') return;

  const appName = context.packager.appInfo.productFilename;
  const appPath = path.join(appOutDir, `${appName}.app`);

  console.log(`\n🔐 [afterSign] Signed ${appName}.app — starting automatic notarization & stapling...`);
  notarizeAndStapleTarget(appPath);
};

exports.notarizeAndStapleTarget = notarizeAndStapleTarget;

// Allow running directly from CLI: node scripts/notarize.cjs [optional-path]
if (require.main === module) {
  const customTarget = process.argv[2];
  if (customTarget) {
    notarizeAndStapleTarget(path.resolve(customTarget));
  } else {
    const pkg = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
    const appPath = path.join(rootDir, 'release', 'mac-arm64', 'Chatty.app');
    const dmgPath = path.join(rootDir, 'release', `Chatty-${pkg.version}-arm64.dmg`);

    if (fs.existsSync(appPath)) {
      notarizeAndStapleTarget(appPath);
    }
    if (fs.existsSync(dmgPath)) {
      notarizeAndStapleTarget(dmgPath);
    }
  }
}
