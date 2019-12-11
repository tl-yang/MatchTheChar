import Phaser from 'phaser'
import MenuScene from "./MenuScene";
import {CHAR_WIDTH, CHAR_HEIGHT} from "./PreloadScene";
import {strokeOrderMatch, getStrokeOrder} from "./strokeLib";

export const gameSettings = {
  speedIncrement: 30,
  playerSpeed: 200,
  powerUpVel: 50,
  maxNumberOfChar: 5,
  initDifficulty: 16,
  maxDifficulty: 8,
};

export default class MainScene extends Phaser.Scene {

  constructor() {
    super("playGame");
  }

  init(data) {
    if (data.level) {
      this.level = data.level
    } else {
      this.level = 'level1';
    }
  }

  create() {
    console.log(this.game.scale.width, this.game.scale.height);
    this.background = this.add.tileSprite(0, 0, this.game.config.width, this.game.config.height, "background");
    this.background.setDisplaySize(this.game.scale.width, this.game.scale.height);
    this.background.setOrigin(0, 0);
    this.xToDrop = new Set(Array.from({length: (this.game.scale.width / CHAR_WIDTH) >> 0},
      (x, i) => (i + 1) * CHAR_WIDTH));
    this.chars = this.physics.add.group();
    this.maxSpeed = 1.5;
    this.difficultyCounter = gameSettings.initDifficulty;
    this.initChars();

    this.player = this.physics.add.sprite(this.game.scale.width / 2 - 8, this.game.scale.height - 64, "player");
    this.player.setScale(0.25);
    // this.player.play("player_still");
    this.cursorKeys = this.input.keyboard.createCursorKeys();
    this.player.setCollideWorldBounds(true);
    this.score = 0;
    let scoreFormated = this.zeroPad(this.score, 6);
    this.scoreLabel = this.add.bitmapText(10, 5, "pixelFont", "SCORE " + scoreFormated, 26);

    // 2.1 create music
    this.music = this.sound.add("music");

    const musicConfig = {
      mute: false,
      volume: 1,
      rate: 1,
      detune: 0,
      seek: 0,
      loop: false,
      delay: 0
    };
    // --------------------------------------------------------------

    this.canvas = document.getElementById('canvas');
    this.canvas.width = this.game.scale.width;
    this.canvas.height = this.game.scale.height;
    this.canvas.style.width = this.game.scale.width + 'px';
    this.canvas.style.height = this.game.scale.height + 'px';
    this.context = this.canvas.getContext('2d');
    this.context.lineWidth = 5;
    this.context.lineCap = 'round';
    this.context.strokeStyle = '#c0392b';
    this.last_mousex = 0;
    this.last_mousey = 0;
    this.mousedown = false;

    this.maxX = 0;
    this.maxY = 0;
    this.minX = this.canvas.width;
    this.minY = this.canvas.height;
    this.createMouseEventHandler();
    this.strokes = [];
    this.currentStroke = {start: {}, end: {}};
    this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    // --------------------------------------------------------------

    this.gameStop = false;

    this.scale.on('resize', () => {
      console.log('resize');
      this.resize();
    });


  }

  createMouseEventHandler() {
    let recordPosition = (x, y) => {
      this.last_mousex = x;
      this.last_mousey = y;
      this.maxX = Math.max(this.last_mousex, this.maxX);
      this.maxY = Math.max(this.last_mousey, this.maxY);
      this.minX = Math.min(this.last_mousex, this.minX);
      this.minY = Math.min(this.last_mousey, this.minY);
    };
    let draw = e => {
      let x = e.touches[0].clientX;
      let y = e.touches[0].clientY;
      if (this.mousedown) {
        this.context.beginPath();
        this.context.moveTo(this.last_mousex, this.last_mousey);
        this.context.lineTo(x, y);
        this.context.stroke();
        this.currentStroke.end.x = x;
        this.currentStroke.end.y = y;
      }
      recordPosition(x, y)
    };
    // this.canvas.addEventListener('mousedown', recordPosition);
    if (this.canvas.getAttribute('listener') !== 'true') {
      this.canvas.setAttribute('listener', 'true');
      this.canvas.addEventListener('touchstart', (e) => {
        let x = e.touches[0].clientX;
        let y = e.touches[0].clientY;
        recordPosition(x, y);
        this.currentStroke.start.x = x;
        this.currentStroke.start.y = y;
        this.mousedown = true;
      });
      // this.canvas.addEventListener('mouseup', e => {
      //   this.mousedown = false;
      // });
      this.canvas.addEventListener('touchend', (e) => {
        this.strokes.push(this.currentStroke);
        this.currentStroke = {start: {}, end: {}};
        this.mousedown = false
      });
      this.canvas.addEventListener('touchmove', draw);
    }
    // this.canvas.addEventListener('mousemove', draw);
  }

  createRandomCharacter() {
    let randChar = Phaser.Math.Between(1, 20);
    let char = this.add.sprite(0, 0, this.level, randChar);
    char.setData('label', randChar % 10 || 10);
    this.resetChar(char);
    return char;
  }

  initChars() {
    for (let i = 1; i <= gameSettings.maxNumberOfChar; ++i) {
      let char = this.createRandomCharacter();
      this.chars.add(char)
    }
  }

  resize() {
    console.log('Game Scale Width ' + this.game.scale.width, 'Game Scale Height ' + this.game.scale.height);
    this.cameras.resize(this.game.scale.width, this.game.scale.height);
    this.background.setDisplaySize(this.game.scale.width, this.game.scale.height);
    this.player.setPosition(this.game.scale.width / 2 - 8, this.game.scale.height - 64);
  }


  zeroPad(number, size) {
    let stringNumber = String(number);
    while (stringNumber.length < (size || 2)) {
      stringNumber = "0" + stringNumber;
    }
    return stringNumber;
  }


  update() {
    this.moveChar(this.chars, 2);
    this.movePlayerManager();
    if (Phaser.Input.Keyboard.JustDown(this.spacebar)) {
      this.matchChar();
      this.clearDraw();
    }
    this.dropChar(this.chars);
    this.updateMaxSpeed(this.score);
  }

  movePlayerManager() {
    this.player.setVelocity(0);
    if (this.cursorKeys.left.isDown) {
      this.player.setVelocityX(-gameSettings.playerSpeed);
    } else if (this.cursorKeys.right.isDown) {
      this.player.setVelocityX(gameSettings.playerSpeed);
    }
  }

  matchChar() {
    let st = performance.now();
    const width = (this.maxX - this.minX) || 1;
    const height = (this.maxY - this.minY) || 1;
    // console.log('minX: ' + this.minX + ' ' + ' minY: ' + this.minY + ' maxX: ' + this.maxX + ' maxY: ' + this.maxY +
    //   ' width: ' + width + ' height: ' + height);
    const imageData = this.context.getImageData(this.minX, this.minY, width, height);
    let formData = new FormData();
    formData.append('width', imageData.width);
    formData.append('height', imageData.height);
    formData.append('input', new Blob([imageData.data.buffer], {type: 'image/png'}));
    formData.append('method', '9cnn');
    formData.append('level', this.level);
    fetch('http://127.0.0.1:5000/recognition', {
      mode: 'cors',
      method: 'post',
      body: formData
    }).then(res => {
      res.json().then(res => {
        this.matchCharInScene(res['predictions']);
        console.log(res['predictions']);
        console.log('time spent recognition: ' + (performance.now() - st))
      });
    });
    // console.log(imageData)
  }

  matchCharInScene(predictions) {
    let match = null;
    let scoreToAdd = 0;
    let charToDestroy = [];
    for (let pred of predictions) {
      if (pred === -1) continue;
      for (let char of this.chars.getChildren()) {
        if (char.y > 0 && char.getData('label') === (match || pred)) {
          scoreToAdd += 1;
          charToDestroy.push(char);
          match = pred;
        }
      }
      if (match) break;
    }
    if (match !== null) {
      const isMatch = strokeOrderMatch(this.strokes, this.cache.json.get('level1-StrokeMetadata')[match.toString()]);
      if (isMatch)
        scoreToAdd += 2;
      console.log(JSON.stringify(this.cache.json.get('level1-StrokeMetadata')[match.toString()]));
      console.log(JSON.stringify(getStrokeOrder(this.strokes)));
      console.log(isMatch);
    }
    this.score += scoreToAdd;
    this.scoreLabel.text = "SCORE " + this.zeroPad(this.score, 8);
    this.strokes = [];
    charToDestroy.forEach(char => this.destroyChar(char));
  }

  clearDraw() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.maxX = 0;
    this.maxY = 0;
    this.minX = this.canvas.width;
    this.minY = this.canvas.height;
  }

  moveChar(char) {
    char.getChildren().forEach((obj) => {
      if (obj.y > this.game.config.height) {
        this.endGame();
      }
      obj.y += obj.getData('speed');
    });
  }

  destroyChar(char) {
    this.xToDrop.add(char.x);
    char.destroy();
  }

  updateMaxSpeed(score) {
    if (this.maxSpeed < gameSettings.maxDifficulty && Math.floor(score / this.difficultyCounter)){
      this.maxSpeed = this.maxSpeed + Math.floor(score / this.difficultyCounter)
      this.difficultyCounter *= 2;
    }
  }

  dropChar(chars) {
    let numOfCharToDrop = gameSettings.maxNumberOfChar - this.chars.getChildren().length;
    for (let i = 0; i < numOfCharToDrop; ++i) {
      const char = this.createRandomCharacter();
      this.chars.add(char);
    }

  };

  endGame() {
    if (!this.gameStop) {
      this.gameStop = true;
      this.scene.pause();
      this.input.keyboard.shutdown();
      this.scene.add('menuScene', MenuScene, true, {score: this.score})
    }
  }

  resetChar(gameObject) {
    gameObject.x = Phaser.Math.RND.pick([...this.xToDrop]);
    this.xToDrop.delete(gameObject.x);
    gameObject.y = -Phaser.Math.Between(1, 3) * CHAR_HEIGHT;
    gameObject.setData('speed', Phaser.Math.Between(this.maxSpeed - 3 > 1 ? this.maxSpeed - 3 : 1, this.maxSpeed))
    // gameObject.setData('speed', 0.3)
  }
}
