import { ObjectId } from "mongodb"
import { getDB } from "../db/mongo"
import bcrypt from "bcryptjs"
import { Trainer } from "../types.ts/Trainer"


const COLLECTION = "Trainers"

export const createTrainer = async (name:string, password: string)=>{
    const db = getDB()
    const toEncriptao = await bcrypt.hash(password, 10)
    
    const result = await db.collection(COLLECTION).insertOne({
        name,
        passwordHash: toEncriptao,
        pokemons: []
    })

    return result.insertedId.toString()
}

export const validateUser = async (name:string, password: string) =>{
    const db = getDB()
    const user = await db.collection(COLLECTION).findOne({name})
    if(!user) return null

    return user
}

export const findUserById = async (id: string) =>{
    const db = getDB()
    return await db.collection(COLLECTION).findOne({_id: new ObjectId(id)})
}