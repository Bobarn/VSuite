import Phaser from 'phaser'
// import { debugDraw } from '../utils/debug'
import { createCharacterAnimations } from '../animations/CharacterAnimations'

import Prop from '../props/Props'
import '../players/Player'
import PlayerFocus from '../players/PlayerFocus'

export default class Game extends Phaser.Scene {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private player!: Phaser.Physics.Arcade.Sprite
  private upperWalls!: Phaser.Physics.Arcade.StaticGroup
  private props!: Phaser.Physics.Arcade.StaticGroup
  private nonInteractiveProps!: Phaser.Physics.Arcade.StaticGroup
  private nonInteractivePropsOnCollide!: Phaser.Physics.Arcade.StaticGroup
  private playerFocus!: Phaser.GameObjects.Zone

  constructor() {
    super('game')
  }

  preload() {

    this.load.tilemapTiledJSON('tilemap', 'assets/map/FirstMap.json')

    this.cursors = this.input.keyboard.createCursorKeys()
    this.load.spritesheet('tiles_wall', 'assets/map/FloorAndGround.png', {
      frameWidth: 32,
      frameHeight: 32,
    })

    this.load.spritesheet('chairs', 'assets/props/Chair.png', {
      frameWidth: 32,
      frameHeight: 64,
    })

    this.load.spritesheet('office', 'assets/props/Modern_Office_Black_Shadow.png', {
      frameWidth: 32,
      frameHeight: 32,
    })

    this.load.spritesheet('generic', 'assets/props/Generic.png', {
      frameWidth: 32,
      frameHeight: 32,
    })

    this.load.spritesheet('player', 'assets/character/adam.png', {
      frameWidth: 32,
      frameHeight: 48,
    })
  }

  create() {
    createCharacterAnimations(this.anims)

    const map = this.make.tilemap({ key: 'tilemap' })
    const FloorAndGround = map.addTilesetImage('FloorAndGround', 'tiles_wall')

    const groundLayer = map.createLayer('Ground', FloorAndGround)
    groundLayer.setCollisionByProperty({ collides: true })

    // debugDraw(groundLayer, this)

    // import wall objects from Tiled map to Phaser
    this.upperWalls = this.physics.add.staticGroup()
    const upperWallLayer = map.getObjectLayer('Wall')
    upperWallLayer.objects.forEach((wallObj) => {
      const actualX = wallObj.x! + wallObj.width! * 0.5
      const actualY = wallObj.y! - wallObj.height! * 0.5
      this.upperWalls
        .get(
          actualX,
          actualY,
          'tiles_wall',
          wallObj.gid! - map.getTileset('FloorAndGround').firstgid
        )
        .setDepth(actualY)
    })

    // import prop objects (currently chairs) from Tiled map to Phaser
    this.props = this.physics.add.staticGroup({
      classType: Prop,
    })
    const chairLayer = map.getObjectLayer('Chair')
    chairLayer.objects.forEach((chairObj) => {
      const actualX = chairObj.x! + chairObj.width! * 0.5
      const actualY = chairObj.y! - chairObj.height! * 0.5
      const prop = this.props
        .get(actualX, actualY, 'chairs', chairObj.gid! - map.getTileset('Chair').firstgid)
        .setDepth(actualY)
      prop.setPropType(chairObj.type)
    })

    // import all other objects from Tiled map to Phaser
    this.nonInteractiveProps = this.physics.add.staticGroup()
    const objLayer = map.getObjectLayer('Objects')
    objLayer.objects.forEach((obj) => {
      const actualX = obj.x! + obj.width! * 0.5
      const actualY = obj.y! - obj.height! * 0.5
      this.nonInteractiveProps
        .get(
          actualX,
          actualY,
          'office',
          obj.gid! - map.getTileset('Modern_Office_Black_Shadow').firstgid
        )
        .setDepth(actualY)
    })
    const genericLayer = map.getObjectLayer('GenericObjects')
    genericLayer.objects.forEach((obj) => {
      const actualX = obj.x! + obj.width! * 0.5
      const actualY = obj.y! - obj.height! * 0.5
      this.nonInteractiveProps
        .get(actualX, actualY, 'generic', obj.gid! - map.getTileset('Generic').firstgid)
        .setDepth(actualY)
    })

    // import all other objects that are collidable from Tiled map to Phaser
    this.nonInteractivePropsOnCollide = this.physics.add.staticGroup()
    const objOnCollideLayer = map.getObjectLayer('ObjectsOnCollide')
    objOnCollideLayer.objects.forEach((obj) => {
      const actualX = obj.x! + obj.width! * 0.5
      const actualY = obj.y! - obj.height! * 0.5
      this.nonInteractivePropsOnCollide
        .get(
          actualX,
          actualY,
          'office',
          obj.gid! - map.getTileset('Modern_Office_Black_Shadow').firstgid
        )
        .setDepth(actualY)
    })
    const genericOnCollideLayer = map.getObjectLayer('GenericObjectsOnCollide')
    genericOnCollideLayer.objects.forEach((obj) => {
      const actualX = obj.x! + obj.width! * 0.5
      const actualY = obj.y! - obj.height! * 0.5
      this.nonInteractivePropsOnCollide
        .get(actualX, actualY, 'generic', obj.gid! - map.getTileset('Generic').firstgid)
        .setDepth(actualY)
    })

    this.player = this.add.player(705, 500, 'player')

    this.playerFocus = new PlayerFocus(this, 0, 0, 16, 16)

    this.cameras.main.zoom = 1.5
    this.cameras.main.startFollow(this.player, true)

    this.physics.add.collider(this.player, groundLayer)
    this.physics.add.collider(this.player, this.nonInteractivePropsOnCollide)
    this.physics.add.overlap(
      this.playerFocus,
      this.props,
      this.handlePropSelectorOverlap,
      undefined,
      this
    )
  }

  private handlePropSelectorOverlap(playerFocus: any, selectionProp: any) {
    // if the selection has not changed, do nothing
    if (playerFocus.selectedProp === selectionProp) {
      return
    }

    // if selection changes, clear pervious dialog
    if (playerFocus.selectedProp) {
      playerFocus.selectedProp.clearDialogBox()
    }

    // set selected item and set up new dialog
    playerFocus.setSelectedProp(selectionProp)
    selectionProp.setDialogBox('Press E to sit', 80)
  }

  update() {
    if (this.player) {
      this.playerFocus.update(this.player, this.cursors)
      this.player.update(this.playerFocus, this.cursors)
    }
  }
}
