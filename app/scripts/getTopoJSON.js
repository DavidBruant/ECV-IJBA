"use strict";

function getTopoJSON(){
    return new Promise(function(resolve, reject){
        d3.json('data/gironde-epci.topo.json', function(err, dataset) {
            if(err)
                reject(err);
            else
                resolve(dataset)
        });
    });
}