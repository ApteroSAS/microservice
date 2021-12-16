const { buildSchema } = require("graphql")

//https://graphql.org/learn/schema/
export const RoomSchema = buildSchema(`

  type Room {
    _id: ID!
    rid: String!
    entities: [String]
  }


  input RoomInput {
    rid: String!
    entities: [String]
  }

  type Query {
    Rooms:[Room!]
  }

  type Mutation {
    createRoom(Room:RoomInput): Room
  }

  schema {
    query: Query
    mutation: Mutation
  }
`);