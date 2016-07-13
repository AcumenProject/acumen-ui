angular.module('acumen.collection.explorer.item', [
        'acumen.collection.explorer.item.image',
        'acumen.collection.explorer.item.audio',
        'acumen.collection.explorer.item.video',
        'acumen.collection.explorer.item.document',
        'acumen.service.items',
        'ui.router'
    ])

    .config(['$stateProvider', '$urlMatcherFactoryProvider', function ($stateProvider, $urlMatcherFactoryProvider) {

        $urlMatcherFactoryProvider.type('asset', {
            encode: function(item) {
                // Represent the list item in the URL using its corresponding index
                return item.join('/').replace('/_/', '/');
            },
            decode: function(item) {
                // Look up the list item by index
                item = item.substr(-1) === '/' ? item.substr(0, item.length - 1) : item;
                item = item.split('/');

                var loc = [];
                loc.push(item.join('_'));

                if (item.length > 3){
                    item = item.slice(0, 3);
                }

                loc.push(item.join('_'));

                return loc;
            },
            pattern: /[a-zA-Z][0-9]+(?:\/?[0-9]*){2,}/
        });

        $stateProvider
            .state('collection.explorer.item', {
                url: '^/{repoLoc:asset}?page&limit',
                resolve: {
                    item: ['$stateParams', 'items', 'list',  function($stateParams, items, list){
                        return items.details($stateParams.repoLoc[0]).then(function(data){
                            return data;
                        }, function(response){
                            return true;
                        });

                    }]
                },
                onEnter: function($state, $stateParams, item, list, $location){
                    if (item === true && list.length <= 6 && list[0].type){
                        $location.url(list[0].link);
                        $location.replace();
                    }
                    else if (item !== true && item.metadata.has_children && $stateParams.repoLoc[1] != $stateParams.repoLoc[0]){
                        $stateParams.repoLoc[1] = $stateParams.repoLoc[0];
                        $state.go('collection.explorer.item', $stateParams, {location: false});
                    }
                },
                onExit: ['$rootScope', '$stateParams', function($rootScope, $stateParams){
                    $rootScope.prevItem = $stateParams.repoLoc[0];
                }],
                views: {
                    '': {
                        template: '<div ui-view></div>',
                        controller: ['$scope', '$rootScope', 'item', '$state', '$stateParams', '$timeout', 'hotkeys', '$sce', function($scope, $rootScope, item, $state, $stateParams, $timeout, hotkeys, $sce){

                            if (item !== true){

                                var state = item.metadata.type;
                                if (state === 'audio'){
                                    state += '.transcripts';
                                }

                                $state.go('collection.explorer.item.'+state, $stateParams, {location: false, reload: false, inherit: false});

                            $scope.item = item.metadata;
                            $rootScope.acumen.item = item.metadata;

                            $scope.metadata = false;
                                if (angular.isDefined(item[0].metadata)){
                                    if ($stateParams.repoLoc[0] !== $stateParams.repoLoc[1]){
                                $scope.metadata = item[0].metadata;
                                $rootScope.acumen.item['title'] = item[0].metadata.title;

                                hotkeys.add({
                                    combo: 'i',
                                    description: 'Toggle \'About this item\' panel',
                                    callback: function(){
                                        $scope.toggleState('.metadata')
                                    }
                                });
                            }


                                    if (item[0].metadata.hasOwnProperty('meta_tags')){
                                        $rootScope.acumen.metaTags = item[0].metadata.meta_tags;
                                    }


                            }

                            var prevState = null;

                            $scope.closeDetail = function(){
                                prevState = null;
                                    if ($state.includes('collection.explorer.item.**.**')){
                                        $state.go('^', {location: false, reload: false}, $stateParams).then(function(){
                                        $scope.$broadcast('detail-toggle');
                                    });
                                }
                                };

                                $scope.toggleState = function(toState){
                                    toState = angular.isUndefined(toState) ? false : toState;
                                var rel = '';

                                    if (toState === prevState){
                                        toState = '^';
                                }
                                    else if(!$state.is('collection.explorer.item.'+item.metadata.type)){
                                    rel = '^';
                                }
                                    prevState = toState;

                                    $state.go(rel+toState, $stateParams, {location: false, reload: false}).then(function(){
                                    $scope.$broadcast('detail-toggle');
                                });
                            };

                                if ($state.includes('collection.explorer.item.*')){
                            $timeout(function(){
                                        var elm = document.getElementById($stateParams.repoLoc[0]);
                                var pos = (elm.getAttribute('index') * 230) - (230/2);
                                document.getElementById('items_list').scrollTop = pos;
                            }, 150);
                                }


                            hotkeys.add({
                                combo: 't',
                                description: 'Toggle transcript panel',
                                callback: function(){
                                    $scope.toggleState('.transcripts')
                                }
                            });
                            hotkeys.add({
                                combo: 'g',
                                description: 'Toggle tags panel',
                                callback: function(){
                                    $scope.toggleState('.tags')
                                }
                                });

                            $scope.$on('$destroy', function(){
                                hotkeys.del('i');
                                hotkeys.del('t');
                                hotkeys.del('g');
                            })
                            }

                        }]
                    }
                }
            })
    }]);