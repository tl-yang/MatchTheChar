import Phaser from 'phaser'

export const gameSettings = {
  playerSpeed: 200,
  powerUpVel: 50,
  maxNumberOfChar: 2,
  maxNumberOfDifficulty: 50,
};

export default class MainScene extends Phaser.Scene {

  constructor() {
    super("playGame");
  }

  create() {
    console.log(this.game.scale.width, this.game.scale.height);
    this.x_frac = Array.from({length: gameSettings.maxNumberOfChar},
      (v, i) => 1 / gameSettings.maxNumberOfChar * i);
    this.background = this.add.tileSprite(0, 0, this.game.config.width, this.game.config.height, "background");
    this.background.setDisplaySize(this.game.scale.width, this.game.scale.height);
    this.background.setOrigin(0, 0);

    this.chars = this.physics.add.group();
    this.initChars();

    this.player = this.physics.add.sprite(this.game.scale.width / 2 - 8, this.game.scale.height - 64, "player");
    this.player.setScale(0.25);
    // this.player.play("player_still");
    this.cursorKeys = this.input.keyboard.createCursorKeys();
    this.player.setCollideWorldBounds(true);
    this.score = 0;
    let scoreFormated = this.zeroPad(this.score, 6);
    this.scoreLabel = this.add.bitmapText(10, 5, "pixelFont", "SCORE " + scoreFormated, 16);

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
    // this.canvasx = this.canvas.offsetLeft;
    // this.canvasy = this.canvas.offsetTop;
    this.last_mousex = 0;
    this.last_mousey = 0;
    // this.mousex = 0;
    // this.mousey = 0;
    this.mousedown = false;

    this.maxX = 0;
    this.maxY = 0;
    this.minX = this.canvas.width;
    this.minY = this.canvas.height;
    this.createMouseEventHandler();

    this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    // --------------------------------------------------------------

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
      }
      recordPosition(x, y)
    };
    // this.canvas.addEventListener('mousedown', recordPosition);
    this.canvas.addEventListener('touchstart', (e) => {
      recordPosition(e.touches[0].clientX, e.touches[0].clientY);
      this.mousedown = true;
    });
    // this.canvas.addEventListener('mouseup', e => {
    //   this.mousedown = false;
    // });
    this.canvas.addEventListener('touchend', () => {
      this.mousedown = false
    });
    this.canvas.addEventListener('touchmove', draw);
    // this.canvas.addEventListener('mousemove', draw);
  }

  createRandomCharacter() {
    let randChar = Phaser.Math.Between(1, 20);
    let char = this.add.sprite(0, 0, 'numbers', randChar);
    char.setData('label', randChar % 10 || 10);
    this.resetChar(char);
    return char;
  }

  initChars() {
    let totalNumOfSprite = 5;
    for (let i = 1; i <= totalNumOfSprite; ++i) {
      let char = this.createRandomCharacter();
      this.chars.add(char)
      // let char = this.add.sprite(0, 0, 'numbers', i);
      // char.setData('label', i % 10 || 10);
      // this.resetChar(char);
    }
  }

  resize() {
    console.log('Game Scale Width ' + this.game.scale.width, 'Game Scale Height ' + this.game.scale.height);
    this.cameras.resize(this.game.scale.width, this.game.scale.height);
    this.background.setDisplaySize(this.game.scale.width, this.game.scale.height);
    this.player.setPosition(this.game.scale.width / 2 - 8, this.game.scale.height - 64);
    this.x_frac = Array.from({length: gameSettings.maxNumberOfChar},
      (v, i) => 1 / gameSettings.maxNumberOfChar * i);
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
    formData.append('level', 'level1');
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
    this.chars.getChildren().forEach(go => {
      console.log('x,y,label:' + go.x + ',' + go.y + ',' + go.getData('label'));
    });
    let charToDestroy = [];
    for (let pred of predictions) {
      if (pred === -1) continue;
      for (let char of this.chars.getChildren()) {
        if (char.y > 0 && char.getData('label') === (match || pred)) {
          charToDestroy.push(char);
          this.score += 1;
          const scoreFormated = this.zeroPad(this.score, 6);
          this.scoreLabel.text = "SCORE " + scoreFormated;
          console.log('char: ' + char.getData('label'), 'charX, charY : ' + char.y);
          // this.destroyChar(char);
          match = pred;
        }
      }
      if (match) break;
    }

    charToDestroy.forEach(char => char.destroy());
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
        // this.endGame();
        this.destroyChar(obj)
      }
      obj.y += obj.getData('speed');
    });
  }

  dropChar(chars) {
    let numOfCharToDrop = gameSettings.maxNumberOfChar - this.chars.getChildren().length;
    for (let i = 0; i < numOfCharToDrop; ++i) {
      const char = this.createRandomCharacter();
      this.chars.add(char);
    }
    // for(let i = 0; i < num)

  };

  endGame() {
    this.scene.restart()
  }

  destroyChar(gameObject) {
    gameObject.destroy();
  }

  resetChar(gameObject) {
    gameObject.x = Phaser.Math.RND.pick(this.x_frac) * (this.game.scale.width - 63 * 2) + 63;
    gameObject.y = -Phaser.Math.Between(1, 4) * 100;
    gameObject.setData('speed', Phaser.Math.Between(1, 4))
  }
}
