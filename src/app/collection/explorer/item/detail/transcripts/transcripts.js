angular.module('acumen.collection.explorer.item.transcripts', [
        'templateState'
    ])

    .config(['$templateStateProvider', function($templateStateProvider){
        $templateStateProvider.template('transcripts', {
            data:{
                itemCss: 'col-xs-6 col-lg-7',
                detailContainer: 'col-xs-6 col-lg-5',
                detailCss: 'detail-transcript-container'
            },
            resolve: {
                item: ['item', function(item){
                    return item;
                }],
                transcripts: ['item', function(item){
                    return item[0].transcripts;
                }]
            },
            views: {
                'detail': {
                    templateUrl: 'collection/explorer/item/detail/transcripts/transcripts.tpl.html',
                    controller: ['$scope', '$rootScope', '$stateParams', 'transcripts', 'items', 'item', '$cacheFactory', function($scope, $rootScope, $stateParams, transcripts, items, item, $cacheFactory){
                        $scope.master = {};
                        if (transcripts){
                            $scope.transcript = transcripts[0];
                            $scope.master = angular.copy(transcripts[0]);
                        }

                        $scope.isUnchanged = function(transcript){
                            return angular.equals(transcript, $scope.master);
                        };

                        $scope.addTranscript = function(transcript){
                            var t = {transcript: transcript.value};
                            if (transcript.email) t['email'] = transcript.email;
                            items.addTranscript($stateParams.repoLoc[0], t).then(function(){
                                //console.log('Transcript Added!');
                                var $httpDefaultCache = $cacheFactory.get('$http');

                                item[0].transcripts = [transcript];

                                $httpDefaultCache.remove($rootScope.ENV_PATH + 'api/items/'+ $stateParams.repoLoc[0] +'/details');

                                $scope.master = angular.copy(transcript);
                                $rootScope.addAlert({type: 'success', msg: 'Transcript added'});
                            }, function(response){
                                $rootScope.addAlert({type: 'danger', msg: 'Something went wrong! Please try resubmitting transcript.'});
                            })
                        }

                    }]
                }
            }
        })
    }])
    .controller('TranscriptsCtrl', ['$scope', '$stateParams', 'transcripts', 'items', function($scope, $stateParams, transcripts, items){
        $scope.master = $scope.transcript = angular.isDefined(transcripts) ? transcripts[0] : {};
        //console.log($scope.transcript);

        $scope.isUnchanged = function(transcript){
            return angular.equals($scope.master, transcript.value)
        }

        $scope.addTranscript = function(transcript){
            var t = {transcript: transcript.value};
            if (transcript.email) t['email'] = transcript.email;
            items.addTranscript($stateParams.repoLoc[0], t).then(function(){
                //console.log('Transcript Added!');
                $scope.master = transcript.value
            }, function(response){
                //console.log('Error adding transcript:');
                //console.log(response);
            })
        }
    }]);

