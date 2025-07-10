// createStructure.js
const fs = require('fs');
const path = require('path');

const baseDir = process.cwd();

function createDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
}

function createFile(file) {
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, '');
    console.log(`Created file: ${file}`);
  }
}

function main() {
  const folders = [
    'public',
    'src/app',
    'src/components',
    'src/pages/api',
    'src/pages/api/auth',  // <--- added
    'src/styles',
    'src/lib',
    'src/hooks',
    'src/context',
  ];

  const files = [
    'next.config.js',
    '.env.local',
    '.gitignore',
    'package.json',
    'src/app/layout.js',
    'src/app/page.js',
    'src/app/globals.css',
    'src/components/Header.js',
    'src/components/Footer.js',
    'src/pages/api/auth/[...nextauth].js',
    'src/pages/api/checkout.js',
    'src/lib/stripe.js',
    'src/hooks/useAuth.js',
    'src/context/AuthContext.js',
  ];

  folders.forEach(f => createDir(path.join(baseDir, f)));
  files.forEach(f => createFile(path.join(baseDir, f)));
}

main();
