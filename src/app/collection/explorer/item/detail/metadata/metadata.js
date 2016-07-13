angular.module('acumen.collection.explorer.item.metadata', [
        'templateState'
    ])

    .config(['$templateStateProvider', function($templateStateProvider){
        $templateStateProvider.template('metadata', {
            data:{
                itemCss: 'col-xs-7 col-md-6 col-lg-8',
                detailContainer: 'col-xs-5 col-md-6 col-lg-4',
                detailCss: 'detail-metadata-container'
            },
            views: {
                'detail': {
                    templateUrl: 'collection/explorer/item/detail/metadata/metadata.tpl.html'
                }
            }
        })
    }])

    .directive('metadataEmpty', [function(){
        return {
            restrict: 'AC',
            templateUrl: 'collection/explorer/item/detail/metadata/metadata-empty.tpl.html',
            link: function(scope, elm, attrs){
                switch (attrs.metadataEmpty){
                    case 'audio':
                        scope.emptyIcon = 'glyphicon glyphicon-volume-up';
                        break;
                    case 'image':
                        scope.emptyIcon = 'glyphicon glyphicon-picture';
                    case 'video':
                        scope.emptyIcon = 'glyphicon glyphicon-film';
                    default:
                        scope.emptyIcon = 'glyphicon glyphicon-exclamation-sign';
                }
            }
        }
    }]);