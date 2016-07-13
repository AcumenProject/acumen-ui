angular.module('acumen.collection.explorer.item.video', [
        'mediaElement',
        'acumen.collection.explorer.item.tags',
        'acumen.collection.explorer.item.transcripts',
        'acumen.collection.explorer.item.metadata',
        'ngSanitize'
    ])

    .config(['$templateStateProvider', function ($templateState) {

        $templateState
            .state('collection.explorer.item.video', {
                extend: ['tags', 'transcripts', 'metadata'],
                data: {
                    //default classes for common state views
                    itemCss: 'video-default',
                    itemsListCss: 'col-xs-4 col-md-3 col-lg-2',
                    listItemCss: 'col-xs-12',
                    itemContainerCss: 'col-xs-8 col-md-9 col-lg-10',
                    detailContainer: 'closed',
                    detailCss: 'hidden'
                },
                templateUrl: 'collection/explorer/item/video/video.tpl.html'
            });
    }]);