var logSymbols = require('log-symbols'),
chalk = require('chalk');

module.exports = {
  success: function(message){
    console.log(logSymbols.success,chalk.green(message));
  },
  error: function(message){
    console.log(logSymbols.error,chalk.red(message));
  },
  info: function(message){
    console.log(logSymbols.info,chalk.cyan(message));
  },
  warning: function(message){
    console.log(logSymbols.warning,chalk.magenta(message));
  }
}
