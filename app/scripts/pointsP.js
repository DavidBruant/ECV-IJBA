(function(global){
    "use strict";

    var EXPECTED_PROPS = ['id', 'nom', 'type', 'longitude', 'latitude'];
    var VALID_TYPES = ['epci', 'transfert', 'traitement'];
    
    function validate(data){
        if(!Array.isArray(data))
            throw 'data should be an array';
        
        // all properties are present
        data.forEach(function(point, i){
            EXPECTED_PROPS.forEach(function(p){
                if(!(p in point) || point[p] === undefined || point[p] === null)
                    throw 'missing property '+p+' for point id '+point.id+' row number '+i;
            }); 
        });
        
        // valid types
        data.forEach(function(point, i){
            if( VALID_TYPES.indexOf(point.type) === -1){
                throw 'invalid type for point with id '+point.id+" ("+point.type+")";
            }
        });
        
    }
    
    var convertFunctions = {
        id: function(x){
            var res = parseInt(x);
            if(Number.isNaN(res))
                throw 'Invalid id '+x;
            
            return res;
        },
        longitude: function(x){
            var res = parseFloat(x);
            if(Number.isNaN(res))
                throw 'Invalid longitude '+x;
            
            return res;
        },
        latitude : function(x){
            var res = parseFloat(x);
            if(Number.isNaN(res))
                throw 'Invalid latitude '+x;
            
            return res;
        }
    };
    
    global.pointsP = new Promise(function(resolve, reject){
        d3.csv('data/points.csv', function(err, dataset) {
            if(err)
                reject(err);
            else{
                validate(dataset);

                dataset.forEach(function(pt){
                    Object.keys(pt).forEach(function(k){
                        if(k in convertFunctions){
                            pt[k] = convertFunctions[k](pt[k]);
                        }   
                    });
                    
                    Object.freeze(pt);
                });

                Object.freeze(dataset);
                
                resolve(dataset);
            }
        });
    });
    
})(this);