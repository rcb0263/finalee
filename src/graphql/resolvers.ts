import { ObjectId } from "mongodb";
import { getDB } from "../db/mongo"
import { IResolvers} from "@graphql-tools/utils"
import { Trainer } from "../types.ts/Trainer";
import { createTrainer, validateUser } from "../collections/Trainers";
import { signToken } from "../auth";
import { catchPokemon, createPokemon } from "../collections/Pokemon";



export const resolvers:IResolvers= {
    Query:{

        me: async (_, __, context)=>{
            const user = context.user
            if(!user)return null
            return{
                _id: user._id.toString(),
                name: user.name,
                pokemons: user.pokemons
            }
        },
         pokemon: async (_, { id }, { db }) => {
            return await db.collection("Pokemons").findOne({ _id: new ObjectId(id) });
        },
        pokemons: async (_, { page = 1, size = 20 }, { db }) => {
            const allPokemons = await db.collection("Pokemons").find().toArray();

            const start = (page - 1) * size;
            const end = start + size;

            return allPokemons.slice(start, end);
        },
    },
    Mutation: {
        startJourney: async (_, { name, password } : {name:string, password: string}) => {
            const userId = await createTrainer(name, password)
            return signToken(userId)
        },
        login: async (_, { name, password } : {name:string, password: string}) =>{

            const user = await validateUser(name, password)
            if(!user) throw new Error("Invalid credentials")
            return signToken(user._id.toString())
        },
        createPokemon: async (_, { name, description, height, weight, types } : {name:string, description: string, height: number, weight:number, types:string[]}) =>{
            const db=getDB()
            const user = await createPokemon(name, description, height, weight, types )
            if(!user) throw new Error("Could not create")
            return await db.collection("Pokemons").findOne({_id: new ObjectId(user)})
        },
        catchPokemon: async (_, { pokemonId, nickname } : {pokemonId:string, nickname: string}, context) => {
            const db = getDB();
            const userId = context.user?._id || context.user;
            if (!userId) throw new Error("Not authenticated");

            const result = await catchPokemon(pokemonId, nickname, userId);
            if (!result?.modifiedCount) throw new Error("Could not catch Pokémon");

            const trainer = await db.collection("Trainers").findOne({ _id: new ObjectId(userId) });
            if (!trainer) throw new Error("Trainer not found");
            console.log(trainer.pokemons)
            const newPokemon = trainer.pokemons[trainer.pokemons.length - 1];
            const res = {
                ...newPokemon,
                _id: newPokemon._id || new ObjectId()
            };
            return newPokemon;
        },
        freePokemon: async (_, { ownedPokemonId }, context) => {
            const db = getDB();
            const userId = context.user?._id || context.user;
            if (!userId) throw new Error("Not authenticated");


            const trainer = await db.collection("Trainers").findOne({ _id: new ObjectId(userId) });
            if (!trainer) throw new Error("Trainer not found");

            return trainer;
        }
    },
    Trainer: {
        pokemons: async (parent, _, { db }) => {
            return parent.pokemons
        }
    },

    OwnedPokemon: {
        pokemon: async (parent, _, { db }) => {
            const pokemonId = typeof parent.pokemon === "string" ? parent.pokemon : parent.pokemon._id;
            const pokemon = await db.collection("Pokemons").findOne({ _id: new ObjectId(pokemonId) });
            if (!pokemon) throw new Error("Pokémon not found");
            return pokemon;
        }
    }
}