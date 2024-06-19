import Phaser from 'phaser'
import PlayerFocus from './PlayerFocus'

enum PlayerState {
  IDLE,
  SITTING,
}

/**
 * shifting distance for sitting animation
 * format: direction: [xShift, yShift, depthShift]
 */

interface SittingShiftData {
    [key: string]: number[];
}

const sittingShiftData : SittingShiftData ={
  up: [0, 3, -1],
  down: [0, 3, 1],
  left: [0, -8, 1],
  right: [0, -8, 1],
}

declare global {
  namespace Phaser.GameObjects {
    interface GameObjectFactory {
      player(x: number, y: number, texture: string, frame?: string | number): Player
    }
  }
}

export default class Player extends Phaser.Physics.Arcade.Sprite {
  private _playerState = PlayerState.IDLE
  constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame?: string | number) {
    super(scene, x, y, texture, frame)

    this.anims.play('player_idle_down', true)
  }

  get playerState() {
    return this._playerState
  }

  update(playerFocus: PlayerFocus, cursors: Phaser.Types.Input.Keyboard.CursorKeys) {
    if (!cursors) {
      return
    }

    const keyE = this.scene.input.keyboard.addKey('E')
    const keyW = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W)
    const keyA = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A)
    const keyS = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S)
    const keyD = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)

    const prop = playerFocus.selectedProp
    const speed = 200

    switch (this.playerState) {
      case PlayerState.IDLE:
        // if press E in front of selected prop (chair)
        // if(Phaser.Input.Keyboard.JustDown(keyE)) {
        //     console.log("Pressing")
        // }
        if (Phaser.Input.Keyboard.JustDown(keyE) && prop) {
          /**
           * move player to the chair and play sit animation
           * a delay is called to wait for player movement (from previous velocity) to end
           */
          this.scene.time.addEvent({
            delay: 10,
            callback: () => {
              this.setVelocity(0, 0)
              this.setPosition(
                prop.x + sittingShiftData[prop.propType][0],
                prop.y + sittingShiftData[prop.propType][1]
              ).setDepth(prop.depth + sittingShiftData[prop.propType][2])
              this.play(`player_sit_${prop.propType}`, true)
              playerFocus.setPosition(0, 0)
            },
            loop: false,
          })
          // set up new dialog as player sits down
          prop.clearDialogBox()
          prop.setDialogBox('Press E to leave', 95)
          this._playerState = PlayerState.SITTING
          return
        } else if (cursors.left?.isDown  || keyA?.isDown) {

            this.play('player_run_left', true)
            this.setVelocity(-speed, 0)

          } else if (cursors.right?.isDown || keyD?.isDown) {

            this.play('player_run_right', true)
            this.setVelocity(speed, 0)

          } else if (cursors.up?.isDown || keyW?.isDown) {

            this.play('player_run_up', true)
            this.setVelocity(0, -speed)

          } else if (cursors.down?.isDown || keyS?.isDown) {

            this.play('player_run_down', true)
            this.setVelocity(0, speed)

          } else {
          const parts = this.anims.currentAnim.key.split('_')
          parts[1] = 'idle'
          this.play(parts.join('_'), true)
          this.setVelocity(0, 0)
        }
        break

      case PlayerState.SITTING:
        // back to idle if player press E while sitting
        if (Phaser.Input.Keyboard.JustDown(keyE)) {
          const parts = this.anims.currentAnim.key.split('_')
          parts[1] = 'idle'
          this.play(parts.join('_'), true)
          this._playerState = PlayerState.IDLE
        }
        break
    }
  }
}

Phaser.GameObjects.GameObjectFactory.register(
  'player',
  function (
    this: Phaser.GameObjects.GameObjectFactory,
    x: number,
    y: number,
    texture: string,
    frame?: string | number
  ) {
    var sprite = new Player(this.scene, x, y, texture, frame)

    this.displayList.add(sprite)
    this.updateList.add(sprite)

    this.scene.physics.world.enableBody(sprite, Phaser.Physics.Arcade.DYNAMIC_BODY)

    const collisionScale = [0.5, 0.2]
    sprite.body
      .setSize(sprite.width * collisionScale[0], sprite.height * collisionScale[1])
      .setOffset(
        sprite.width * (1 - collisionScale[0]) * 0.5,
        sprite.height * (1 - collisionScale[1])
      )

    return sprite
  }
)
