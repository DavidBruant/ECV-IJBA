(function(global){
    "use strict";

    var EXPECTED_PROPS = ['depart', 'arrivee', 'poids', 'distance', 'co2'];
    
    function validate(data){
        if(!Array.isArray(data))
            throw 'data should be an array';
        
        // all properties are present
        data.forEach(function(point, i){
            EXPECTED_PROPS.forEach(function(p){
                if(!(p in point) || point[p] === undefined || point[p] === null)
                    throw 'missing property '+p+' for trajet '+point.depart+' => '+point.arrivee+' row number '+i;
            }); 
        });
    }
    
    var convertFunctions = {
        depart: function(x){
            var res = parseInt(x);
            if(Number.isNaN(res))
                throw 'Invalid depart '+x;
            
            return res;
        },
        arrivee: function(x){
            var res = parseInt(x);
            if(Number.isNaN(res))
                throw 'Invalid arrivee '+x;
            
            return res;
        },
        poids: function(x){
            var res = parseFloat(x);
            if(Number.isNaN(res))
                throw 'Invalid poids '+x;
            
            return res;
        },
        distance: function(x){
            var res = parseFloat(x);
            if(Number.isNaN(res))
                throw 'Invalid distance '+x;
            
            return res;
        },
        co2: function(x){
            var res = parseFloat(x);
            if(Number.isNaN(res))
                throw 'Invalid co2 '+x;
            
            return res;
        }
    };
    
    
    global.trajetsP = new Promise(function(resolve, reject){
        d3.csv('data/trajets.csv', function(err, dataset) {
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
                });

                resolve(dataset);
            }
        });
    }).then(function(trajets){
    
        return pointsP.then(function(points){
            var byId = {};
            points.forEach(function(p){
                byId[p.id] = p;
            });
            
            trajets.forEach(function(traj){
                traj.depart = byId[traj.depart];
                traj.arrivee = byId[traj.arrivee];
            });
            
            trajets.forEach(Object.freeze);
            Object.freeze(trajets);
            
            console.log("trajets", trajets);
            
            return trajets;
        });
        
    });
    
})(this);
