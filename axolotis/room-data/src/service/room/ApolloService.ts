
import {properties} from "@root/properties/properties";

import { makeExecutableSchema } from 'graphql-tools'
import {ApolloServer, gql} from "apollo-server-express";
import { MongoClient } from 'mongodb'

import { MongoDataSource } from 'apollo-datasource-mongodb'
import {Mongoose} from "@root/mongodb/Mongoose";

export class ApolloService {
    async start(expressApp: any) {

        const typeDefs = gql`
          type Room {
            _id: ID!
            rid: String!
          }
        
          type Query {
            Rooms:[Room!],
            room(rid:String!):Room!,
            hello: String
          }
        `;

        const resolvers = {
            Query: {
                room(_parent, _args, _context, _info) {
                    return _context.db
                        .collection('rooms')
                        .findOne({rid: _args.rid})
                        //https://docs.mongodb.com/manual/reference/method/db.collection.findOne/
                        .then((room) => {
                            return room //room
                        })
                },
                hello: () => 'Hello world!',
            },
        };

        //https://github.com/GraphQLGuide/apollo-datasource-mongodb

        const schema = makeExecutableSchema({
            typeDefs,
            resolvers,
        });
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
                        );

                        await dbClient.connect();
                        db = dbClient.db(dbName)
                    } catch (e) {
                        console.log('--->error while connecting with graphql context (db)', e)
                    }
                }

                return { db }
            },
        });

        const config = {
            api: {
                bodyParser: false,
            },
        };
        apolloServer.start().then(res => {
            //Apply the Apollo GraphQL middleware and set the path to /api
            apolloServer.applyMiddleware({app: expressApp, path: '/graphql'});
        })

    }
}
