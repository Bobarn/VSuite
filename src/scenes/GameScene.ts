import Phaser from 'phaser'
// import { debugDraw } from '../utils/debug'
import { createCharacterAnimations } from '../animations/CharacterAnimations'

export default class Game extends Phaser.Scene {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private player!: Phaser.Physics.Arcade.Sprite
  private keyW!: Phaser.Input.Keyboard.Key
  private keyA!: Phaser.Input.Keyboard.Key
  private keyS!: Phaser.Input.Keyboard.Key
  private keyD!: Phaser.Input.Keyboard.Key

  constructor() {
    super('game')
  }

  preload() {
    this.load.image('tiles1', 'assets/map/Room_Builder_Office.png')
    this.load.image('tiles2', 'assets/map/Room_Builder_Floors.png')
    this.load.image('tiles3', 'assets/map/Room_Builder_Walls.png')
    this.load.image('tiles4', 'assets/map/Generic.png')
    this.load.image('tiles5', 'assets/map/Modern_Office_Black_Shadow.png')
    this.load.image('tiles6', 'assets/map/Classroom_and_library.png')
    this.load.tilemapTiledJSON('tilemap', 'assets/map/FirstMap.json')

    this.load.atlas('player', 'assets/character/adam.png', 'assets/character/adam.json')

    this.cursors = this.input.keyboard.createCursorKeys()
  }

  create() {
    this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W)
    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A)
    this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S)
    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)

    const map = this.make.tilemap({ key: 'tilemap' })
    const ground1 = map.addTilesetImage('Room_Builder_Office', 'tiles1')
    const ground2 = map.addTilesetImage('Room_Builder_Floors', 'tiles2')
    const ground3 = map.addTilesetImage('Room_Builder_Walls', 'tiles3')
    const obj1 = map.addTilesetImage('Generic', 'tiles4')
    const obj2 = map.addTilesetImage('Modern_Office_Black_Shadow', 'tiles5')
    const obj3 = map.addTilesetImage('Classroom_and_library', 'tiles6')

    const ground = [ground1, ground2, ground3, obj1]
    const office_obj = [obj1, obj2, obj3]

    const groundLayer = map.createLayer('Ground', ground)
    map.createLayer('Obj_layer1', office_obj)
    map.createLayer('Obj_layer2', office_obj)
    map.createLayer('Obj_layer3', office_obj)

    groundLayer.setCollisionByProperty({ collides: true })

    // debugDraw(groundLayer, this)

    this.player = this.physics.add.sprite(
      this.sys.canvas.width * 0.35,
      this.sys.canvas.height * 1,
      'player',
      'Adam_idle_anim_19.png'
    )
    this.player.body.setSize(this.player.width * 0.5, this.player.height * 0.3)
    this.player.body.setOffset(8, 33.6)

    createCharacterAnimations(this.anims)


    this.player.play('player_idle_down', true)
    this.cameras.main.zoom = 1.5
    this.cameras.main.startFollow(this.player, true)

    this.physics.add.collider(this.player, groundLayer)
  }

  update(t: number, dt: number) {
    if (!this.cursors || !this.player) {

      return

    }
    const speed = 200
    if (this.cursors.left?.isDown  || this.keyA?.isDown) {

      this.player.play('player_run_left', true)
      this.player.setVelocity(-speed, 0)

    } else if (this.cursors.right?.isDown || this.keyD?.isDown) {

      this.player.play('player_run_right', true)
      this.player.setVelocity(speed, 0)

    } else if (this.cursors.up?.isDown || this.keyW?.isDown) {

      this.player.play('player_run_up', true)
      this.player.setVelocity(0, -speed)

    } else if (this.cursors.down?.isDown || this.keyS?.isDown) {

      this.player.play('player_run_down', true)
      this.player.setVelocity(0, speed)

    } else {

      const parts = this.player.anims.currentAnim.key.split('_')
      parts[1] = 'idle'
      this.player.play(parts.join('_'), true)
      this.player.setVelocity(0, 0)

    }
  }
}
