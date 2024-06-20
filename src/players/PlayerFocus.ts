import Phaser from 'phaser'
import Player from './Player'
import Prop from '../props/Props'

enum PlayerState {
  IDLE,
  SITTING,
}

export default class PlayerFocus extends Phaser.GameObjects.Zone {
  private _selectedProp?: Prop
  constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number) {
    super(scene, x, y, width, height)

    scene.physics.add.existing(this)
  }

  update(player: Player, cursors: Phaser.Types.Input.Keyboard.CursorKeys) {
    if (!cursors) {
      return
    }

    // no need to update player selection while sitting
    if (player.playerState === PlayerState.SITTING) {
      return
    }
    const keyW = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W)
    const keyA = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A)
    const keyS = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S)
    const keyD = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)


    // update player selection box position so that it's always in front of the player
    const { x, y } = player
    if (cursors.left?.isDown || keyA?.isDown) {
      this.setPosition(x - 32, y)
    } else if (cursors.right?.isDown || keyD?.isDown) {
      this.setPosition(x + 32, y)
    } else if (cursors.up?.isDown || keyW?.isDown) {
      this.setPosition(x, y - 32)
    } else if (cursors.down?.isDown || keyS?.isDown) {
      this.setPosition(x, y + 32)
    }
    /**
     * while currently selecting an Prop,
     * if the selector and selection Prop stop overlapping, clear the dialog box and selected Prop
     */
    if (this._selectedProp) {
      if (!this.scene.physics.overlap(this, this._selectedProp)) {
        this._selectedProp.clearDialogBox()
        this._selectedProp = undefined
      }
    }
  }

  setSelectedProp(Prop: Prop) {
    // console.log('Selected Prop:', Prop)
    this._selectedProp = Prop
  }

  get selectedProp() {
    return this._selectedProp
  }
}
