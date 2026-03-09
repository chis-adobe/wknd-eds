#!/usr/bin/env node
/**
 * Copies promo-banner.css and generates ac-promo-banner-template.js from
 * the component library's raw HTML. Run on postinstall so updates reflect.
 * Component library = raw structure only; wknd-eds builds what it needs.
 */
const { copyFileSync, mkdirSync, existsSync, readFileSync, writeFileSync } = require('fs');
const { dirname, join } = require('path');

const root = join(__dirname, '..');
const pkgRoot = join(root, 'node_modules', '@ac-comp-lib', 'component-library');
const cssSrc = join(pkgRoot, 'dist', 'promo-banner.css');
const templateSrc = join(pkgRoot, 'templates', 'promo-banner.html');
const destDir = join(root, 'blocks', 'travel-offer');

if (existsSync(cssSrc)) {
  mkdirSync(destDir, { recursive: true });
  copyFileSync(cssSrc, join(destDir, 'ac-promo-banner.css'));
  console.log('Copied ac-promo-banner.css to blocks/travel-offer/');
} else {
  console.warn('ac-component-library promo-banner.css not found, run npm install');
}

if (existsSync(templateSrc)) {
  const html = readFileSync(templateSrc, 'utf8');
  const escaped = html.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\${/g, '\\${');
  const js = `/**
 * @ac/promo-banner - HTML template (generated from component library, do not edit)
 * Source: @ac-comp-lib/component-library/templates/promo-banner.html
 * Run: npm run postinstall or node scripts/copy-promo-banner.js
 */
export const template = \`${escaped}\`;
`;
  writeFileSync(join(destDir, 'ac-promo-banner-template.js'), js);
  console.log('Generated ac-promo-banner-template.js from component library');
} else {
  console.warn('ac-component-library promo-banner template not found, run npm install');
}
