/* eslint-disable @typescript-eslint/no-require-imports */
// This is a Node.js build script for cross-platform postbuild operations
const fs = require('fs');
const path = require('path');

// Cross-platform postbuild script
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const files = fs.readdirSync(src);
  files.forEach((file) => {
    const srcPath = path.join(src, file);
    const destPath = path.join(dest, file);

    if (fs.lstatSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
}

try {
  console.log('Copying .next/static to .next/standalone/.next/');
  copyDir('.next/static', '.next/standalone/.next/static');

  console.log('Copying public to .next/standalone/');
  copyDir('public', '.next/standalone/public');

  console.log('Postbuild completed successfully');
} catch (error) {
  console.error('Postbuild error:', error);
  process.exit(1);
}
