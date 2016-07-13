angular.module('mediaElement', [])

    .factory('MediaelementFactory', [function(){
        return {
            video: {
                // initial volume when the player starts
                startVolume: 0.5,
                // useful for <audio> player loops
                loop: false,
                // enables Flash and Silverlight to resize to content size
                enableAutosize: true,
                // the order of controls you want on the control bar (and other plugins below)
                features: ['playpause','progress','current','duration','tracks','volume','fullscreen'],
                // Hide controls when playing and mouse is not over the video
                alwaysShowControls: false,
                // force iPad's native controls
                iPadUseNativeControls: false,
                // force iPhone's native controls
                iPhoneUseNativeControls: false,
                // force Android's native controls
                AndroidUseNativeControls: false,
                // forces the hour marker (##:00:00)
                alwaysShowHours: false,
                // show framecount in timecode (##:00:00:00)
                showTimecodeFrameCount: false,
                // used when showTimecodeFrameCount is set to true
                framesPerSecond: 25,
                // turns keyboard support on and off for this instance
                enableKeyboard: true,
                // when this player starts, it will pause other players
                pauseOtherPlayers: true
            },
            audio: {
                // initial volume when the player starts
                startVolume: 0.5,
                // useful for <audio> player loops
                loop: false,
                // the order of controls you want on the control bar (and other plugins below)
                features: ['playpause','progress','current','duration','tracks','volume'],
                // Hide controls when playing and mouse is not over the video
                alwaysShowControls: true,
                // force iPad's native controls
                iPadUseNativeControls: false,
                // force iPhone's native controls
                iPhoneUseNativeControls: false,
                // force Android's native controls
                AndroidUseNativeControls: false,
                // forces the hour marker (##:00:00)
                alwaysShowHours: false,
                // show framecount in timecode (##:00:00:00)
                showTimecodeFrameCount: false,
                // turns keyboard support on and off for this instance
                enableKeyboard: true,
                // when this player starts, it will pause other players
                pauseOtherPlayers: true
            }
        };
    }])

.directive('mediaelement', ['$timeout', 'MediaelementFactory', function($timeout, me){
        return {
            restrict: 'AC',
            link: function(scope, elm, attrs){
                //console.log('scope');
                $timeout(init, 100);

                function init(){
                    var settings = me[attrs.mediaelement];

                    settings.pluginPath = "<%= env_path %>vendor/mediaelement/";
                    settings.success = function(media){
                        media.load();
                        media.play();
                    };

                    var player = new MediaElementPlayer(attrs.mediaelement, me[attrs.mediaelement]);

                    attrs.$observe('src', function() {
                        load();
                    });

                    function load(){
                        elm.mediaelementplayer(me[attrs.mediaelement]);
                        player.play();
                    }
                }
            }
        }
    }]);