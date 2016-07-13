angular.module('acumen.search', [
        'acumen.service.search',
        'ui.router'
    ])

    .config(['$stateProvider', function ($stateProvider) {
                $stateProvider
                    .state('search', {
                        url: '/search/{category:all|audio|books|findingaids|images|manuscripts|maps|research|sheetmusic|universityarchives}/{q}?page&limit',
                        params: {
                            category: {value: 'all'},
                            q: {value: '*:*'},
                            page: {value: "1"},
                            limit: {value: "20"}
                        },
                        resolve: {
                            solr: ['$stateParams', 'solr', function($stateParams, solr){
                                //$stateParams.q = encodeURIComponent($stateParams.q);
                                return solr.search($stateParams);
                            }]
                        },
                        onEnter: ['$rootScope', '$window', '$cookieStore', '$stateParams', '$location', function($rootScope, $window, $cookieStore, $stateParams, $location){
                            if (angular.isUndefined($location.search().noHistory)){
                                $cookieStore.put('prevSearchParams'+$rootScope.token, $stateParams);
                            }

                            $rootScope.acumen.query = $stateParams.q;
                            $rootScope.acumen.cat = $stateParams.category;


                            $window.scrollTo(0,0);
                        }],
                        templateUrl: 'search/search.tpl.html',
                        controller: ['$scope', '$rootScope', '$state', '$stateParams', '$window', 'solr', '$location', '$cookieStore', 'hotkeys',  function ($scope, $rootScope, $state, $stateParams, $window, solr, $location, $cookieStore, hotkeys) {

                            $scope.results = solr;
                            $scope.numFound = solr.metadata.numFound;
                            $scope.queryTime = solr.metadata.queryTime;
                            $scope.page = $stateParams.page;
                            $scope.limit = $stateParams.limit;

                            $scope.pageChanged = function(){
                                $location.search('page', $scope.page);
                            };

                            $rootScope.$on('$stateChangeSuccess', function(){
                                if ($state.includes('collection.**') && $cookieStore.get('prevSearchParams'+$rootScope.token)){
                                    //console.log('state change to search');
                                    $rootScope.acumen.prevSearchParams = $cookieStore.get('prevSearchParams'+$rootScope.token);
                                    $rootScope.acumen.prevSearch = true;
                                }
                                else {
                                    $rootScope.acumen.prevSearch = false;
                                }
                            })

                            if ($scope.numFound) document.getElementById('q').blur();

                            if ($scope.numFound > $scope.limit){
                                hotkeys.add({
                                    combo: 'ctrl+right',
                                    description: 'Next page in search results',
                                    callback: function(){
                                        if ($scope.page < $scope.numPages){
                                            $scope.page++;
                                            $scope.pageChanged();
                                        }
                                    }
                                });

                                hotkeys.add({
                                    combo: 'ctrl+left',
                                    description: 'Previous page in search results',
                                    callback: function(){
                                        if ($scope.page > 1){
                                            $scope.page--;
                                            $scope.pageChanged();
                                        }
                                    }
                                });
                            }

                            $scope.$on('$destroy', function(){
                                hotkeys.del('ctrl+right');
                                hotkeys.del('ctrl+left');
                            });
                        }]
                    });
    }]);