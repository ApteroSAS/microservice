Needs:

Limiter les salles au nombre inscrit exacte (enlever le mode spectateur) - Ne pas charger les assets 3d [3]

rediriger l'utilisateur automatiquement sur une autre salle en cas de salle pleine (Eg creer une nouvelle salle et inscrire cette salle dans un load balancer) [3] => (Optional faire en dernier)

Faire un system de queue/lobby sur les salles importante pour éviter de faire tomber le serveur par DDOS (Maybe rien à faire si on utilise un service) [0] ~~

Mettre un system de load balancer sur les page pour redistribuer les utilisateur parmi plusieurs instance de la salle. [3]

Creer une interface/menu pour changer facilement d'instance une fois dans la salle [3]

Duplicate the room exactly including the media in it (We will need a reference room and the other room will be flaged as copy) . Includes feature tu prune the copy [7] (Optional mais attention point organisationnel necessaire)

Tech:
Load balancer is composed of two system:
A front facing page
A Microservice

The front facing page url must be DDOS resistant and with a Queue System
See Cloudflare and Queue-Fair

How does it works:
The user opens a link eg lb.aptero.co/w3Z8ias/apter-demo-room corresponding to Aptero 
 The load balancer query the microservice to know all the room associated with this one with meta data

With the Meta Data the load balancer determine if which room the user should be allocated and if a new room should be created.

API rest:
A RoomId is any RoomId in the balancer pack
GetMetasForRoom(RoomId) return the db StateData with the load of each room associated
CreateAClone(RoomId)
CleanupClones(RoomId)

Db persistent data:

<roomid>:{

<Temporary clone room id>:{eventual meta}

}

Idea 

load balancer should automatically setup a room by using the link
Create new Room If the Total Room Capacity is greater than 70%
setup the microservice as a lambda to allow HA