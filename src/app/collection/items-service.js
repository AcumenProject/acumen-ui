angular.module('acumen.service.items', ['restangular'])

    .factory('items', ['Restangular', function(Restangular){
        return {
            exists: function(repoLoc){
                //console.log(repoLoc);
                return Restangular.one('items', repoLoc).all('exists').getList().then(function(data){
                    //console.log(data);
                    return data[0];
                });
            },
            collection: function(repoLoc, page, limit){
                //console.log({repo: repoLoc, page: page, limit: limit});
                return Restangular.one('items', repoLoc).one('page', page).one('limit', limit).getList();
            },
            metadata: function(repoLoc){
                return Restangular.one('items', repoLoc).all('metadata').getList();
            },
            details: function(item){
                return Restangular.one('items', item).all('details').getList();
            },
            tags: function(item){
                return Restangular.one('items', item).all('tags').getList();
            },
            addTags: function(item, tags){
                //console.log(tags);
                    return Restangular.one('tags', item).all('tags').post(tags);

            },
            transcripts: function(item){
                return Restangular.one('items', item).all('transcripts').getList();
            },
            addTranscript: function(item, transcript){
                return Restangular.one('transcripts', item).all('transcript').post(transcript);
            }
        }
    }]);