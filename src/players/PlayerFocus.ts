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

    // update player selection box position so that it's always in front of the player
    const { x, y } = player
    if (cursors.left?.isDown) {
      this.setPosition(x - 32, y)
    } else if (cursors.right?.isDown) {
      this.setPosition(x + 32, y)
    } else if (cursors.up?.isDown) {
      this.setPosition(x, y - 32)
    } else if (cursors.down?.isDown) {
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
    console.log(Prop)
    this._selectedProp = Prop
  }

  get selectedProp() {
    return this._selectedProp
  }
}
