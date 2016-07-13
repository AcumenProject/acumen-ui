angular.module('directive.feedback', [])

    .controller('FeedbackModalCtrl', ['$scope', '$rootScope', '$http', '$modalInstance', function($scope, $rootScope, $http, $modalInstance){
        $scope.feedback = {
            category: 'General feedback or suggestions for improvement'
        };
        $scope.send = function(){
            var url = $rootScope.ENV_PATH + 'api/feedback_email';
            angular.forEach($scope.feedback, function(val, key){
                url += '/' + key + '/' +  encodeURIComponent(val);
            })
            $http.post(url).success(function(){
                $scope.ok();
            })
        }

        $scope.ok = function(){
            $modalInstance.close();
        }

        $scope.cancel = function(){
            $modalInstance.dismiss('cancel');
        }
    }])

    .controller('FeedbackCtrl', ['$scope', '$modal', function($scope, $modal){
        $scope.open = function(){
            var modalInstance = $modal.open({
                templateUrl: 'common/feedback/feedback.tpl.html',
                controller: 'FeedbackModalCtrl'
            })
        }
    }])

    .directive('feedbackModalButton', [function(){
        return {
            restrict: 'AC',
            controller: 'FeedbackCtrl',
            link: function(scope, elm){
                elm.on('click', function(ev){
                    ev.preventDefault();
                    scope.open();
                })
            }
        }
    }]);