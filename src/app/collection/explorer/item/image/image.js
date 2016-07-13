angular.module('acumen.collection.explorer.item.image', [
        'acumen.service.image',
        'acumen.image.tools',
        'acumen.collection.explorer.item.tags',
        'acumen.collection.explorer.item.transcripts',
        'acumen.collection.explorer.item.metadata',
        'ngSanitize',
        'monospaced.mousewheel'
    ])

    .config(['$templateStateProvider', function ($templateState) {

        $templateState
            .state('collection.explorer.item.image', {
                extend: {
                    'tags': {
                        data: {
                            detailContainer: 'col-xs-5 col-md-6 col-lg-4 image-detail',
                            detailCss: 'detail-tags-container'
                        }
                    },
                    'transcripts': {
                        data: {
                            detailContainer: 'col-xs-6 col-lg-5 image-detail',
                            detailCss: 'detail-transcript-container'
                        }
                    },
                    'metadata': {
                        data:{
                            detailContainer: 'col-xs-5 col-md-6 col-lg-4 image-detail',
                            detailCss: 'detail-metadata-container'
                        }
                    }
                },
                data: {
                    //default classes for common state views
                    itemsListCss: 'col-xs-4 col-md-3 col-lg-2',
                    listItemCss: 'col-xs-12',
                    itemContainerCss: 'col-xs-8 col-md-9 col-lg-10',
                    detailContainer: 'closed',
                    detailCss: 'hidden'
                },
                templateUrl: 'collection/explorer/item/image/image.tpl.html'
            });
    }])

    .directive('assetImage', ['$image', '$imageTools', '$timeout', '$window', 'hotkeys', function($image, $imageTools, $timeout, $window, hotkeys){
        return{
            restrict: 'AC',
            link: function(scope, elm){

                var zooming = false;

                scope.imageTools = $imageTools;
                var detailElm = document.getElementsByClassName('item-detail-container')[0];
                $image.init({src: scope.item.asset_path, canvas: elm[0], offset: {width: 40}}).then(function(){
                    scope.imageTools.init();
                });

                scope.$on('detail-toggle', function(){
                    $timeout(function(){
                        $image.refactor({width: detailElm.offsetWidth});
                    }, 100);
                });

                scope.reset = function(){
                    $image.setDefaults();
                    $image.draw();
                    $imageTools.zoomSlider.init();
                };

                scope.mouseZoom = function(event, delta){
                    if (zooming){
                        scope.imageTools.current = delta > 0 ? 'zoom-in' : 'zoom-out';
                        scope.imageTools.zoom(event, delta);
                    }
                };



                hotkeys.add({
                    combo: 'alt',
                    description: 'Toggle image rotate',
                    action: 'keydown',
                    callback: function(){
                        $imageTools.select('rotate');
                    }
                });
                hotkeys.add({
                    combo: 'alt',
                    action: 'keyup',
                    callback: function(){
                        $imageTools.prevTool();
                    }
                });

                hotkeys.add({
                    combo: 'z',
                    description: 'Toggle image mouse wheel zoom',
                    action: 'keypress',
                    callback: function(event){
                        event.preventDefault();
                        if (!zooming){
                            scope.imageTools.prev = scope.imageTools.current;
                            scope.imageTools.current = 'zoom-in';
                            zooming = true;
                        }
                    }
                });

                hotkeys.add({
                    combo: 'z',
                    action: 'keyup',
                    callback: function(){
                        zooming = false;
                        scope.imageTools.current = scope.imageTools.prev;
                    }
                });


                angular.element($window).bind('resize', function(){
                    $image.resizeCanvas();
                    $image.resizeImage();
                    $image.posImage();
                    $image.draw();
                });

                scope.$on('$destroy', function(){
                    hotkeys.del('alt');
                    hotkeys.del('alt');
                    hotkeys.del('z');
                    hotkeys.del('z');
                    $imageTools.destroy();
                });
            }
        }
    }])
    .directive('zoomTool', ['$imageTools', '$document', '$image', function($imageTools, $document, $image){
        return {
            restrict: 'AC',
            link: function(scope, elm){
                scope.imageTools.zoomSlider.elm = elm[0];
                scope.pos = scope.imageTools.zoomSlider.pos;

                elm.bind('mousedown', function(ev){
                    scope.imageTools.canvasEventPause = true;
                    mousemove(ev);
                    $document.bind('mousemove', mousemove);
                    $document.bind('mouseup', mouseup);
                });


                function mousemove(ev){
                    scope.imageTools.zoom(ev);
                    scope.$digest();
                    return ev.preventDefault() && false;
                }

                function mouseup(){
                    $image.changed = true;
                    scope.imageTools.canvasEventPause = false;
                    $document.unbind('mousemove', mousemove);
                    $document.unbind('mouseup', mouseup);
                }
            }
        }
    }]);