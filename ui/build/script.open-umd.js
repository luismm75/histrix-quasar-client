const { resolve } = require('node:path');
const open = require('open');

open(resolve(__dirname, '../umd-test.html'));
