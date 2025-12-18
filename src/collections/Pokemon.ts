import { ObjectId } from "mongodb"
import { getDB } from "../db/mongo"
import bcrypt from "bcryptjs"
import { Trainer } from "../types.ts/Trainer"
import { ownedPokemon } from "../types.ts/Pokemons"


const COLLECTION = "Pokemons"

export const createPokemon = async (name:string, description: string, height: number, weight:number, types:string[])=>{
    const db = getDB()
    
    const result = await db.collection(COLLECTION).insertOne({
        name, 
        description, 
        height, 
        weight, 
        types
    })

    return result.insertedId.toString()
}

export const catchPokemon = async (pokemonId:string, nickname:string, userId:string) =>{
    const db = getDB()
    if (!ObjectId.isValid(pokemonId)) {
        throw new Error("Invalid pokemonId")
    }
    if (!ObjectId.isValid(userId)) {
        throw new Error("Invalid userId")
    }
    const pokemon = await db.collection(COLLECTION).findOne({_id: new ObjectId(pokemonId)})
    if(!pokemon) return null

    const userPokemon = await db.collection("Trainers").findOne({_id: new ObjectId(userId)})
    if(userPokemon!.pokemons.length>=6)return null;
    const caught: ownedPokemon= {
        pokemon: pokemonId,
        nickname: nickname||"",
        attack: Math.floor(Math.random() * 100),
        defense: Math.floor(Math.random() * 100),
        speed: Math.floor(Math.random() * 101),
        special: Math.floor(Math.random() * 101),
        level: Math.floor(Math.random() * 100)
    }
    userPokemon!.pokemons.push(caught);
    const result = await db.collection("Trainers").updateOne(
        {_id: new ObjectId(userId)},
        {$set: {pokemons: userPokemon!.pokemons}}
    )
    return result
}

export const findUserById = async (id: string) =>{
    const db = getDB()
    return await db.collection(COLLECTION).findOne({_id: new ObjectId(id)})
}