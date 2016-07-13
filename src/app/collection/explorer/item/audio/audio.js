angular.module('acumen.collection.explorer.item.audio', [
        'mediaElement',
        'acumen.collection.explorer.item.tags',
        'acumen.collection.explorer.item.transcripts',
        'acumen.collection.explorer.item.metadata',
        'ngSanitize'
    ])

    .config(['$templateStateProvider', '$stateProvider', function ($templateState, $stateProvider) {

        $stateProvider
            .state('collection.explorer.item.audio', {
                data: {
                    //default classes for common state views
                    itemsListCss: 'col-xs-6',
                    listItemCss: 'col-xs-12 col-md-4 col-lg-3',
                    itemContainerCss: 'col-xs-6',
                    detailContainer: 'audio-detail-container',
                    detailCss: 'hidden'
                },
                templateUrl: 'collection/explorer/item/audio/audio.tpl.html'
            })
            .state('collection.explorer.item.audio.tags', {
                params: {
                    detail: {value: 'transcript'}
                },
                data:{
                    detailCss: 'audio-detail',
                    detailContainer: 'audio-detail-container full-width',
                    itemMetadataCss: 'hidden'
                },
                resolve: {
                    tags: ['item', function(item){
                        return item[0].tags;
                    }]
                },
                views: {
                    'detail@collection.explorer.item.audio': {
                        templateUrl: 'collection/explorer/item/detail/tags/tags.tpl.html',
                        controller: 'TagsCtrl'
                    }
                }
            })
            .state('collection.explorer.item.audio.transcripts', {
                params: {
                    item: {},
                    repoLoc: {},
                    page: {value: 1},
                    limit: {value: 40}
                },
                data:{
                    detailCss: 'audio-detail',
                    detailContainer: 'audio-detail-container full-width',
                    itemMetadataCss: 'hidden'
                },
                resolve: {
                    transcripts: ['item', function(item){
                        return item[0].transcripts;
                    }]
                },
                views: {
                    'detail@collection.explorer.item.audio': {
                        templateUrl: 'collection/explorer/item/detail/transcripts/transcripts.tpl.html',
                        controller: 'TranscriptsCtrl'
                    }
                }
            })
    }]);