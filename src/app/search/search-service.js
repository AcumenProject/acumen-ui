angular.module('acumen.service.search', [
        'restangular'
    ])

    .factory('searchCategories', [function(){
        var categories = {
            'all': {'title': 'All', fq:'', placeHolder: 'Search all collections in Acumen'},
            'audio': {'title':'Audio', 'fq': '{!lucene}asset_type:audio', placeHolder: 'Search for audio recordings'},
            'books': {'title': 'Books', 'fq': '{!lucene}repo_loc:?0002*', placeHolder: 'Search for books'},
            'findingaids': {'title': 'Finding Aids', 'fq': '{!lucene}repo_loc:?0003* +type:Archived', placeHolder: 'Search finding aids'},
            'images': {'title': 'Images', 'fq': '{!lucene}(repo_loc:(?0001* OR ?0011*) OR (genre:photographs OR genre:"picture postcards")) AND type:image', placeHolder: 'Search for images'},
            'manuscripts': {'title': 'Manuscript Materials', 'fq': '{!lucene}repo_loc:?0003* -type:Archived', placeHolder: 'Search manuscripts'},
            'maps': {'title': 'Maps', 'fq': 'map AND asset_type:image -type:music', placeHolder: 'Search for maps'},
            'research': {'title': 'Research', 'fq': '{!lucene}repo_loc:?0015*', placeHolder: 'Search research and dissertation materials'},
            'sheetmusic': {'title': 'Sheet Music', 'fq': '{!lucene}repo_loc:?0004*', placeHolder: 'Search for sheet music'},
            'universityarchives': {'title': 'University Archives', 'fq': '{!lucene}repo_loc:?0006*', placeHolder: 'Search archived university materials'}
        };

        return {
            fq: function(cat){
                return categories[cat].fq;
            },
            all: function(){
                return categories;
            }
        };
    }])

    .factory('solrURI', ['searchCategories', function(categories){
        return {
            build: function(params){
                var uri = '';

                if (params.category && !params.fq){
                    params.fq = categories.fq(params.category);
                }

                angular.forEach(params, function(val, param){
                    if (val !== null && param != 'category'){
                        uri += '/'+ param +'/'+ val;
                    }
                });
                return uri;
            }
        };
    }])

    .factory('solr', ['Restangular', 'searchCategories', function(Restangular, categories){
        return {
            search: function(params){
                var search = Restangular.one('search', params.q).one('page', params.page).one('limit', params.limit);

                if (params.category) {
                    search = search.one('fq', categories.fq(params.category));
                }

                return search.getList();
            }
        };
    }]);