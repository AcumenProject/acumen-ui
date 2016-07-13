angular.module('acumen.service.image', [])

    .factory('loadImage', ['$q', function($q){
        return function(src){
            var deferred = $q.defer();
            var img = new Image();

            img.onload = function(){
                deferred.resolve(img);
            };
            img.src = src;

            return deferred.promise;
        }
    }])

    .service('$image', ['$q', function($q){
        var self = this;
        this.canvas = null;
        this.ctx = null;
        this.image = null;
        this.changed = false;
        this.prev = {};

        this.margin = {
            width: 60,
            height: 20
        };
        this.offset = {
            width: 0,
            height: 0
        };

        this.x = 0;
        this.y = 0;
        this.x2 = 0;
        this.y2 = 0;
        this.width = 0;
        this.height = 0;
        this.scalar = 1;
        this.minScale = .2;
        this.maxScale = 1.4;
        this.angle = 0;

        this.setDefaults = function(){
            self.resizeCanvas();
            self.changed = false;
            self.x = 0;
            self.y = 0;
            self.angle = 0;
            self.setScale();
            self.resizeImage();
            self.center();
            //console.log({changed: self.changed});
        };

        this.refactor = function(offset){
            if (offset.width !== self.width){
                self.setOffset(offset);
                if (!self.changed){
                    self.setDefaults();
                }
                else{
                    var x = self.x + (self.prev.canvas_width - self.canvas.width)/2;
                    var y = self.y + (self.prev.canvas_height - self.canvas.height)/2
                    if (x > 0 && (self.x+self.width) < (self.canvas.width - self.margin.width - self.offset.width)) self.x = x;
                    if (y > 0 && (self.y+self.height) < (self.canvas.height - self.margin.height - self.offset.height)) self.y = y;
                    //if ((self.x - dx) > 0 && dx < (self.x+self.width)) self.x -= dx;
                    //if ((self.y - dy) > 0 && dy < (self.y+self.height)) self.y -= dy;

                }
                self.draw();
            }
        };

        this.init = function(params){
            var deferred = $q.defer();
            if (params.src){
                if (params.offset) {
                    self.setOffset(params.offset);
                }
                self.canvas = params.canvas;
                self.ctx = self.canvas.getContext('2d');
                self.loadImage(params.src).then(function(){
                    self.resizeCanvas();
                    self.setDefaults();
                    self.draw();
                    deferred.resolve();
                });
            }
            else{
                deferred.reject('No image src given.');
            }
            return deferred.promise;
        }
        
        this.setOffset = function(offset){
            if (self.offset.width !== offset.width) self.offset.width = offset.width;
        }
        
        this.loadImage = function(src){
            var deferred = $q.defer();
            self.image = new Image();

            self.image.onload = function(){
                deferred.resolve();
            };
            self.image.src = src;
            return deferred.promise;
        };

        this.draw = function(){
            // Clear the canvas
            self.clear();
            // Save matrix state
            self.ctx.save();

            // Translate matrix to (x, y) then scale matrix
            self.ctx.translate(self.x, self.y);
            self.ctx.scale(self.scalar, self.scalar);

            // Translate matrix to (x, y) values representing the distance to the image's center
            self.ctx.translate(self.image.width/2, self.image.height/2);
            // Rotate matrix
            self.ctx.rotate(self.angle);
            // Translate matrix back to state before it was translated to the (x, y) matching the image's center
            self.ctx.translate(-self.image.width/2, -self.image.height/2);

            // Draw image to canvas
            self.ctx.drawImage(self.image, 0, 0);
            // Restore matrix to it's saved state.
            // If the matrix was not saved, then altered, then restored
            // 	for every draw, then the transforms would stack (i.e., without save/restore
            //	and image at scale 1, scaled to 1.2, then scale to 1 would result in a final scale
            // 	of 1.2 - because (1 * 1.2) * 1 = 1.2
            self.ctx.restore();

            self.x2 = self.x + self.width;
            self.y2 = self.y + self.height;
        };

        this.setScale = function(){
            var width_ratio = (self.canvas.width - self.margin.width - self.offset.width) / self.image.width;
            var height_ratio = (self.canvas.height - self.margin.height - self.offset.height) / self.image.height;
            self.scalar = Math.min(width_ratio, height_ratio);
            /*console.log({w_ratio: width_ratio, h_ratio: height_ratio});
            console.log('width_ratio = ('+self.canvas.width+' - ('+self.margin.width+' + '+self.offset.width+')) / '+self.image.width);
            console.log('height_ratio = ('+self.canvas.height+' - ('+self.margin.height+' + '+self.offset.height+')) / '+self.image.height);*/
        };

        this.clear = function(){
            self.ctx.clearRect(0, 0, self.canvas.width, self.canvas.height);
        };

        this.resizeCanvas = function(){
                self.prev.canvas_width = self.canvas.width;
                self.prev.canvas_height = self.canvas.height;

                self.canvas.style.width = '100%';
                self.canvas.style.height = '100%';

                self.canvas.width = self.canvas.offsetWidth;
                self.canvas.height = self.canvas.offsetHeight;
        };

        this.resizeImage = function(){
            self.width = self.image.width*self.scalar;
            self.height = self.image.height*self.scalar;
        };

        this.center = function(){
            self.x = ((self.canvas.width - self.offset.width) - self.width)/2;
            self.y = ((self.canvas.height) - self.height)/2;
        };

        this.scaleXY = function(newWidth, newHeight){
            self.x = newWidth/self.canvas.width;
            self.y = newHeight/self.canvas.height;
        };

        this.posImage = function(){
            if (!self.changed){
                self.center();
            }
            else{
                self.x *= self.canvas.width/self.prev.canvas_width;
                self.y *= self.canvas.height/self.prev.canvas_height;
            }

            //console.log(self);
        };
    }]);
