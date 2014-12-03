# Contexte

Cette application est une application de visualisation. Elle fait des pré-supposés sur les noms et formats de fichier attendus


## points.csv

Les points de départ et arrivée (communautés de communes et centres de traitements intermédiaires ou finaux) sont listés dans des fichiers CSV (virgule comme séparateur).

Description des colonnes :

* `id` identifiant numérique (1, 2, 67). Unique par centre.
* `nom` Nom utilisé dans l'interface utilisateur
* `type` L'une des valeurs suivantes : 'epci', 'transfert', 'traitement'
* `longitude` nombre flottant (avec un . comme séparateur décimal (3.141592))
* `latitude` nombre flottant (avec un . comme séparateur décimal)

## gironde-epci.topo.json

Fichier [topojson](https://github.com/mbostock/topojson) décrivant les zones. 
Dans le champ "id", mettre l'id du point correspondant dans le fichier points.csv


## trajets.csv

Les trajets sont listés dans un fichier CSV (virgule comme séparateur)

Description des colonnes :

* `depart` id de centre
* `arrivee` id de centre
* `poids` nombre flottant (kg)
* `distance` nombre flottant (km)
* `co2` nombre flottant (kg)