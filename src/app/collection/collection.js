angular.module('acumen.collection', [
        'acumen.collection.explorer',
        'acumen.service.items',
        'ngSanitize'
    ])

    .config(['$stateProvider', '$urlMatcherFactoryProvider',function ($stateProvider, $urlMatcherFactoryProvider) {

        $urlMatcherFactoryProvider.type('collection', {
            encode: function(item) {
                // Represent the list item in the URL using its corresponding index
                item = angular.isArray(item) ? item.join('/') : item;
                return item.replace('/_/', '/');
            },
            decode: function(item) {
                // Look up the list item by index
                item = item.substr(-1) === '/' ? item.substr(0, item.length - 1) : item;
                item = item.split('/');

                //return item.match(/([a-zA-Z][0-9]+_?[0-9]*)([_0-9]+)?/);
                var loc = [];
                loc.push(item.join('_'));

                if (item.length > 3){
                    item = item.slice(0, 3);
                }
                loc.push(item.join('_'));

                return loc;
            },
            pattern: /[a-zA-Z][0-9]+(?:\/?[0-9]*)?/
        });

        $stateProvider
            .state('collection', {
                url: '/{repoLoc:collection}?page&limit',
                abstract: true,
                data: {
                    //default classes for common state views
                    itemsListCss: 'col-xs-12 col-md-10 col-md-offset-1',
                    listItemCss: 'col-xs-12 col-sm-4 col-md-3 col-lg-2',
                    itemContainerCss: 'hidden',
                    detailContainerCss: 'hidden'
                },
                resolve: {
                    metadata: ['$stateParams', 'items', function($stateParams, items){
                        return items.metadata($stateParams.repoLoc[1]);
                    }]
                },
                onEnter: ['$rootScope', 'metadata', function($rootScope, metadata){
                    if (metadata.metadata.children.assets == 0 && metadata.metadata.children.metadata == 0){
                        $rootScope.acumen.asset_explorer = false;
                    }
                    else $rootScope.acumen.asset_explorer = true;

                    $rootScope.acumen.collection = metadata.metadata;
                    $rootScope.acumen.collection.toPage = Math.floor(((metadata.metadata.rank-1)/($rootScope.$stateParams.limit || 40)) + 1);


                }],
                onExit: ['$rootScope', function($rootScope){
                    $rootScope.acumen.collection = false;
                }],
                templateUrl: 'collection/collection.tpl.html',
                controller: ['$scope', 'metadata', '$rootScope', '$sce', 'hotkeys', '$window', function($scope, metadata, $rootScope, $sce, hotkeys, $window){
                    $scope.title = $sce.trustAsHtml(metadata.metadata.title);
                    $scope.metadata = metadata[0];
                    $scope.file = metadata.metadata;
                    $scope.file.file_path = $scope.file.file_path.replace('/content/', $rootScope.ENV_PATH);
                    $scope.total = parseInt(metadata.metadata.children.assets) + parseInt(metadata.metadata.children.metadata);



                    $scope.collapseControls = false;
                    $scope.collapseAll = function(){
                        angular.element(document.getElementsByClassName('initiallyVisible')).addClass('hidden');
                        angular.element(document.getElementsByClassName('initiallyHidden')).addClass('hidden');
                        angular.element(document.getElementsByClassName('title-btn')).addClass('collapsed');
                    };

                    $scope.expandAll = function(){
                        angular.element(document.getElementsByClassName('initiallyVisible')).removeClass('hidden');
                        angular.element(document.getElementsByClassName('initiallyHidden')).removeClass('hidden');
                        angular.element(document.getElementsByClassName('title-btn')).removeClass('collapsed');
                    };

                    hotkeys.add({
                        combo: 'shift+v',
                        description: 'View metadata source',
                        callback: function($event){
                            $event.preventDefault();
                            $window.open($scope.file.file_path);
                        }
                    });

                    $scope.$on('$destroy', function(){
                        hotkeys.del('shift+v');
                    });
                }]
            })
    }])

    .directive('toParent', ['hotkeys', function(hotkeys){
        return {
            restrict: 'AC',
            link: function(scope, elm){
                hotkeys.bindTo(scope).add({
                    combo: 'shift+up',
                    description: 'Go to parent collection/item',
                    callback: function($event){
                        elm.triggerHandler('click');
                    }
                });

                scope.$on('$destroy', function(){
                    hotkeys.del('shift+up');
                })
            }
        }
    }])

    .directive('titleBtn', [function(){
        return {
            restrict: 'AC',
            link: function(scope, elm){
                if (elm.next().hasClass('initiallyHidden')){
                    if (!scope.collapseControls) scope.collapseControls = true;
                    elm.next().addClass('hidden');
                    elm.addClass('collapse-title-btn bg-primary collapsed');
                    elm.bind('click', toggle);
                }
                else if(elm.next().hasClass('initiallyVisible')){
                    if (!scope.collapseControls) scope.collapseControls = true;
                    elm.addClass('collapse-title-btn bg-primary');
                    elm.bind('click', toggle);
                }

                function toggle(){
                    elm.toggleClass('collapsed');
                    elm.next().toggleClass('hidden');
                }
            }
        }
    }])

    .directive('compile', ['$compile', function($compile){
        return {
            restrict: 'AC',
            link: function(scope, elm){
                var element = angular.isObject(scope.metadata) ? angular.element(scope.metadata.value) : angular.element(scope.metadata);
                var metadata = $compile(element)(scope);
                elm.append(metadata);
            }
        }
    }]);