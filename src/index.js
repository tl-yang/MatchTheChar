import PreloadScene from './PreloadScene'
import MainScene from './MainScene'
import './css/base.css'
// import 'materialize-css/dist/css/materialize.min.css'

// const DEFAULT_WIDTH = 1280;
// const DEFAULT_HEIGHT = 1080;
const MAX_WIDTH = 1920;
const MAX_HEIGHT = 1080;
// FIT OR SMOOTH
let SCALE_MODE = 'SMOOTH';

const config = {
  type: Phaser.CANVAS,
  width: MAX_WIDTH,
  height: MAX_HEIGHT,
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    parent: 'match-the-char',
  },
  backgroundColor: 0x000000,
  scene: [PreloadScene, MainScene],
  physics: {
    default: "arcade",
    arcade: {
      debug: false,
      debugShowVelocity: false
    }
  }
};


window.addEventListener('load', () => {
  const game = new Phaser.Game(config);
});

