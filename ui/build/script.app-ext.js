const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
const resolvePath = (file) => path.resolve(root, file);
const { blue } = require('chalk');

const writeJson = (file, json) => fs.writeFileSync(file, `${JSON.stringify(json, null, 2)}\n`, 'utf-8');

module.exports.syncAppExt = (both = true) => {
  // make sure this project has an app-extension project
  const appExtDir = resolvePath('app-extension');
  if (!fs.existsSync(appExtDir)) {
    return;
  }

  // make sure this project has an ui project
  const uiDir = resolvePath('ui');
  if (!fs.existsSync(uiDir)) {
    return;
  }

  // get version and name from ui package.json
  const { name, version } = require(resolvePath(resolvePath('ui/package.json')));

  // read app-ext package.json
  const appExtFile = resolvePath('app-extension/package.json');
  const appExtJson = require(appExtFile);
  let finished = false;

  // sync version numbers
  if (both === true) {
    appExtJson.version = version;
  }

  // check dependencies
  if (appExtJson.dependencies !== void 0) {
    if (appExtJson.dependencies[name] !== void 0) {
      appExtJson.dependencies[name] = `^${version}`;
      finished = true;
    }
  }
  // check devDependencies, if not finished
  if (finished === false && appExtJson.devDependencies !== void 0) {
    if (appExtJson.devDependencies[name] !== void 0) {
      appExtJson.devDependencies[name] = `^${version}`;
      finished = true;
    }
  }

  if (finished === true) {
    writeJson(appExtFile, appExtJson);
    console.log(` ⭐️ App Extension version ${blue(appExtJson.name)} synced with UI version.\n`);
    return;
  }

  console.error('   App Extension version and dependency NOT synced.\n');
};
