const shapes = ['O','I','S','Z','L','J','T'];
const colors = ['#f5dd51','#0c9a7c','#3d2b4f'];

let matrix = null;
let mStartPointX = 35;
let mStartPointY=0;

function makeShape(width){

  const type = randomShape();
  const color = randomColor();
  matrix = shapeMatrix[type];

  return {
    matrix,
    row:0,
    col:Math.floor(width/2-matrix.length/2*(squareSize/sandSize)),
    color
  }
}

function drawMatrix(shape){
  const {matrix,color} = shape;
  const mSize = matrix.length;
  for(let row=0;row<mSize;row++){
    for(let col=0;col<mSize;col++){
      const cell = matrix[row][col]
      if(cell){
        const {startRow,startCol,endRow,endCol} = getGridCoord(shape,row,col);
        fillSquare(startRow,startCol,endRow,endCol,color);
      }
    }
  }
}

function fillSquare(startRow,startCol,endRow,endCol,color){
  
  for(let i = startRow;i<=endRow;i++){
    for(let j = startCol;j<=endCol;j++){
  
      if(grid[i] && grid[i][j]){
        const cell = grid[i][j];
    
        cell.role = 'sand';
        cell.color = color;
      }
    }
  }
}

function checkDownColision(shape,step=1){

  const size = squareSize/sandSize;
  const len = shape.matrix.length;
  //These are the values of the shape (not grid);
  const {bottom} = getSidesOfShape(shape);

  //get the indexes of the grid
  //const topCoords = getGridCoord(shape,top.row,top.col); don't need now
  const bottomCoords = getGridCoord(shape,bottom.row,bottom.col);

  for(let i = 0;i<size*len-bottom.col*size;i++){

    if(!grid[bottomCoords.endRow]) return true;

    for(let j = 1;j<=step;j++){

      if(!grid[bottomCoords.endRow+j+1] && j===1) return true;

      
      if(!grid[bottomCoords.endRow+j+1])return j-1;

      const bottomCell = grid[bottomCoords.endRow+j+1][bottomCoords.startCol];
      if(bottomCell.role === 'sand' && j=== 1) return true;
      if(bottomCell.role === 'sand') return j-1;

    }
  }
  return false;
}

function checkLeftColision(shape,step=1){

  const size = squareSize/sandSize;
  const len = shape.matrix.length;
  //These are the values of the shape (not grid);
  const {left} = getSidesOfShape(shape);
  const leftCoords = getGridCoord(shape,left.row,left.col);

  if(!grid[leftCoords.startRow][leftCoords.startCol]) return true;

  for(let i = 0;i<size*len-left.row*size;i++){
    
    for(let j = 1;j<=step;j++){

      const leftCell = grid[leftCoords.startRow+i][leftCoords.startCol-j];

      if(!leftCell && j===1) return true;
      if(!leftCell || leftCell.role === 'sand') return j-1;
    }
    
  }
  return false;
}

function checkRightColision(shape,step=1){

  const size = squareSize/sandSize;
  const len = shape.matrix.length;
  //These are the values of the shape (not grid);
  const {right} = getSidesOfShape(shape);
  const rightCoords = getGridCoord(shape,right.row,right.col);

  if(!grid[rightCoords.startRow][rightCoords.endCol]) return true;

  for(let i = 0;i<size*len-right.row*size;i++){
    
    for(let j = 1;j<=step;j++){
      const rightCell = grid[rightCoords.startRow+i][rightCoords.endCol+j];

      if(!rightCell && j===1) return true;
      if(!rightCell || rightCell.role === 'sand') return j-1;
    }
  }
  return false;
}



function randomShape(){
  const index= Math.floor(Math.random()*shapes.length);
  return shapes[index];
}
function randomColor(){
  const index= Math.floor(Math.random()*colors.length);
  return colors[index];
}

function rotate(shape,grid){
  let {matrix} = shape;
  const size = squareSize/sandSize;
  const n = matrix.length;

    // Create a new matrix to store the rotated values
    const rotated = Array.from({ length: n }, () => Array(n).fill(0));

    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            rotated[j][n - i - 1] = matrix[i][j];
        }
    }

    //check if the rotated matrix is in the grid's boundries;
    const {left,right} = getSidesOfShape({matrix:rotated});
    if((shape.col+left.col*size)<0) return null; 
    if((shape.col+right.col*size+size)>grid[0].length) return null; 

   return rotated;
}

function getSidesOfShape(shape){
  const {matrix} = shape;
  let top = null;
  let bottom = null;
  for(let i = 0;i<matrix.length;i++){
    for(let j = 0;j<matrix[i].length;j++){
      const cell = matrix[i][j];
      if(cell){
        if(!top) top = {row:i,col:j};
        bottom = {row:i,col:j};
      }
    }
  }
  
  let left = {col:100,row:0};
  let right = {col:-100,row:0};
  for(let i = 0;i<matrix.length;i++){
    for(let j = 0;j<matrix[i].length;j++){
      const cell = matrix[i][j];
      if(cell){
        if(left.col>j){
          left.col = j;
          left.row = i;
        }
        if(right.col<j){
          right.col = j;
          right.row = i;
        }
      }
    }
  }
  
  return {top,bottom,left,right};
}

function getMatrix(type){
  switch (type) {
    case 'O':
      break;
    case 'I':
      break;
    case 'S':
      break;
    case 'Z':
      break;
    case 'L':
      break;
    case 'J':
      break;
    case 'T':
      break;
  }
};

const shapeMatrix = {
  'O':[ 
        [1,1],
        [1,1],
      ],
  'I':[
        [0,0,1,0,0],
        [0,0,1,0,0],
        [0,0,1,0,0],
        [0,0,1,0,0],
      ],
  'S':[
        [0,0,0],
        [0,1,1],
        [1,1,0],
      ],
  'Z':[
        [0,0,0],
        [1,1,0],
        [0,1,1],
      ],
  'L':[
        [0,1,0],
        [0,1,0],
        [0,1,1],
      ],
  'J':[
        [0,1,0],
        [0,1,0],
        [1,1,0],
      ],
  'T':[
        [0,0,0],
        [1,1,1],
        [0,1,0],
      ]
}

