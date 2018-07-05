process.env.NODE_ENV = process.env.NODE_ENV || 'development'

const jsonfile  = require('jsonfile');

var file = __dirname +"/"+ process.env.NODE_ENV + '.json';

const config = jsonfile.readFileSync(file);

console.log('config',config);

module.exports = config; 