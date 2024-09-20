const shapes = ['O','I','S','Z','L','J','T'];
const colors = ['#f5dd51','#0c9a7c','#b53365'];
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

class Shape{
  constructor(row,col){
    this.row = row;
    this.col = col;
    this.matrix = this.#randomShape();
    this.sides = this.getSides(this.matrix);
    this.color = this.#randomColor();
  }

  rotate(grid){
    let {matrix} = this;
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
      const sides = this.getSides(rotated);
      const {left,right} = sides;
      if((this.col+left.col*size)<0) return null; 
      if((this.col+size*(right.col+1))>grid[0].length) return null; 

    this.sides = sides;
    return rotated;
  }

  #randomColor(){
    const index= Math.floor(Math.random()*colors.length);
    return colors[index];
  }

  #randomShape(){
    const index= Math.floor(Math.random()*shapes.length);
    const matrix = shapeMatrix[shapes[index]];
    return matrix;
  }

  getSides(matrix){

    const left = {col:null,rows:[]};
    const right = {col:null,rows:[]};
    const bottom = {row:null,cols:[]};

    for(let i = matrix.length-1;i>=0;i--){
      const row = matrix[i];
      if(row.includes(1) && !bottom.row){
        bottom.row = i;
        for(let j = 0;j<row.length;j++){
          if(row[j]===1){
            bottom.cols.push(j);
          }
        }
      }
    }

  for(let col = 0;col<matrix[0].length;col++){
    if(left.col!==null) continue;
    for(let row = 0;row<matrix.length;row++){
      const square = matrix[row][col];
      if(square===1){
        left.col = col;
        left.rows.push(row);
      }
    }
  }

  for(let col = matrix[0].length-1;col>=0;col--){
    if(right.col!==null) continue;
    for(let row = 0;row<matrix.length;row++){
      const square = matrix[row][col];
      if(square===1){
        right.col = col;
        right.rows.push(row);
      }
    }
  }
  return {left,right,bottom};
}
  
  checkMove(grid){
    const legalMoves = {left:1000,right:1000,down:1000};
    const {lCoords,rCoords,bCoords} = playground.getCoords();

    //go left
    for(let i = 0;i<lCoords.rows.length;i++){
      const row = lCoords.rows[i]; 
      for(let col = lCoords.col-1;col>=-1;col--){
        const cell = grid[row][col];
        if(!cell || cell.role === 'sand'){
          legalMoves.left = Math.min(legalMoves.left,lCoords.col-(col+1));
        }
      }
    }
    //go right
    for(let i = 0;i<rCoords.rows.length;i++){
      const row = rCoords.rows[i]; 
      for(let col = rCoords.col+1;col<=grid[0].length;col++){
        const cell = grid[row][col];
        if(!cell || cell.role === 'sand'){
          legalMoves.right = Math.min(legalMoves.right,col-rCoords.col-1);
        }
      }
    }
    //go down
    for(let i = 0;i<bCoords.cols.length;i++){
      const col = bCoords.cols[i];
      for(let row = bCoords.row+1;row<=grid.length;row++){
        if(!grid[row] || grid[row][col].role === 'sand'){
          legalMoves.down = Math.min(legalMoves.down,row-bCoords.row-1);
        }
      }
    }
    
    return legalMoves;
  }

}
