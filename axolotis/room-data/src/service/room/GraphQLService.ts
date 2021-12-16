
import {properties} from "@root/properties/properties";

import { makeExecutableSchema } from 'graphql-tools'
import {ApolloServer, gql} from "apollo-server-express";
import { MongoClient } from 'mongodb'

import { MongoDataSource } from 'apollo-datasource-mongodb'

export default class Rooms extends MongoDataSource<any> {
    getRoom1() {
        return this.findOneById("room1")
    }
}

export class GraphQLService {
    async start(expressApp: any) {

        /*const client = new MongoClient(properties.MONGODB)
        await client.connect();

        const typeDefs = gql`
          type Room {
            _id: ID!
            rid: String!
          }
        
          type Query {
            hello: String
            getRoom1:Room
          }
        `;


        const resolvers = {
            Query: {
                getRoom1: (room, _, { dataSources: { rooms } }) => rooms.getRoom1()
            }
        }

        const server = new ApolloServer({
            typeDefs,
            resolvers,
            dataSources: () => ({
                rooms: new Rooms(client.db().collection('rooms'))
                // OR
                // users: new Users(UserModel)
            })
        })
        server.start().then(res => {
            //Apply the Apollo GraphQL middleware and set the path to /api
            server.applyMiddleware({app: expressApp, path: '/graphql'});
        })*/

        //Create an instance of Apollo Server

        const typeDefs = gql`
          type Room {
            _id: ID!
            rid: String!
          }
        
          type Query {
            Rooms:[Room!],
            aRoom:Room!,
            hello: String
          }
        `;

        const resolvers = {
            Query: {
                aRoom(_parent, _args, _context, _info) {
                    return _context.db
                        .collection('rooms')
                        .findOne()
                        //https://docs.mongodb.com/manual/reference/method/db.collection.findOne/
                        .then((room) => {
                            return room //room
                        })
                },
                hello: () => 'Hello world!',
            },
        }

        //https://github.com/GraphQLGuide/apollo-datasource-mongodb

        const schema = makeExecutableSchema({
            typeDefs,
            resolvers,
        })
        let db;
        let dbName = properties.MONGODB.replace("mongodb+srv://","").split("/")[1]
        const apolloServer = new ApolloServer({
            schema,
            context: async () => {
                if (!db) {
                    try {
                        const dbClient = new MongoClient(
                            properties.MONGODB,{
                                //useNewUrlParser: true,
                                //useUnifiedTopology: true,
                            }
                        )

                        await dbClient.connect()
                        db = dbClient.db(dbName)
                    } catch (e) {
                        console.log('--->error while connecting with graphql context (db)', e)
                    }
                }

                return { db }
            },
        })

        const config = {
            api: {
                bodyParser: false,
            },
        }
        apolloServer.start().then(res => {
            //Apply the Apollo GraphQL middleware and set the path to /api
            apolloServer.applyMiddleware({app: expressApp, path: '/graphql'});
        })

        /*expressApp.use(
            "/graphql",
            graphqlHTTP({
                schema: RoomSchema,
                rootValue: resolvers,
                graphiql: true,
            })
        )*/

        /*
/////////

        const db = properties.MONGODB;

        const models = {
            RoomModel: RoomModel,
        };

// Connect to MongoDB with Mongoose.

        if (properties.MONGODB !== "DISABLED") {
            let connect = function () {
                mongoose.connect(
                    db,
                    {
                        //https://mongoosejs.com/docs/connections.html
                        //useUnifiedTopology: false,
                        //useFindAndModify: false,
                        //useCreateIndex: true,
                        //useNewUrlParser: true,
                        //autoReconnect: true,
                        //poolSize: 3,
                        //reconnectTries: 10,
                        //reconnectInterval: 1000,
                        //socketTimeoutMS: 5000
                    }
                );
            };
            connect();

            let isConnectedBefore = false;
            mongoose.connection.on('error', function () {
                console.log('Could not connect to MongoDB');
            });

            mongoose.connection.on('disconnected', function () {
                process.exit(1);//in a container this will be restarted automaticaly
                console.log('Lost MongoDB connection...');
                if (!isConnectedBefore)
                    connect();
            });
            mongoose.connection.on('connected', function () {
                isConnectedBefore = true;
                console.log('Connection established to MongoDB');
            });

            mongoose.connection.on('reconnected', function () {
                console.log('Reconnected to MongoDB');
            });
        }*/
    }
}