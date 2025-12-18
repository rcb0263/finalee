import { ObjectId } from "mongodb"

export type Pokemon = {
    name:string, 
    description: string,
    height: number,
    weight:number, 
    types:string[] 
}
export type ownedPokemon = {
    pokemon: string,
    nickname: string,
    attack: number,
    defense: number,
    speed: number,
    special: number,
    level: number
}