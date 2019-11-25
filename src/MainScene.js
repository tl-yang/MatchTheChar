import Phaser from 'phaser'

export const gameSettings = {
  playerSpeed: 200,
  maxPowerups: 2,
  powerUpVel: 50,
  maxNumberOfChar: 5,
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

    this.chars = this.physics.add.group({
      key: 'numbers',
      frame: Array.from({length: 20}, (v, i) => i + 1),
      randomFrame: true,
      max: gameSettings.maxNumberOfChar,
    });
    this.chars.getChildren().forEach(go => this.resetChar(go));

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

    // this.music.play(musicConfig);
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
    this.dropChar(this.chars);

    this.movePlayerManager();

    if (Phaser.Input.Keyboard.JustDown(this.spacebar)) {
      this.matchChar();
      this.clearDraw();
    }
  }

  movePlayerManager() {
    this.player.setVelocity(0);
    if (this.cursorKeys.left.isDown) {
      this.player.setVelocityX(-gameSettings.playerSpeed);
    } else if (this.cursorKeys.right.isDown) {
      this.player.setVelocityX(gameSettings.playerSpeed);
    }
  }

  draw() {

  }

  matchChar() {
    const imageData = this.context.getImageData(this.minX, this.minY, this.maxX - this.minX, this.maxY - this.minY);
    const base64ed = this._arrayBufferToBase64(imageData.data);
    console.log(base64ed);
    fetch('http://127.0.0.1:5000/recognition', {
      mode: 'cors',
      method: 'post',
      headers: {
        'Content-type': 'application/json'
      },
      body: JSON.stringify({
        level: 'level1',
        width: imageData.width,
        height: imageData.height,
        input: base64ed
      })
    })
      .then(res => {
        console.log(res);
        res.json().then(res => console.log(res));
      });
    // .then(res => console.log(res));
    console.log(this.minX, this.minY, this.maxX - this.minX, this.maxY - this.minY);
    console.log(imageData)
    // imageData.
    // let image = this.canvas.toDataURL('image/png').replace("image/png", "image/octet-stream");
    // window.location.href = image;


  }

  _arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  clearDraw() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.maxX = 0;
    this.maxY = 0;
    this.minX = this.canvas.width;
    this.minY = this.canvas.height;
    // this.resetChar()
  }

  moveChar(char) {
    char.getChildren().forEach((obj) => {
      obj.y += obj.getData('speed');
      if (obj.y > this.game.config.height) {
        this.endGame();
        this.resetChar(obj)
      }
    });
  }

  dropChar(chars) {
    let numOfCharToDrop = gameSettings.maxNumberOfChar - chars.length;
    if (numOfCharToDrop) {
      // this.this.chars.addMultiple()
    }

  };

  endGame() {
  }


  resetChar(gameObject) {
    gameObject.x = Phaser.Math.RND.pick(this.x_frac) * (this.game.scale.width - 63 * 2) + 63;
    gameObject.y = -Phaser.Math.Between(1, 4) * 100;
    gameObject.setData('speed', Phaser.Math.Between(3, 7))
  }
}
