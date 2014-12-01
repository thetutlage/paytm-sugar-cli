require('shelljs/global');
var fs = require('fs'),
path = require('path'),
dependencies = require('./dependencies'),
logs = require('./logs'),
yaml = require('js-yaml'),
_ = require('lodash');

module.exports = {

  setupProject:function(name,parent_answer,cb){
    logs.info('setting up project structure .....');
    setTimeout(function(){
      name = path.join(process.cwd(),name);
      content_dir = path.join(__dirname,'../content');
      mkdir(name);
      cd(name);
      mkdir('core');
      mkdir('core/ROUTES');
      mkdir('apps');
      mkdir('dist');
      fs.readFile(content_dir+'/globals.txt',function(err,output){
        var globals_obj = {
          isCoffee: parent_answer.coding_style == 'Coffee Script' ? true : false,
          app_name: parent_answer.app_name
        };
        var c = _.template(output);
        var globals_file = c(globals_obj);
        fs.writeFile(name+'/globals.yaml',globals_file,function(err){
          if(!err){
            if(typeof(cb) == 'function'){
              cb();
            }
          }else{
            logs.error('Error creating globals.yaml file, terminating process');
          }
        });
      });
    },1000);
  },
  createPackageFile: function(name,dep,dev,parent_answer,cb){
    var self = this;
    var package_object = {
      name: name,
      version: '0.0.0',
      description: "",
      main: "index.js",
      author: "",
      dependencies:dep,
      "devDependencies":dev
    }
    var json = JSON.stringify(package_object,null,4);
    fs.writeFile("package.json",json, function(err) {
      if(err){
        logs.error('Error creating package.json file, terminating process');
        process.exit(1);
      }else{
        logs.success('Done');
        logs.info('installing dependencies .....');
        exec('npm install',function(){
          self.setupGulpFile(name,parent_answer.app_name);
          if(typeof(cb) == 'function'){
            cb();
          }
        });
      }
    });
  },

  setupGulpFile: function(name,app_name){
    logs.info('creating gulpfile.js ...');
    gulp_object = {app:app_name}
    content_dir = path.join(__dirname,'../content');
    fs.readFile(content_dir+'/gulpfile.txt',function(err,content){
      var c = _.template(content);
      var gulp_file = c(gulp_object);
      fs.writeFile(name+'/gulpfile.js',gulp_file,function(err){
        if(!err){
          logs.success('done');
        }else{
          logs.error('error creating gulpfile , termination process...');
          process.exit(1);
        }
      });
    });
  },

  createCoreBootFile: function(name,source,app_name,output,cb){
    name = path.join(process.cwd(),name);
    content_dir = path.join(__dirname,'../content');

    var args = [];
    var require_template = "require '<%= module %>'";
    var dep_for_injection = _.flatten(_.filter(dependencies.dependencies_modules,function(v,k){
      if(_.contains(source,k)){
        return v;
      }
    }));
    _.each(source,function(k){
      var compiled = _.template(require_template);
      args.push(compiled({module:k}));
    });
    var boot_template_object = {
      requires:args.join("\n"),
      deps: dep_for_injection.join("','"),
      app: app_name
    };
    fs.readFile(content_dir+'/boot_template.txt',function(err,content){
      var c = _.template(content);
      var boot_coffee_file = c(boot_template_object);
      fs.writeFile(name+'/core/boot.coffee',boot_coffee_file,function(err){
        if(output !== 'coffee'){
          exec('coffee -p '+name+'/core/boot.coffee',function(err,output){
            fs.writeFile(name+'/core/boot.js',output,function(err){
              fs.unlink(name+'/core/boot.coffee',function(){
                if(typeof(cb) == 'function'){
                  cb();
                }
              });
            });
          });
        }else{
          if(typeof(cb) == 'function'){
            cb();
          }
        }
      });
    });
  },

  createRoutesFile: function(name,source,app_name,output,cb){
    logs.info('creating required files....');
    cd('../');
    name = path.join(process.cwd(),name);
    content_dir = path.join(__dirname,'../content');
    var routes_file = 'routes.txt';
    var routes_object = {
      app: app_name
    };
    if(_.contains(source,'sugar-angularjs-segments')){
      routes_file = 'routes_segment.txt';
    }
    fs.readFile(content_dir+'/'+routes_file,function(err,content){
      var c = _.template(content);
      var routes_file = c(routes_object);
      fs.writeFile(name+'/core/ROUTES/index.coffee',routes_file,function(err){
        console.log(err);
        if(output !== 'coffee'){
          exec('coffee -p '+name+'/core/ROUTES/index.coffee',function(err,output){
            fs.writeFile(name+'/core/ROUTES/index.js',output,function(err){
              fs.unlink(name+'/core/ROUTES/index.coffee',function(){
                if(typeof(cb) == 'function'){
                  cb();
                }
              });
            });
          });
        }else{
          if(typeof(cb) == 'function'){
            cb();
          }
        }
      });
    });
  },

  createNewApp: function(name,cb){
    var self = this;
    var original_name = name;
    name = path.join(process.cwd(),'apps/'+name);
    mkdir(name);
    var content_dir = path.join(__dirname,'../content');
    var globalsFile = path.join(process.cwd(),'/globals.yaml');
    try {
      var doc = yaml.safeLoad(fs.readFileSync(globalsFile, 'utf8'));
      var config_object = {
        isCoffee: doc.use_coffee
      };
      fs.readFile(content_dir+'/config.txt',function(err,output){
        var c = _.template(output);
        var config_file = c(config_object);
        fs.writeFile(name+'/config.yaml',config_file,function(err){
          if(!err){
            logs.success('Done');
            exec('touch '+name+'/app.html');
            mkdir(name+ '/controllers');
            mkdir(name+ '/views');
            mkdir(name + '/assets/sass');
            self.setUpAppBootFile(name,original_name,doc.use_coffee);
          }else{
            logs.error('Error creating config.yaml file, termination process');
          }
        });
      });
    } catch (e) {
      logs.error('Error reading ' + globalsFile + ' , termination process');
      process.exit(1);
    }
  },

  setUpAppBootFile: function(name,original_name,isCoffee){
    var content_dir = path.join(__dirname,'../content');
    logs.info('setting up your app boot file...');
    fs.readFile(content_dir+'/app_boot_template.txt',function(err,output){
      if(output){
        fs.writeFile(name+'/boot.coffee',output,function(err){
          if(err){
            logs.error('unable to create boot file for child app, terminating process');
            process.exit(1);
          }else{
            if(!isCoffee){
              exec('coffee -p '+name+'/boot.coffee',function(err,content){
                if(content){
                  fs.writeFile(name+'/boot.js',content,function(err){
                    if(err){
                      logs.error('unable to create boot file for child app, terminating process');
                      process.exit(1);
                    }else{
                      fs.unlink(name+'/boot.coffee',function(){
                        logs.success('Done');
                        logs.info('Run below commands to kick start your development');
                        logs.success('cd apps/' + original_name);
                        logs.success('gulp watch --app ' + original_name);
                      });
                    }
                  });
                }
              });
            }else{
              logs.success('Done');
              logs.info('Run below commands to kick start your development');
              logs.success('cd apps/' + original_name);
              logs.success('gulp watch --app ' + original_name);
            }
          }
        });
      }
    });
  },

  setUpController: function(name){
    var self = this;
    var configFile = path.join(process.cwd(),'/config.yaml');
    var content_dir = path.join(__dirname,'../content');

    try {
      var doc = yaml.safeLoad(fs.readFileSync(configFile, 'utf8'));
      var path_to_controllers = doc.controllers_path;
      var absolute_path = path.join(process.cwd(),path_to_controllers);
      var extension = '.js';
      if(doc.use_coffee){
        extension = '.coffee';
      }
      var controllerFileName = name+extension;
      var controllerName = name+'Ctrl';
      fs.exists(absolute_path+'/'+controllerFileName,function(exists){
        if(exists){
          logs.error('I am afraid , you already have a controller with ' + name + ' name');
          process.exit(1);
        }else{
          var controller_file = 'js_controller.txt';
          if(doc.use_coffee){
            controller_file = 'coffee_controller.txt';
          }
          fs.readFile(content_dir+'/'+controller_file,function(error,controllerContent){
            if(!error){
              fs.writeFile(absolute_path+'/'+controllerFileName,controllerContent,function(err,done){
                if(err){
                  logs.error('Unable to create ' + name + ' inside ' + absolute_path);
                  process.exit(1);
                }else{
                  var initiater_file = absolute_path+'/index'+extension;
                  self.setupControllerInjector(initiater_file,absolute_path,controllerName,controllerFileName,doc.use_coffee);
                }
              });
            }else{
              logs.error('Unable to setup controller file');
              process.exit(1);
            }
          });
        }
      });
    } catch (e) {
      logs.error('unable to find config.yaml file, make sure you are inside your app directory');
      process.exit(1);
    }
  },

  setupControllerInjector: function(pathInit,absolute_path,controllerName,controllerFileName,isCoffee){
    if(isCoffee){
      var controllerIncludeName = controllerFileName.replace('.coffee','');
    }else{
      var controllerIncludeName = controllerFileName.replace('.js','');
    }
    var controller_string = "app.controller('"+controllerName+"',['$scope',require('./"+controllerIncludeName+"')]);";
    if(isCoffee){
      controller_string = "app.controller '"+controllerName+"', ['$scope',require './"+controllerIncludeName+"']";
    }
    fs.exists(pathInit,function(exists){
      if(exists){
        controller_string = "\n"+controller_string;
        fs.appendFile(pathInit,controller_string,function(err){
          if(err){
            logs.error('unable to initiate controller inside ' + path + ' , do it manually');
            process.exit(1);
          }else{
            logs.success('Controller created successfully');
          }
        });
      }else{
        var project_path = path.join(process.cwd(),'../../globals.yaml');
        try{
          var doc = yaml.safeLoad(fs.readFileSync(project_path, 'utf8'));
          if(isCoffee){
            controller_string = "app = require 'sugar-angularjs' \n .module '"+doc.angular_app+"'\n"+controller_string;
          }else{
            controller_string = "var app = require('sugar-angularjs').module('"+doc.angular_app+"');\n"+controller_string;
          }
          fs.writeFile(pathInit,controller_string,function(err){
            if(err){
              logs.error('unable to initiate controller inside ' + path + ' , do it manually');
              process.exit(1);
            }else{
              logs.success('Controller created successfully');
            }
          });
        }catch(e){
          console.log(e);
          logs.error('unable to find globals.yaml file');
          process.exit(1);
        }
      }
    });
  }
}
