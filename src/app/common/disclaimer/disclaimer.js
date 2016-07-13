angular.module('directive.disclaimer', [])

    .directive('disclaimerModalButton', ['$modal', function($modal){
        return {
            restrict: 'AC',
            link: function(scope, elm){
                elm.on('click', function(ev){
                    ev.preventDefault();
                    $modal.open({
                        templateUrl: 'common/disclaimer/disclaimer.tpl.html'
                    });
                })
            }
        }
    }]);