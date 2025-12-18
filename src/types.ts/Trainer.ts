import { ObjectId } from "mongodb"
import { ownedPokemon } from "./Pokemons"


export type Trainer = {
    _id: ObjectId,
    name: string,
    passwordHash: string,
    pokemons: ownedPokemon[],
}