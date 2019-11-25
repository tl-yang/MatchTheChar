import PreloadScene from './PreloadScene'
import MainScene from './MainScene'

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
  // function resizeApp() {
  //   // Width-height-ratio of game resolution
  //   // Replace 360 with your game width, and replace 640 with your game height
  //   let game_ratio = 1920 / 1080;
  //
  //   // Make div full height of browser and keep the ratio of game resolution
  //   let div = document.getElementById('match-the-char');
  //   div.style.width = (window.innerHeight * game_ratio) + 'px';
  //   div.style.height = window.innerHeight + 'px';
  //
  //   // Check if device DPI messes up the width-height-ratio
  //   let canvas = document.getElementsByTagName('canvas')[0];
  //
  //   let dpi_w = parseInt(div.style.width) / canvas.width;
  //   let dpi_h = parseInt(div.style.height) / canvas.height;
  //
  //   let height = window.innerHeight * (dpi_w / dpi_h);
  //   let width = height * game_ratio;
  //
  //   // Scale canvas
  //   canvas.style.width = width + 'px';
  //   canvas.style.height = height + 'px';
  //   game.scale.resize(width, height);
  // }
  // const resize = () => {
  //   const w = window.innerWidth;
  //   const h = window.innerHeight;
  //
  //   let width = DEFAULT_WIDTH;
  //   let height = DEFAULT_HEIGHT;
  //   let maxWidth = MAX_WIDTH;
  //   let maxHeight = MAX_HEIGHT;
  //   let scaleMode = SCALE_MODE;
  //
  //   let scale = Math.min(w / width, h / height);
  //   let newWidth = Math.min(w / scale, maxWidth);
  //   let newHeight = Math.min(h / scale, maxHeight);
  //
  //   let defaultRatio = DEFAULT_WIDTH / DEFAULT_HEIGHT;
  //   let maxRatioWidth = MAX_WIDTH / DEFAULT_HEIGHT;
  //   let maxRatioHeight = DEFAULT_WIDTH / MAX_HEIGHT;
  //
  //   // smooth scaling
  //   let smooth = 1;
  //   if (scaleMode === 'SMOOTH') {
  //     const maxSmoothScale = 1.15;
  //     const normalize = (value, min, max) => {
  //       return (value - min) / (max - min)
  //     };
  //     if (width / height < w / h) {
  //       smooth =
  //         -normalize(newWidth / newHeight, defaultRatio, maxRatioWidth) / (1 / (maxSmoothScale - 1)) + maxSmoothScale;
  //     } else {
  //       smooth =
  //         -normalize(newWidth / newHeight, defaultRatio, maxRatioHeight) / (1 / (maxSmoothScale - 1)) + maxSmoothScale;
  //     }
  //   }
  //
  //   // resize the game
  //   game.scale.resize(newWidth * smooth, newHeight * smooth);
  //   console.log(newWidth * smooth, newHeight * smooth);
  //
  //   // scale the width and height of the css
  //   game.canvas.style.width = newWidth * scale + 'px';
  //   game.canvas.style.height = newHeight * scale + 'px';
  //
  //   // center the game with css margin
  //   game.canvas.style.marginTop = `${(h - newHeight * scale) / 2}px`;
  //   game.canvas.style.marginLeft = `${(w - newWidth * scale) / 2}px`;
  // };
  // window.addEventListener('resize', () => {
  //   resizeApp()
  // });
  // resizeApp()
});

