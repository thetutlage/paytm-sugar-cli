
var dependencies_list = {
  'sugar-angularjs'           : 'git://github.com/thetutlage/sugar-angularjs.git',
  'sugar-angularjs-routes'    : 'git://github.com/thetutlage/sugar-angularjs-routes.git',
  'sugar-nganimate'           : 'git://github.com/thetutlage/sugar-nganimate.git',
  'sugar-angularjs-segments'  : 'git://github.com/thetutlage/sugar-angularjs-segments.git',
  'sugar-underscore'          : 'git://github.com/thetutlage/sugar-underscore.git',
  'sugar-gramophone'          : 'git://github.com/thetutlage/sugar-gramophone.git',
  'angular-cache'             : 'git://github.com/jmdobry/angular-cache',
  'sugar-uiModal'             : 'git://github.com/jmdobry/angular-cache'
};

var dependencies_modules = {
  'sugar-angularjs-routes' : ['ngRoute'],
  'sugar-nganimate' : ['ngAnimate'],
  'sugar-angularjs-segments' : ['route-segment', 'view-segment'],
  'sugar-underscore': ['underscore'],
  'sugar-gramophone': ['gramophone.core'],
  'angular-cache' : ['angular-data.DSCacheFactory'],
  'sugar-uiModal': ['uiModal.slate']
};

var dev_dependencies = {
  "browserify": "^6.3.2",
  "compression": "^1.2.0",
  "event-stream": "^3.1.7",
  "gulp": "^3.8.10",
  "gulp-angular-templatecache": "^1.4.2",
  "gulp-autoprefixer": "^2.0.0",
  "gulp-browserify": "^0.5.0",
  "gulp-clean": "^0.3.1",
  "gulp-coffee": "^2.2.0",
  "gulp-concat": "^2.4.1",
  "gulp-gzip": "0.0.8",
  "gulp-if": "^1.2.5",
  "gulp-minify-css": "^0.3.11",
  "gulp-ng-annotate": "^0.3.6",
  "gulp-ruby-sass": "^0.7.1",
  "gulp-uglify": "^1.0.1",
  "gulp-util": "^3.0.1",
  "gulp-watch": "^2.0.0",
  "gulp-yaml": "^0.2.2",
  "yargs": "^1.3.3"
};

var dependencies_keys = Object.keys(dependencies_list);
var default_dependencies = [dependencies_keys[0],dependencies_keys[1]];

module.exports = {
  dependencies_list : dependencies_list,
  dev_dependencies  : dev_dependencies,
  dependencies_keys: dependencies_keys,
  default_dependencies: default_dependencies,
  dependencies_modules:dependencies_modules
}
