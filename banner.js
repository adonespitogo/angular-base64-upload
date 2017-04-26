`use strict`

const pkg = require('./package')
var date = new Date();
var n = date.toDateString();
// var time = date.toLocaleTimeString();

module.exports = `/*! ${pkg.title || pkg.name} - ${pkg.version}\n` +
      `* ${pkg.homepage}\n` +
      `* Copyright (c) ${pkg.author} [${n}]\n` +
      `* Licensed ${pkg.license} */\n`