angular.module('acumen.searchBox', [
        'acumen.service.search'
    ])

.directive('searchBox', ['$state', '$stateParams', '$cookieStore', 'searchCategories', '$rootScope', '$window' ,'hotkeys', function($state, $stateParams, $cookieStore, categories, $rootScope, $window, hotkeys){
        return {
            restrict: 'AC',
            replace: true,
            scope: {},
            templateUrl: 'search_box/search-box.tpl.html',
            controller: ['$scope', '$element', function($scope, $element){
                $scope.acumen = $rootScope.acumen;
                $scope.categories = categories.all();
               // var prevSearch = $cookieStore.get('prevSearchParams'+$rootScope.token);
                //$scope.query = angular.isDefined(prevSearch) ? prevSearch.q : '';


                var initBox = $rootScope.$on('$stateChangeSuccess', function(){
                    //console.log($stateParams.category);
                    $rootScope.acumen.cat = $stateParams.category || 'all';
                    $scope.selected = $scope.categories[$rootScope.acumen.cat];
                    initBox();
                })

                $scope.select = function(cat, $event){
                    $rootScope.acumen.cat = cat;
                    $scope.selected = $scope.categories[cat];
                    $event.preventDefault();
                    $event.stopPropagation();
                    $scope.status.isopen = false;
                    $element.find('input')[0].focus();
                };

                $scope.search = function(){
                    //$cookieStore.put('category', $scope.cat);
                    //$cookieStore.put('q', $rootScope.acumen.query);
                    $state.go('search', {q: $rootScope.acumen.query, category: $rootScope.acumen.cat}, {inherit: false});
                };

                /*$scope.backToSearch = function($event){
                    $event.preventDefault();
                    $window.location.href = $cookieStore.get('prevSearch');
                }*/

                hotkeys.add({
                    combo: 's',
                    description: 'Focus on search box',
                    callback: function(event){
                        event.preventDefault();
                        event.stopPropagation();
                        $element.find('input')[0].focus();
                    }
                });

                $element.find('input').bind('focus', bindHotKeys);
                $element.find('input').bind('blur', unBindHotKeys);


                $scope.$on('$destroy', function(){
                    hotkeys.del('s');
                });


                function bindHotKeys($event){
                    $event.preventDefault();
                    $event.stopPropagation();
                    hotkeys.add({
                        combo: 'alt+0',
                        description: 'Set search to \'All\'',
                        allowIn: ['INPUT'],
                        callback: function(){
                            $scope.cat = 'all';
                            $scope.selected = $scope.categories['all'];
                        }
                    });
                    hotkeys.add({
                        combo: 'alt+1',
                        description: 'Search \'Audio\'',
                        allowIn: ['INPUT'],
                        callback: function(){
                            $scope.cat = 'audio';
                            $scope.selected = $scope.categories['audio'];
                        }
                    });
                    hotkeys.add({
                        combo: 'alt+2',
                        description: 'Search \'Books\'',
                        allowIn: ['INPUT'],
                        callback: function(){
                            $scope.cat = 'books';
                            $scope.selected = $scope.categories['books'];
                        }
                    });
                    hotkeys.add({
                        combo: 'alt+3',
                        description: 'Search \'Findind Aids\'',
                        allowIn: ['INPUT'],
                        callback: function(){
                            $scope.cat = 'findingaids';
                            $scope.selected = $scope.categories['findingaids'];
                        }
                    });
                    hotkeys.add({
                        combo: 'alt+4',
                        description: 'Search \'Images\'',
                        allowIn: ['INPUT'],
                        callback: function(){
                            $scope.cat = 'images';
                            $scope.selected = $scope.categories['images'];
                        }
                    });
                    hotkeys.add({
                        combo: 'alt+5',
                        description: 'Search \'Manuscript Materials\'',
                        allowIn: ['INPUT'],
                        callback: function(){
                            $scope.cat = 'manuscripts';
                            $scope.selected = $scope.categories['manuscripts'];
                        }
                    });
                    hotkeys.add({
                        combo: 'alt+6',
                        description: 'Search \'Maps\'',
                        allowIn: ['INPUT'],
                        callback: function(){
                            $scope.cat = 'maps';
                            $scope.selected = $scope.categories['maps'];
                        }
                    });
                    hotkeys.add({
                        combo: 'alt+7',
                        description: 'Search \'research\'',
                        allowIn: ['INPUT'],
                        callback: function(){
                            $scope.cat = 'research';
                            $scope.selected = $scope.categories['research'];
                        }
                    });
                    hotkeys.add({
                        combo: 'alt+8',
                        description: 'Search \'Sheet Music\'',
                        allowIn: ['INPUT'],
                        callback: function(){
                            $scope.cat = 'sheetmusic';
                            $scope.selected = $scope.categories['sheetmusic'];
                        }
                    });
                    hotkeys.add({
                        combo: 'alt+9',
                        description: 'Search \'University Archives\'',
                        allowIn: ['INPUT'],
                        callback: function(){
                            $scope.cat = 'universityarchives';
                            $scope.selected = $scope.categories['universityarchives'];
                        }
                    });
                }

                function unBindHotKeys(){
                    hotkeys.del('alt+0');
                    hotkeys.del('alt+1');
                    hotkeys.del('alt+2');
                    hotkeys.del('alt+3');
                    hotkeys.del('alt+4');
                    hotkeys.del('alt+5');
                    hotkeys.del('alt+6');
                    hotkeys.del('alt+7');
                    hotkeys.del('alt+8');
                    hotkeys.del('alt+9');
                }

            }]
        }
    }])

    .directive('backToSearch', ['$rootScope', 'hotkeys', function($rootScope, hotkeys){
        return {
            restrict: 'AC',
            link: function(scope){
                hotkeys.add({
                    combo: 'shift+left',
                    description: 'Back to search results',
                    callback: function(){
                        $rootScope.$state.go('search', $rootScope.acumen.prevSearchParams);
                    }
                });

                scope.$on('$destroy', function(){
                    hotkeys.del('shift+left');
                });
            }
        }
    }]);