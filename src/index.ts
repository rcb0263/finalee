import { connect } from "http2"
import { connectToMongoDB } from "./db/mongo"
import { typeDefs } from "./graphql/schema";
import { resolvers } from "./graphql/resolvers";
import { ApolloServer } from "apollo-server";
import { error } from "console";
import { getUserFromToken } from "./auth";
import { Token } from "graphql";





const start = async () => {
    await connectToMongoDB();

    const server = new ApolloServer({
        typeDefs,
        resolvers,
        context: async ({req})=>{
            const token = req.headers.authorization || ""
            const user = token ? await getUserFromToken(token as string): null
            return { user }
        }
    });

    await server.listen({port: 4000})
    console.log("GQL sirviendo y de to")
}


start().catch(error=>console.error(error))