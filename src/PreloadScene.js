import Phaser from 'phaser'

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super("bootGame");
  }

  preload() {
    this.load.image("background", "assets/images/bg_1920_1080.jpg");
    // this.load.image('numbers', 'assets/cjk/numbers.png');
    //
    this.load.spritesheet("numbers", "assets/cjk/numbers.png", {
      frameWidth: 64,
      frameHeight: 63
    });
    // this.load.spritesheet("ship2", "assets/spritesheets/ship2.png", {
    //   frameWidth: 32,
    //   frameHeight: 16
    // });
    // this.load.spritesheet("ship3", "assets/spritesheets/ship3.png", {
    //   frameWidth: 32,
    //   frameHeight: 32
    // });
    this.load.spritesheet("explosion", "assets/spritesheets/explosion.png", {
      frameWidth: 16,
      frameHeight: 16
    });
    this.load.spritesheet("power-up", "assets/spritesheets/power-up.png", {
      frameWidth: 16,
      frameHeight: 16
    });
    this.load.spritesheet("player", "assets/char_spritesheets/skeleton_hit.png", {
      frameWidth: 328,
      frameHeight: 384,
      // spacing:,
      // margin: 2,
    });
    this.load.spritesheet("beam", "assets/spritesheets/beam.png", {
      frameWidth: 16,
      frameHeight: 16
    });

    this.load.bitmapFont("pixelFont", "assets/font/font.png", "assets/font/font.xml");

    // 1.1 load sounds in both formats mp3 and ogg
    this.load.audio("audio_beam", ["assets/sounds/beam.ogg", "assets/sounds/beam.mp3"]);
    this.load.audio("audio_explosion", ["assets/sounds/explosion.ogg", "assets/sounds/explosion.mp3"]);
    this.load.audio("audio_pickup", ["assets/sounds/pickup.ogg", "assets/sounds/pickup.mp3"]);
    this.load.audio("music", ["assets/sounds/sci-fi_platformer12.ogg", "assets/sounds/sci-fi_platformer12.mp3"]);
  }

  create() {
    this.add.text(20, 20, "Loading game...");
    this.scene.start("playGame");
    this.anims.create({
      key: "player_still",
      frames: this.anims.generateFrameNumbers("player", {
        start: 0,
        end: 6,
      }),
      frameRate: 20,
      repeat: -1
    });
  }
}
