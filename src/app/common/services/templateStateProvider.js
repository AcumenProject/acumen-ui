angular.module('templateState', ['ui.router'])
    //Tried my own method that failed. Modified to reflect method shown here: https://github.com/angular-ui/ui-router/issues/1014
    .provider('$templateState', ['$stateProvider', function($stateProvider){
        var templates = {};

        this.state = function(name, definition){
            $stateProvider.state(name, definition);
            if (angular.isDefined(definition.extend)){
                angular.forEach(definition.extend, function(val, key){
                   var temp = {};
                   var type;
                   if (angular.isString(val)){
                       angular.copy(templates[val], temp);
                       type = val;
                   }
                   else if (angular.isObject(val)){
                       angular.copy(templates[key], temp);
                       angular.extend(temp, val);
                       type = key;
                   }
                    $stateProvider.state(name+'.'+type, angular.copy(temp));
                });
            }
        };

        this.template = function(name, template) {
            templates[name] = template;
        };

        this.$get = function(){
        };

    }]);