import Phaser from 'phaser'
import './css/menu.css'

export default class MenuScene extends Phaser.Scene {

  constructor() {
    super("menuScene");
  }

  init(data) {
    console.log(data);
    this.score = data.score
  }

  create() {
    this.menuContainer = document.getElementById('menu');
    // this.canvas = document.getElementById('canvas');
    this.goBtn = document.getElementById('gobtn');
    this.levelList = document.getElementById('levellist');
    this.scoreDiv = document.getElementById('score');
    this.scoreDiv.innerHTML = this.score;

    this.menuContainer.style.display = 'block';
    // this.canvas.style.display = 'none';

    this.registerEvent();
  }

  registerEvent() {
    this.goBtn.onclick = () => {
      this.goBtnClick();
    }
  }

  goBtnClick() {
    let level = this.levelList.selectedOptions[0].value;
    this.scene.start('playGame', {level: level});
    this.menuContainer.style.display = 'none';
    // this.canvas.style.display = 'block';
    this.scene.remove('menuScene')
  }

}
