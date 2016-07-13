angular.module('acumen.collection.explorer.item.document', [
        'acumen.collection.explorer.item.tags',
        'acumen.collection.explorer.item.transcripts',
        'acumen.collection.explorer.item.metadata'
    ])

    .config(['$templateStateProvider', function ($templateState) {

        $templateState
            .state('collection.explorer.item.document', {
                extend: ['tags', 'transcripts', 'metadata'],
                data: {
                    itemCss: 'video-default',
                    itemsListCss: 'col-xs-4 col-md-3 col-lg-2',
                    listItemCss: 'col-xs-12',
                    itemContainerCss: 'col-xs-8 col-md-9 col-lg-10',
                    detailContainer: 'closed',
                    detailCss: 'hidden'
                },
                templateUrl: 'collection/explorer/item/document/document.tpl.html'
            });
    }]);