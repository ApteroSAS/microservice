
import {properties} from "@root/properties/properties";


import { MongoDataSource } from 'apollo-datasource-mongodb'
import {RoomSchema} from "@root/mongodb/graphql/RoomSchema";
import {resolvers} from "@root/mongodb/graphql/Resolver";
import {graphqlHTTP} from "express-graphql";
import {Mongoose} from "@root/mongodb/Mongoose";

export default class Rooms extends MongoDataSource<any> {
    getRoom1() {
        return this.findOneById("room1")
    }
}

export class GraphQLService {
    async start(expressApp: any) {
        new Mongoose().start();
        expressApp.use(
            "/graphql",
            graphqlHTTP({
                schema: RoomSchema,
                rootValue: resolvers,
                graphiql: true,
            })
        );

    }
}
