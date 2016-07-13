angular.module('acumen.collection.explorer.item.tags', [
        'templateState'
    ])

    .config(['$templateStateProvider', function($templateStateProvider){
        $templateStateProvider.template('tags', {
            data:{
                itemCss: 'col-xs-7 col-md-6 col-lg-8',
                detailContainer: 'col-xs-5 col-md-6 col-lg-4',
                detailCss: 'detail-tags-container'
            },
            resolve: {
                item: ['item', function(item){
                    return item;
                }],
                tags: ['item', function(item){
                    return item[0].tags;
                }]
            },
            views: {
                'detail': {
                    templateUrl: 'collection/explorer/item/detail/tags/tags.tpl.html',
                    controller: 'TagsCtrl'
                }
            }
        })
    }])
    .controller('TagsCtrl', ['$scope', '$rootScope', '$cacheFactory', '$stateParams', 'tags', 'item', 'items', '$location', function($scope, $rootScope, $cacheFactory, $stateParams, tags, item, items, $location){
        angular.copy($scope.tags);
        $scope.tags = tags || [];
        $scope.addTags = function(input){
            input.tags = input.tags.replace(/(\r\n|\n|\r)/gm, ",").split(/,/gm);
            var tags = {tags: input.tags.join()};
            if (input.email) tags['email'] = input.email;

            items.addTags($stateParams.repoLoc[0], tags).then(function(){

                for (var i = 0; i < input.tags.length; i++){
                    var nodupe = input.tags[i];
                    for (var x = 0; x < $scope.tags.length; x++){
                        if (nodupe === $scope.tags[x].value){
                            nodupe = null;
                        }
                    }
                    if (nodupe) $scope.tags.push({value: nodupe, status: "unverified"});
                }
                input.tags = null;
                var $httpDefaultCache = $cacheFactory.get('$http');

                item[0].tags = angular.copy($scope.tags);

                $httpDefaultCache.remove($rootScope.ENV_PATH + 'api/items/'+ $stateParams.repoLoc[0] +'/details');

                $rootScope.addAlert({type: 'success', msg: 'Tags added!'});
                //console.log('Tags Added!');
            }, function(response){
                $rootScope.addAlert({type: 'danger', msg: 'Something went wrong! Please try resubmitting tags.'});
            });
        };

        $scope.tagSearch = function(tag){
            $location.path('search/all/tag:"'+tag.value+'"');

        };
    }])