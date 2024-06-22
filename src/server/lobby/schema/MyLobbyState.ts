import { Schema, type } from '@colyseus/schema'

export class MyLobbyState extends Schema {
    @type('string') mySynchronizedProperty: string = 'Hello world'
}
