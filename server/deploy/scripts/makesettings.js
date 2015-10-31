#!/usr/bin/env node

var input = process.argv[2];
var output = process.argv[3];
//console.log("i:", input);
//console.log("o:", output);
var fs = require('fs');
var data = JSON.parse(fs.readFileSync(input, {encoding: "utf-8"}));
fs.writeFileSync(output, "# generated from " + input + " \nMETEOR_SETTINGS=" + JSON.stringify(data));


