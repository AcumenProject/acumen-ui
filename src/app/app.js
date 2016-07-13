angular.module('acumen', [
        'ngAnimate',
        'ngCookies',
        'restangular',
        'acumen.templates',
        'chieffancypants.loadingBar',
        'cfp.hotkeys',
        'ui.router',
        'ui.bootstrap',
        'acumen.search',
        'acumen.searchBox',
        'acumen.collection',
        'directive.feedback',
        'directive.disclaimer'
])

    .value('acumen', {
        fullscreen: false
    })

    // Adopted from: https://github.com/angular-ui/ui-router/blob/master/sample/app/app.js
    .run(['$rootScope', '$log', '$state', '$stateParams', '$cookieStore', '$window', '$location', function ($rootScope, $log, $state, $stateParams, $cookieStore, $window, $location){
        // It's very handy to add references to $state and $stateParams to the $rootScope
        // so that you can access them from any scope within your applications.For example,
        // <li ui-sref-active="active }"> will set the <li> // to active whenever
        // 'contacts.list' or one of its decendents is active.
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;
        $rootScope.acumen = {};
        $rootScope.ENV_PATH = '/';

        document.documentElement.setAttribute('data-useragent', navigator.userAgent);
        /*$rootScope.$on("$stateNotFound", function(e, ts, fs) {
         $log.error("$stateNotFound", ts, "from", fs);
         });
         $rootScope.$on("$stateChangeError", function(e, ts, tp, fs, fp, err) {
            $log.error("$stateChangeError", ts, "params", tp, "from", fs, err, "params", fp);
         });
        $rootScope.$on("$stateChangeSuccess", function(e, state, params, fs, fp) {
            $log.log("$stateChangeSuccess", state, "params", params, "from", fs, "params", fp);
         });*/

        $rootScope.$on("$stateChangeStart", function(e, state, params, fs, fp) {
            //$log.log("$stateChangeStart", state, "params", params, "from", fs, "params", fp, "event", e);

            if (state.name.indexOf('collection.explorer') > -1 && fs.name === 'search'){
                $window.scrollTo(0,0);
            }
        });

        $rootScope.$on("$stateChangeError", function(e, ts, tp, fs, fp, err) {
            $log.error("$stateChangeError", ts, "params", tp, "from", fs, err, "params", fp, "event", e);
            $rootScope.error = angular.copy(err);

            $state.go('error', {}, {location: false});
        });


        if ($window.hasOwnProperty('ga')){
            $rootScope.$on("$stateChangeSuccess", function(e, state, params) {
                ga('send', 'pageview', $location.url());
            });
        }



        $rootScope.token = makeToken();

        function makeToken()
        {
            var text = "";
            var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

            for( var i=0; i < 5; i++ )
                text += possible.charAt(Math.floor(Math.random() * possible.length));

            return $cookieStore.get('prevSearchParams'+text) ? makeToken() : text;
        }
    }])

    .config(['$locationProvider', '$stateProvider', '$urlRouterProvider', 'RestangularProvider', function ($locationProvider, $stateProvider, $urlRouterProvider, RestangularProvider){

        $locationProvider.html5Mode(true).hashPrefix('!');
        RestangularProvider.setDefaultHttpFields({cache: true});
        RestangularProvider.setBaseUrl('https://acumen.lib.ua.edu/dev/api');

        RestangularProvider.addResponseInterceptor(function(data, operation, what, url, response, deferred) {
            var extractedData;
            /*console.log({
             'data': data,
             'operation': operation,
             'what': what,
             'url': url,
             'response': response,
             'deferred': deferred
             });*/
            if (operation === "getList"){
                extractedData = data.data;
                if (data.metadata){
                    extractedData.metadata = data.metadata;
                }
                if (data.msg){
                    extractedData.msg = data.msg;
                }
            }
            return extractedData;
        });

        /*$urlRouterProvider.rule(function($injector, $location){
            var path = $location.path();
            var re = /[a-zA-Z][0-9]+[_0-9]*!/;

            if (path === '/'){
                path = $location.hash();
            }

            var match = re.exec(path);
            if (match !== null){
                return match[0].replace(/_/, '/');
            }
        });*/

        $urlRouterProvider.when("/home", "/");
        $urlRouterProvider.otherwise("/");

        $stateProvider
            .state('home', {
                url: '/',
                onEnter: ['$window', function($window){
                    $window.scrollTo(0,0);
                }],
                templateUrl: 'home.tpl.html'
            })
            .state('error', {
                templateUrl: 'error.tpl.html'
            });
    }])

    .controller('AlertCtrl', ['$scope', '$rootScope', '$timeout', function ($scope, $rootScope, $timeout) {
        $scope.showAlerts = false;
        $rootScope.alerts = [];

        $rootScope.addAlert = function(alert) {
            $rootScope.alerts.push(alert);
            if (!$scope.showAlerts) $scope.showAlerts = true;
            $timeout(function(){
                var i = $rootScope.alerts.length-1;
                $rootScope.closeAlert(i);
            }, 4000);
        };

        $rootScope.closeAlert = function(index) {
            $rootScope.alerts.splice(index, 1);
            if ($rootScope.alerts.length > 0){
                $timeout(function(){
                    $scope.showAlerts = false;
                }, 5000);
            }
        };
    }])

    .directive('loadingWrapper', ['$window', '$rootScope', function($window, $rootScope){
        return {
            restrict: 'AC',
            link: function(scope, elm, attrs){
                $rootScope.$on('cfpLoadingBar:started', function(){
                    elm.css('display', 'block');
                });
                $rootScope.$on('cfpLoadingBar:completed', function(){
                    setTimeout(function(){
                        elm.css('display', 'none');
                    }, 1000);
                });
                angular.element($window).bind('scroll', function(ev){
                    if (this.pageYOffset > 51){
                        scope.fixie = true;
                    }
                    else{
                        scope.fixie = false;
                    }
                    scope.$apply();
                });
            }
        }
    }])

    .directive('fixieMenu', ['$window', function($window){
        return {
            restrict: 'AC',
            link: function(scope, elm, attrs){
                var fixieClass = angular.isDefined(attrs.fixieMenuClass) ? attrs.fixieMenuClass : 'fixie';
                var offset = angular.isNumber(attrs.fixieMenuOffset) ? attrs.fixieMenuOffset : (document.getElementById(attrs.fixieMenuOffset).getBoundingClientRect().top + $window.pageYOffset);
                offset -= 20;
                angular.element($window).bind('scroll', fixieScroll);

                function fixieScroll(){
                    if (this.pageYOffset > offset) {
                        var width = elm.css('width');
                        elm.addClass(fixieClass);
                        elm.css('width', width);
                    }
                    else {
                        elm.removeClass(fixieClass);
                        elm.css('width', 'auto');
                    }
                }

                scope.$on('$destroy', function(){
                    angular.element($window).unbind('scroll', fixieScroll);
                });
            }
        }
    }])

    .filter('filesize', function(){
        return function(bytes){
            bytes = angular.isUndefined(bytes) ? 0 : bytes;
            var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
            var i = Math.floor(Math.log(bytes) / Math.log(1024));
            return Math.round((bytes / Math.pow(1024, i))) + ' ' + sizes[i];
        }
    })

    .filter('columnSize', function(){
        return function(numCols){
            return Math.floor(12/Object.keys(numCols).length);
        }
    })


    .filter('truncate', function () {
        return function (text, length, end) {
            if (angular.isDefined(text)){
                if (isNaN(length))
                    length = 10;

                if (end === undefined)
                    end = "...";

                if (text.length <= length || text.length - end.length <= length) {
                    return text;
                }
                else {
                    return String(text).substring(0, length-end.length) + end;
                }
            }
        };
    });