const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 400;
canvas.height = 600;

const squareSize = 20;
const sandSize = 4;
let grid = null 
let currShape = null;

const backgroundColors = ['#7f7f7f','#00ffff','#800080','#ff7f00','#80014d','#f23553','#005169','#569fb1'];
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
  'easy': 1,
  'medium': 2,
  'hard': 3,
}

let fallSpeed = levels[level.value];
let downStep = fallSpeed*3;
let sideStep = fallSpeed+1;
let colide = false;
let goLeft = false;
let goRight = false;
let goDown = false;
let finish = true;

level.onchange = function (e){
  fallSpeed = levels[e.target.value];
  downStep = fallSpeed*3;
  sideStep = fallSpeed+1;
  restart();
  this.blur();
}

window.addEventListener('keydown',(e)=>{
  if(e.key==='ArrowLeft') goLeft = true;
  if(e.key==='ArrowRight') goRight = true;
  if(e.key==='ArrowDown') goDown = true;
});
window.addEventListener('keyup',(e)=>{
  if(e.key==='ArrowLeft') goLeft = false;
  if(e.key==='ArrowRight') goRight = false;
  if(e.key==='ArrowDown') goDown = false;
  if(e.code==='Space'){
    clearMatrix(currShape,grid);
    const rotated = rotate(currShape,grid);
    if(rotated) currShape.matrix = rotated;
    drawMatrix(currShape);
  } 
  
});


let lastTime = 0;
const levelUpStep = 1000;
let progress = levelUpStep;

function animate(time){
 
  const diff = time - lastTime;
  const score = Number(scoreEl.innerText);

  if(diff>50 && !finish){
    ctx.clearRect(0,0,canvas.width,canvas.height);

    if(score>0 && score>=progress){
      levelAudio.play();
      canvas.style.backgroundColor = backgroundColors[Math.min(progress/levelUpStep,backgroundColors.length-1)];
      fallSpeed ++;
      downStep = fallSpeed*3; 
      sideStep = fallSpeed+1;
      progress += levelUpStep;
    }
    

    if(colide){
      if(currShape.row <= 2) finish = true;
      currShape = makeShape(grid[0].length);
      drawMatrix(currShape);
      colide = false;
    }

    Sand.update(grid);
    isComplete(grid);
    draw(grid);
    matrixMove(currShape,grid);
    
    lastTime = time;
  }
  requestAnimationFrame(animate);
}


animate();

function restart(){
  grid = createGrid(canvas.width,canvas.height,sandSize);
  currShape = makeShape(grid[0].length);
  ctx.clearRect(0,0,canvas.width,canvas.height);
  finish = true;
  playBtn.innerText = 'Play';
  restartBtn.blur();
}

function start(){
  if(finish){
    grid = grid || createGrid(canvas.width,canvas.height,sandSize);
    currShape = currShape || makeShape(grid[0].length);
    drawMatrix(currShape);
    finish = false;
    playBtn.innerText = 'Pause';
  }else{
    finish = true;
    playBtn.innerText = 'Play';
  }
  playBtn.blur();
}

function matrixMove(shape,grid){
  let colision = true;
  if(goLeft) colision = checkLeftColision(shape,sideStep);
  if(goRight) colision = checkRightColision(shape,sideStep);
  if(colision !== true){
    clearMatrix(shape,grid);
    if(goRight) shape.col += colision===false ? sideStep : colision;
    if(goLeft) shape.col -= colision===false ? sideStep : colision;
    drawMatrix(shape);
  }

  //it should go down;
  let step = goDown ? downStep : fallSpeed;
  colision = checkDownColision(shape,step);
  if(colision!==true){
    clearMatrix(shape,grid);
    currShape.row += colision===false ? step : colision;
    drawMatrix(shape);
  }else{
    sandAudio.play();
    colide = true;
  }
  
}

function getGridCoord(shape,mRow,mCol){
  const {row:gRow,col:gCol} = shape;
  const size = squareSize/sandSize;
  const startRow = gRow+mRow*size;
  const startCol = gCol+mCol*size;
  const endRow = startRow + size;
  const endCol = startCol + size;
   return {
    startRow,
    startCol,
    endRow,
    endCol
   }
}

function draw(grid){
  for(let i = 0;i<grid.length;i++){
    for(let j = 0;j<grid[i].length;j++){
      const sand = grid[i][j];
        if(sand.role === 'sand'){
          if(sand.color === 'gold'){
            sand.role = 'air';
          }
        sand.draw(ctx);
      }
    }
  }
}

function createGrid(width,height,cellSize){
  const colCount = width/cellSize;
  const rowCount = height/cellSize;

  const grid = Array(rowCount).fill().map(()=>Array(colCount).fill(0));

  for(let i = 0;i<grid.length;i++){
    for(let j = 0;j<grid[i].length;j++){
      grid[i][j] = new Sand(j,i,cellSize,'air');
    }
  }
  return grid;
}

function clearMatrix(shape,grid){
  const{matrix,row,col} = shape;
  const length = matrix.length;
  const size = squareSize/sandSize;
  for(let r = 0;r<length;r++){
    for(let c = 0;c<length;c++){
      if(!matrix[r][c]) continue;
      const gridRow = r*size + row;
      const gridCol = c*size + col;
      for(let i = 0;i<=size+1;i++){
        for(let j =  0;j<=size;j++){
          if(!grid[gridRow+i]) continue;
          const cell = grid[gridRow+i][gridCol+j];
          if(cell) cell.role = 'air';
        }
      }
    }
  }
}


function isComplete(grid){
  
  let left = false;
  let right = false;
  const visited = new Set();

  for(let i = grid.length-1;i>=0;i--){
    for(let j = grid[i].length-1;j>=0;j--){
      const key = `${i},${j}`;
      const cell = grid[i][j];

      if(visited.has(key) || cell.role==='air') continue;

      const group = [];
      const stack = [cell];

      while(stack.length>0){
        const curr = stack.pop();
        const key = `${curr.y},${curr.x}`;
        if(visited.has(key)) continue;
        group.push([curr.y,curr.x]);
        visited.add(key);
        if(curr.x===0) left = true;
        if(curr.x===grid[0].length-1) right = true;
        stack.push(...curr.getNeighbours(grid));
      }

      if(left && right){
        finish = true;
        scoreEl.innerText = Number(scoreEl.innerText)+Math.floor(group.length/10);
        for(let [row,col] of group){
          const cell = grid[row][col];
          cell.color = 'gold';
          lineConntected.play();
          setTimeout(()=>{
            finish = false;
            cell.role = 'air';
          },400);
        }
      }

      // group.length = 0;
      left = false;
      right = false;
    }  
  }

}

