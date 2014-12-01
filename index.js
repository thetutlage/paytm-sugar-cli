#!/usr/bin/env node
var nut = require('nut-cli'),
dependencies = require('./lib/dependencies'),
actions = require('./lib/actions'),
_ = require('lodash'),
logs = require('./lib/logs'),
inquirer = require("inquirer");

nut.bootCommand('sugar');
nut.addCommand('new','[Project Name:String]','Create new project');
nut.addCommand('app','[App Name:String]','Create new child app for your sugar project');
nut.addCommand('controller','[Controller Name:String]','Create new controller');
var commands = nut.parse();

if(commands.new){
  var parent_answer,child_answer,project_name;

  var setUpQuestion = [
    {
      type: 'input',
      name: 'app_name',
      message: 'Enter your angular app name'
    },
    {
      type: 'list',
      name: 'coding_style',
      message: 'Select your language preference',
      choices: ['Coffee Script','Javascript'],
      'default': 'Coffee Script'
    },
    {
      type:'checkbox',
      name: 'dependencies',
      message: 'Select list of dependencies you want to install',
      choices:dependencies.dependencies_keys,
      'default': dependencies.default_dependencies
    }
  ];

  inquirer.prompt(setUpQuestion, function(answer){
    parent_answer = answer;
    var styles = {
      'Coffee Script': 'coffee',
      'Javascript': 'js'
    };
    var output = styles[answer.coding_style]

    var dep_for_package_file = _.object(_.map(dependencies.dependencies_list,function(v,k){
      if(_.contains(parent_answer.dependencies,k)){
        return [k,v];
      }
    }));
    project_name = commands.new;
    actions.setupProject(project_name,parent_answer,function(){
      actions.createPackageFile(project_name,dep_for_package_file,dependencies.dev_dependencies,parent_answer,function(){
        setupCallBack(parent_answer,output);
      });
    });
  });

  function setupCallBack(final_answer,output){
    actions.createRoutesFile(project_name,final_answer.dependencies,final_answer.app_name,output,function(){
      actions.createCoreBootFile(project_name,final_answer.dependencies,final_answer.app_name,output,function(){
        logs.success('completed setup');
        logs.success('cd ' + commands.new);
      });
    });
  }
}

if(commands.app){
  actions.createNewApp(commands.app);
}

if(commands.controller){
  actions.setUpController(commands.controller);
}
