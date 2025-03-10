process.env.NODE_ENV = 'production';

const parallel = require('node:os').cpus().length > 1;
const runJob = parallel ? require('node:child_process').fork : require;
const { join } = require('node:path');
const { createFolder } = require('./utils');
const { green, blue } = require('chalk');

console.log();

require('./script.app-ext.js').syncAppExt();
require('./script.clean.js');

console.log(
  ` 📦 Building ${green(`v${require('../package.json').version}`)}...${parallel ? blue(' [multi-threaded]') : ''}\n`
);

createFolder('dist');

runJob(join(__dirname, './script.javascript.js'));
runJob(join(__dirname, './script.css.js'));
