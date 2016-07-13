angular.module('acumen.image.tools', [])
    .service('$imageTools', ['$image', '$document', '$window', '$location', function ImageTools($image, $document, $window, $location){
        var self = this;
        var offset;
        var tool;
        var canvas;
        this.canvasEventPause = false;

        this.current;
        this.prev;

        this.init = function(){
            //var defaultTool = $location.search().tool || 'move';
            var defaultTool = 'move';
            canvas = angular.element($image.canvas);
            offset = getOffset($image.canvas);
            self.select(defaultTool);
            self.zoomSlider.init();
            readyCanvas();
        }

        this.destroy = function(){
            canvas.unbind();
            $document.unbind();
        }

        this.select = function(newTool){
            if (newTool !== self.current){
                self.prev = self.current;
                tool = new Tools[newTool]();
                self.current = newTool;
                /*$location.search('tool', self.current);
                $location.replace();*/
            }
        }

        this.prevTool = function(){
            if (angular.isDefined(self.prev)) self.select(self.prev);
        }

        function readyCanvas(){
            canvas.bind('mousedown', function(ev){
                canvasEvent(ev);
                $document.bind('mousedown', toolCursor);
                $document.bind('mouseup', toolCursor);
                $document.bind('mouseup', toolChangedImage);
            });
            /*canvas.bind('mousemove', function(ev){
             ev = self.mouseLoc(ev);
             if (mouseInBounds($image.x, $image.y, $image.x2, $image.y2, ev.mx, ev.my)){
             if (!hover) hover = true;
             angular.element('body').addClass(self.current);
             canvas.bind('mousedown', canvasEvent);
             }
             else if (hover){
             hover = false;
             angular.element('body').removeClass(self.current);
             }
             });
             canvas.bind('mouseup', toolChangedImage);*/
        }

        function toolCursor(ev){
            if (ev.type == 'mousedown')
                angular.element('body').addClass(self.current);
            else if (ev.type == 'mouseup'){
                angular.element('body').removeClass(self.current);
                $document.unbind('mousedown', toolCursor);
            }
        }

        function canvasEvent(ev){
            if (!self.canvasEventPause){
                ev = self.mouseLoc(ev); //set current mouse (mx, my)
                var func = tool[ev.type];
                if (func){
                    func(ev);
                }
            }
            return ev.preventDefault() && false;
        }

        function toolChangedImage(){
            $image.changed = true;
            canvas.unbind('mouseup', toolChangedImage);
        }

        this.mouseLoc = function(ev){
            ev.mx = ev.pageX - offset.left;
            ev.my = ev.pageY - offset.top;
            return ev;
        }

        function mouseInBounds(x1, y1, x2, y2, mx, my){
            //console.log(mx +' > '+ x1 +' && '+ my +' > '+ y1 +' && '+ mx +' < '+ x2 +' && '+ my +' < '+ y2);
            return (mx > x1 && my > y1 && mx < x2 && my < y2);
        };

        function getOffset(elm){
            var rect = elm.getBoundingClientRect();
            //return {top: rect.top, left: rect.left};
            var doc = elm.ownerDocument;
            var docElem = doc.documentElement;

            return {
                top: rect.top + $window.pageYOffset - docElem.clientTop,
                left: rect.left + $window.pageXOffset - docElem.clientLeft
            };
        }

        this.map = function(val, xMin, xMax, yMin, yMax) {
            return (val - xMax) / (xMin - xMax) * (yMax - yMin) + yMin;
        };

        //Buttons - these are not selectable tools, but perform a single redefined function
        this.zoomSlider = {
            height: 0,
            pos: 0,
            elm: null,
            init: function(){
                self.zoomSlider.height = self.zoomSlider.elm.offsetHeight-2;
                self.zoomSlider.defaultPos();
            },
            defaultPos: function(){ self.zoomSlider.pos = self.map($image.scalar, $image.maxScale, $image.minScale, self.zoomSlider.height, 0); }
        };

        this.zoom = function(ev, delta, deltaX, deltaY){
            // extend event variable with mouse location
            ev = self.mouseLoc(ev);
            var slideBarY;
            var dScale;
            var zoomCenter = true;

            if (!delta){
                var pos = ev.my - self.zoomSlider.height;
                dScale = self.map(pos, 0, self.zoomSlider.height, $image.minScale, $image.maxScale);
                delta = dScale - $image.scalar;
            }
            else{
                delta = delta/10;
                dScale = Math.round(($image.scalar + delta) * 1e1) / 1e1;

                zoomCenter = mouseInBounds($image.x, $image.y, $image.x2, $image.y2, ev.mx, ev.my) ? false : true;
            }

            // If mouse is not over the image, zoom from the center of the image instead of mouse location (ev.mx, ev.my)
            if (zoomCenter){
                ev.mx = ($image.x + $image.x2)/2;
                ev.my = ($image.y + $image.y2)/2;
            }
            //var clipScale = Math.min(Math.max($image.minScale, dScale), $image.maxScale);
            //If dScale is within scale limits
            if (!(dScale < $image.minScale || dScale > $image.maxScale)){

                $image.x = ev.mx - ($image.scalar + delta) * ((ev.mx-$image.x) / $image.scalar);
                $image.y = ev.my - ($image.scalar + delta) * ((ev.my-$image.y) / $image.scalar);

                $image.scalar = dScale;
                $image.width = $image.image.width*$image.scalar;
                $image.height = $image.image.height*$image.scalar;

                $image.draw();
            }
            //set slideBarY position
            slideBarY = self.map(dScale, $image.maxScale, $image.minScale, self.zoomSlider.height, 0);

            //zoom slider bar position - always changes, but differently depending on mousewheel or slider zoom
            self.zoomSlider.pos = Math.min(Math.max(slideBarY, 0), self.zoomSlider.height);
            return ev.preventDefault() && false;
        }

        //Tools - only one can be selected at a time
        var Tools = {
            move: function(){
                var mox = 0;
                var moy = 0;
                var ox = 0;
                var oy = 0;

                this.mousedown = function(ev){
                    mox = ev.mx;
                    moy = ev.my;

                    ox = ev.mx - $image.x;
                    oy = ev.my - $image.y;

                    $document.bind('mousemove', canvasEvent);
                    $document.bind('mouseup', canvasEvent);
                };

                this.mousemove = function(ev){
                    var dx = ev.mx - mox;
                    var dy = ev.my - moy;

                    $image.x = mox + dx - ox;
                    $image.y = moy + dy - oy;

                    x2 = $image.x+$image.width;
                    y2 = $image.y+$image.height;

                    $image.draw();
                }

                this.mouseup = function(){
                    $document.unbind('mousemove', canvasEvent);
                    $document.unbind('mousemove', canvasEvent);
                }
            },
            rotate: function(){
                var cX;
                var cY;
                var clickAngle;

                this.mousedown = function(ev){
                    cX = $image.x + ($image.width/2);
                    cY = $image.y + ($image.height/2);
                    clickAngle = getAngle ( cX , cY , ev.mx, ev.my) - $image.angle;

                    $document.bind('mousemove', canvasEvent);
                    $document.bind('mouseup', canvasEvent);
                }

                this.mousemove = function(ev){
                    $image.angle = getAngle ( cX , cY , ev.mx, ev.my) - clickAngle;
                    $image.draw();
                };

                this.mouseup = function(ev){
                    $document.unbind('mousemove', canvasEvent);
                    $document.unbind('mouseup', canvasEvent);
                }

                /**
                 * angle helper function
                 */
                function getAngle( cX, cY, mx, my ){
                    var angle = Math.atan2(my - cY, mx - cX);
                    return angle;
                }
            }
        }
    }]);