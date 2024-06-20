import Phaser from 'phaser'

import GameScene from './client/scenes/GameScene'

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  backgroundColor: '#CFF5FC',
  //   width: window.innerWidth,
  //   height: window.innerHeight,
  pixelArt: true, // Prevent pixel art from becoming blurred when scaled.
  scale: {
    mode: Phaser.Scale.ScaleModes.RESIZE,
    width: window.innerWidth,
    height: window.innerHeight,
    min: {
      width: 800,
      height: 600,
    },
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: true,
    },
  },
  autoFocus: true,
  scene: [GameScene],
}

export default new Phaser.Game(config)
