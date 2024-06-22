import { Room, Client } from 'colyseus'
import { MyLobbyState } from './schema/MyLobbyState'

export default class MyLobby extends Room<MyLobbyState> {
  onCreate() {
    this.setState(new MyLobbyState())

    this.onMessage('type', () => {

    })
  }

  onJoin(client: Client) {
    console.log(client.sessionId, 'joined!')
  }

  onLeave(client: Client) {
    console.log(client.sessionId, 'left!')
  }

  onDispose() {
    console.log('room', this.roomId, 'disposing...')
  }
}
