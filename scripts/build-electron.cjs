const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs');

const outDir = path.resolve(__dirname, '../dist-electron');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function build() {
  try {
    await esbuild.build({
      entryPoints: [
        path.resolve(__dirname, '../electron/main.ts'),
        path.resolve(__dirname, '../electron/preload.ts'),
        path.resolve(__dirname, '../electron/webview-preload.ts'),
      ],
      outdir: outDir,
      bundle: true,
      platform: 'node',
      target: 'node20',
      format: 'cjs',
      outExtension: { '.js': '.cjs' },
      external: ['electron'],
      sourcemap: process.env.NODE_ENV !== 'production',
      minify: process.env.NODE_ENV === 'production',
    });
    console.log('⚡ Electron scripts built successfully');
  } catch (err) {
    console.error('Build error:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  build();
}

module.exports = { build };
