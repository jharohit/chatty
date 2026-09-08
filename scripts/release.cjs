const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const pkgPath = path.join(rootDir, 'package.json');
const releaseDir = path.join(rootDir, 'release');
const archiveDir = path.join(rootDir, 'release-archive');

// 1. Read current package.json
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const currentVersion = pkg.version;

// 2. Parse arguments (e.g. "patch", "minor", "major", or explicit version like "1.0.1")
const arg = process.argv[2] || 'patch';

function bumpVersion(version, type) {
  const parts = version.split('.').map(Number);
  if (type === 'major') {
    return `${parts[0] + 1}.0.0`;
  } else if (type === 'minor') {
    return `${parts[0]}.${parts[1] + 1}.0`;
  } else if (type === 'patch') {
    return `${parts[0]}.${parts[1]}.${(parts[2] || 0) + 1}`;
  } else if (/^\d+\.\d+\.\d+/.test(type)) {
    return type;
  }
  return `${parts[0]}.${parts[1]}.${(parts[2] || 0) + 1}`;
}

const newVersion = bumpVersion(currentVersion, arg);

console.log(`\n📦 Preparing Release:`);
console.log(`   Current Version: ${currentVersion}`);
console.log(`   New Version:     ${newVersion}\n`);

// 3. Preserve existing DMGs to persistent archive
if (!fs.existsSync(archiveDir)) {
  fs.mkdirSync(archiveDir, { recursive: true });
}

if (fs.existsSync(releaseDir)) {
  const existingFiles = fs.readdirSync(releaseDir);
  for (const file of existingFiles) {
    if (file.endsWith('.dmg') || file.endsWith('.blockmap')) {
      const src = path.join(releaseDir, file);
      const dest = path.join(archiveDir, file);
      fs.copyFileSync(src, dest);
      console.log(`💾 Preserved existing release copy: ${file}`);
    }
  }
}

// 4. Update package.json version
pkg.version = newVersion;
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
console.log(`📝 Updated package.json version to ${newVersion}`);

// Clean up temporary unpacked folders so electron-builder starts fresh
const macArmDir = path.join(releaseDir, 'mac-arm64');
const macX64Dir = path.join(releaseDir, 'mac');
if (fs.existsSync(macArmDir)) fs.rmSync(macArmDir, { recursive: true, force: true });
if (fs.existsSync(macX64Dir)) fs.rmSync(macX64Dir, { recursive: true, force: true });

// 5. Build and Package DMG
console.log(`🔨 Building and packaging new DMG...`);
try {
  execSync('npm run dist', { stdio: 'inherit', cwd: rootDir });
} catch (err) {
  console.error('❌ Build failed. Restoring previous package.json version.');
  pkg.version = currentVersion;
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
  process.exit(1);
}

// 6. Copy all historical versions back into release folder
if (fs.existsSync(archiveDir)) {
  const archived = fs.readdirSync(archiveDir);
  for (const file of archived) {
    if (file.endsWith('.dmg') || file.endsWith('.blockmap')) {
      const src = path.join(archiveDir, file);
      const dest = path.join(releaseDir, file);
      if (!fs.existsSync(dest)) {
        fs.copyFileSync(src, dest);
      }
    }
  }
}

// 7. Output summary
console.log(`\n🎉 Release v${newVersion} created successfully!\n`);
console.log(`📁 All Available DMG Releases:`);
if (fs.existsSync(releaseDir)) {
  const allDmgs = fs.readdirSync(releaseDir).filter((f) => f.endsWith('.dmg'));
  for (const dmg of allDmgs) {
    const stats = fs.statSync(path.join(releaseDir, dmg));
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(1);
    console.log(`   • ${dmg} (${sizeMB} MB)`);
  }
}
console.log('');
