angular.module('acumen.collection.explorer', [
        'acumen.collection.explorer.item',
        'acumen.service.items',
        '8bitsquid.printButton'
    ])
    .config(['$stateProvider', function($stateProvider){
        $stateProvider
            .state('collection.explorer', {
                url: '',
                data: {
                    //default classes for common state views
                    listMenuCss: 'col-xs-12',
                    itemsListCss: 'col-xs-12 col-md-10 col-md-offset-1',
                    listItemCss: 'col-xs-12 col-sm-4 col-md-3 col-lg-2',
                    itemContainerCss: 'hidden',
                    detailContainerCss: 'hidden'
                },
                resolve: {
                    list: ['$stateParams', 'items', function($stateParams, items){
                        return items.collection($stateParams.repoLoc[1], $stateParams.page, $stateParams.limit);
                    }]
                },
                views: {
                    '': {
                        templateProvider: ['$templateFactory', 'acumen', function($templateFactory, acumen){
                            var tpl = acumen.fullscreen ? 'explorer-fullscreen' : 'explorer';
                            return $templateFactory.fromUrl('collection/explorer/' + tpl + '.tpl.html');
                        }],
                        controller: ['$scope', '$state', '$rootScope', '$stateParams', 'hotkeys', function($scope, $state, $rootScope, $stateParams, hotkeys){
                            var prevState;
                            $scope.gridToggle = function(){
                                if (!$state.is('collection.explorer')){
                                    prevState = $state.$current.name;
                                    $state.go('collection.explorer', $stateParams, {location: false, reload: false});
                                }
                                else if (prevState){
                                    $state.go(prevState, {item: $rootScope.prevItem}, {location: false, reload: false}).then(function(){
                                        prevState = null;
                                    });
                                }
                            };

                            $scope.toggleHotKeys = function(){
                                hotkeys.toggleCheatSheet();
                            };
                        }]
                    },
                    'list@collection.explorer': {
                        templateUrl: 'collection/explorer/list/list.tpl.html',
                        controller: ['$scope', '$rootScope', 'list', '$location', '$state', 'hotkeys', function($scope, $rootScope, list, $location, $state, hotkeys){
                            $scope.list = list;

                            $scope.pager = {
                                show: list.metadata.total > list.metadata.limit,
                                total: list.metadata.total,
                                perPage: list.metadata.limit,
                                current: list.metadata.page,
                                max: 16
                            };


                            $rootScope.acumen.list = {
                                items: list,
                                first: ((list.metadata.page-1)*list.metadata.limit)+1,
                                last: list.metadata.page*list.length,
                                total: list.metadata.totals
                            };

                            $scope.pageList = function(){
                                $location.search('page', $scope.pager.current);
                            };

                            if ($scope.pager.show){
                                hotkeys.add({
                                    combo: 'ctrl+right',
                                    description: 'Go to next page in results list',
                                    callback: function(){
                                        if ($scope.pager.current < $scope.pager.numPages){
                                            $scope.pager.current++;
                                            $scope.pageList();
                                        }
                                    }
                                });
                                hotkeys.add({
                                    combo: 'ctrl+left',
                                    description: 'Go to previous page in results list',
                                    callback: function(){
                                        if ($scope.pager.current > 1){
                                            $scope.pager.current--;
                                            $scope.pageList();
                                        }
                                    }
                                });
                            }

                            $scope.$on('$destroy', function(){
                                hotkeys.del('ctrl+left');
                                hotkeys.del('ctrl+right');
                            });

                        }]
                    }
                }
            })
    }])

    .directive('fullscreenExplorer', [function(){
        return {
            restrict: 'AC',
            templateUrl: 'collection/explorer/explorer.tpl.html'
        };
    }])

    .directive('fullscreenButton', ['$rootScope', '$state', '$stateParams', 'hotkeys', 'acumen', function($rootScope, $state, $stateParams, hotkeys, acumen){
        return {
            restrict: 'AC',
            controller: function($scope){
                $scope.selected = acumen.fullscreen;

                $scope.toggle = function(){
                    toggleFullscreen();
                };

                hotkeys.bindTo($scope).add({
                    combo: 'f',
                    description: 'Fullscreen toggle',
                    callback: function(){
                        toggleFullscreen();
                    }
                });

                function toggleFullscreen(){
                    acumen.fullscreen = !acumen.fullscreen;
                    angular.element('body').toggleClass('body-fullscreen');
                    $state.transitionTo($state.current, $stateParams, {
                        reload: true, inherit: true, notify: true, location: false
                    });
                }
            }
        }
    }])

    .directive('listItem', ['$rootScope', '$filter', function($rootScope, $filter){
        return {
            restrict: 'AC',
            link: function(scope){
                scope.pageNum = (scope.$parent.pager.current-1) * scope.$parent.pager.perPage + scope.$index + 1;
                scope.title = $filter('truncate')(scope.item.title, 50);
            }
        }
    }])

    .directive('historyButton', ['$window', function($window){
        return function(scope, elm, attrs){
            var to = attrs.historyButton;
            elm.on('click', function(){
                $window.history[to]();
            })
        }
    }])

    .filter('listTotals', function(){
        return function(totals){
            var t = [];
            angular.forEach(totals, function(val, key){
                t.push(val + ' ' + key);
            });
            return t.join(', ');
        }
    });