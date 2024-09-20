const canvas = document.getElementById('boardCanvas');
const ctx = canvas.getContext('2d');

const nextCanvas = document.getElementById('nextCanvas');
const nextCtx = nextCanvas.getContext('2d');

const platform = detectDevice();

canvas.width = platform === 'Mobile' ? window.innerWidth*0.7 : window.innerWidth*0.3;
canvas.height = platform === 'Mobile' ? window.innerHeight*0.7 : window.innerHeight*0.85;

const squareSize = 20;
const sandSize = 5;

nextCanvas.width = (squareSize*3)*0.7;
nextCanvas.height = (squareSize*3)*0.7;

const level = document.getElementById('level');
const playBtn = document.getElementById('playBtn');
const restartBtn = document.getElementById('restart');
const scoreEl = document.getElementById('score');

const sandAudio = document.createElement('audio');
sandAudio.src = './audio/sand-audio.mp3';

const levelAudio = document.createElement('audio');
levelAudio.src = './audio/level-up.mp3';

const lineConntected = document.createElement('audio');
lineConntected.src = './audio/line-connect.mp3';


const levels = {
  'beginner': {speed:1,world:'world-1.jpg'},
  'easy': {speed:3,world:'world-2.jpg'},
  'normal': {speed:5,world:'world-3.jpg'},
  'hard': {speed:7,world:'world-4.jpg'},
  'insane': {speed:9,world:'world-5.jpg'},
  'crazy': {speed:11,world:'world-6.jpg'},
}

const playground = new Playground(canvas,nextCanvas);

let lastTime = 0;
let finish = true;

function animate(time){
  if(!finish && time - lastTime>70){
    playground.update();
    lastTime = time;
  }
  requestAnimationFrame(animate);
}

animate();


let fallSpeed = levels[level.value].speed;
const downStep = 30;
let sideStep = 4+fallSpeed;
let colide = false;


level.onchange = function (e){
  levelChange(e.target.value);
  restart();
  this.blur();
}

function start(){
  if(finish){
    playground.grid = playground.grid || playground.createGrid();
    playground.currShape = playground.currShape || new Shape(0,playground.center);
    playground.nextShape = playground.nextShape || new Shape(0,playground.center);
    finish = false;
    playBtn.innerText = 'Pause';
  }else{
    finish = true;
    playBtn.innerText = 'Play';
  }
  playBtn.blur();
}

function restart(){
  playground.grid = playground.createGrid();
  playground.currShape = new Shape(0,playground.center);
  playground.nextShape = new Shape(0,playground.center);
  ctx.clearRect(0,0,canvas.width,canvas.height);
  nextCtx.clearRect(0,0,nextCanvas.width,nextCanvas.height);
  finish = true;
  scoreEl.innerText = 0;
  playBtn.innerText = 'Play';
  restartBtn.blur();
}


function detectDevice() {
  const userAgent = navigator.userAgent;

  if (/Android|webOS|iPhone|iPad|iPod/i.test(userAgent)) {
    return 'Mobile';
  } else {
    return 'Desktop';
  }
}

function levelChange(value){
  for(key in levels){
    const {speed,world} = levels[key];
    if(speed===value || key===value){
      fallSpeed = speed;
      sideStep = fallSpeed+4;
      document.body.style.backgroundImage = `url('./pics/${world}')`
    }
  }
}
