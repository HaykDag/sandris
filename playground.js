class Playground{
  constructor(canvas,nextCanvas){
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.nextCanvas = nextCanvas;
    this.grid = this.createGrid();
    this.center = Math.floor(this.grid[1].length/2)-6;
    this.shape = new Shape(0,this.center);
    this.nextShape = new Shape(0,this.center);
    this.goLeft = false;
    this.goRight = false;
    this.goDown = false;
    this.colide = false;
    this.levelUp = 200;
    this.progress = this.levelUp;
    this.#addListeners();
    
  }

  update(){
    this.moveMatrix();
    this.isComplete();
    if(this.colide){
      if(this.shape.row<=2) finish = true;
      this.colide = false;
      this.shape = this.nextShape;
      this.nextShape = new Shape(0,this.center);
    }
    this.clearMatrix();
    this.drawMatrix();
    this.drawNext();
    Sand.update(this.grid);
    this.draw();
  }

  draw(){
    const {canvas,ctx,grid} = this;
    ctx.clearRect(0,0,canvas.width,canvas.height);

    for(let i = 0;i<grid.length;i++){
      for(let j = 0;j<grid[i].length;j++){
        const cell = grid[i][j];
          if(cell.role === 'sand'){
            if(cell.color === 'red'){
              cell.role = 'air';
            }
          cell.draw(ctx);
        }
      }
    }
  }

  drawMatrix(){
    const {matrix,color} = this.shape;
    const mSize = matrix.length;
    for(let row=0;row<mSize;row++){
      for(let col=0;col<mSize;col++){
        const cell = matrix[row][col];
        if(cell){
          this.#fillSquare(row,col,color);
        }
      }
    }
  }

  #fillSquare(row,col,color){
    const {grid} = this;
    const {row:gRow,col:gCol} = this.shape;
    const size = squareSize/sandSize;
    
    const startRow = gRow+row*size;
    const startCol = gCol+col*size;
    const endRow = startRow + size;
    const endCol = startCol + size;

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

  moveMatrix(){
    const {goLeft,goRight,goDown} = this;
    const legalMoves = this.shape.checkMove(this.grid);
    
    this.clearMatrix();
    if(goLeft) this.shape.col -= Math.min(sideStep,legalMoves.left);
    if(goRight) this.shape.col += Math.min(sideStep,legalMoves.right);

    const downMove = goDown ? downStep : fallSpeed;
    this.shape.row += Math.min(downMove,legalMoves.down);
    this.drawMatrix();

    //this means the shape already hit the bottom
    if(downMove>=legalMoves.down){
      sandAudio.play();
      this.colide = true;
    }
  }

  clearMatrix(){
    const{grid} = this;
    const {matrix,row,col} = this.shape;
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
  
  //this will return corresponding rows and col-s
  //from grid 
  getCoords(){
    const { left, right, bottom } = this.shape.sides;
    const size = squareSize/sandSize;
    const lCoords = {col:null,rows:[]};
    const rCoords = {col:null,rows:[]};
    const bCoords = {row:null,cols:[]};

    //left
    lCoords.col = this.shape.col+left.col*size;
    for(let i = 0;i<left.rows.length;i++){
      for(let j = 0;j<size;j++){
        lCoords.rows.push(this.shape.row+left.rows[i]*size+j);
      }
    }

    //right
    rCoords.col = this.shape.col+size*(right.col+1);
    for(let i = 0;i<right.rows.length;i++){
      for(let j = 0;j<size;j++){
        rCoords.rows.push(this.shape.row+right.rows[i]*size+j);
      }
    }

    //bottom
    bCoords.row = this.shape.row+1+size*(bottom.row+1);
    for(let i = 0;i<bottom.cols.length;i++){
      for(let j = 0;j<=size;j++){
        bCoords.cols.push(this.shape.col+bottom.cols[i]*size+j);
      }
    }
    
    return {lCoords,rCoords,bCoords};
  }

  createGrid(){
    const {width,height} = this.canvas;
    const colCount = Math.floor(width/sandSize);
    const rowCount = Math.floor(height/sandSize);
    
    const grid = Array(rowCount).fill().map(()=>Array(colCount).fill(0));

    for(let i = 0;i<grid.length;i++){
      for(let j = 0;j<grid[i].length;j++){
        grid[i][j] = new Sand(j,i,sandSize,'air');
      }
    }
    return grid;
  }

  isComplete(){
    const {grid} = this;
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
          const score = Number(scoreEl.innerText)+Math.floor(group.length/10);
          scoreEl.innerText = score;
          if(score>=this.progress){
            levelAudio.play();
            fallSpeed++;
            sideStep++;
            levelChange(fallSpeed);
            this.progress += this.levelUp;
          }
          for(let [row,col] of group){
            const cell = grid[row][col];
            cell.color = 'red';
            lineConntected.play();
            setTimeout(()=>{
              finish = false;
              cell.role = 'air';
            },400);
          }
        }
        left = false;
        right = false;
      }  
    }
  }

  drawNext(){
    const {matrix,color} = this.nextShape;
    const {nextCanvas} = this;
    nextCtx.clearRect(0,0,nextCanvas.width,nextCanvas.height);
    for(let i = 0;i<matrix.length;i++){
      for(let j = 0;j<matrix[i].length;j++){
        const square = matrix[i][j];
        const size = squareSize*0.7;
        if(square){
          nextCtx.beginPath();
          nextCtx.rect(j*size,i*size,size,size);
          nextCtx.fillStyle = color;
          nextCtx.fill();
        }
      }
    }
  }

  #addListeners(){
    if(platform === 'Desktop'){
      window.addEventListener('keydown',(e)=>{
        if(e.key==='ArrowLeft') this.goLeft = true;
        if(e.key==='ArrowRight') this.goRight = true;
        if(e.key==='ArrowDown') this.goDown = true;
        if(e.code==='Space'){
          this.clearMatrix();
          const rotated = this.shape.rotate(this.grid);
          if(rotated) this.shape.matrix = rotated;
          this.drawMatrix();
        } 
      });

      window.addEventListener('keyup',(e)=>{
        if(e.key==='ArrowLeft') this.goLeft = false;
        if(e.key==='ArrowRight') this.goRight = false;
        if(e.key==='ArrowDown') this.goDown = false;
      });
    }else{

      let startYTouch = 0;
      let prevTouch = null;
      let touchStartTime = 0;

      this.canvas.addEventListener('touchstart',(e)=>{
        e.preventDefault();

        startYTouch = e.touches[0].clientY;

        const now = Date.now();
        const timeSinceLastTouch = now - touchStartTime;

        if (timeSinceLastTouch < 300) {
          this.clearMatrix();
          const rotated = this.shape.rotate(this.grid);
          if(rotated) this.shape.matrix = rotated;
          this.drawMatrix();
        }

        touchStartTime = now;
      });

      this.canvas.addEventListener('touchend',(e)=>{
        this.goLeft = false;
        this.goRight = false;
        this.goDown = false;
        prevTouch = null;
        startYTouch = 0;
      });


      this.canvas.addEventListener('touchmove',(e)=>{
        this.goDown = false;
        this.goLeft = false;
        this.goRight = false;

        const {clientX,clientY} = e.changedTouches[0];

        if(!prevTouch){
          prevTouch = clientX;
          return;
        }
        
        const xDiff = clientX-prevTouch;
        const yDiff = clientY-startYTouch;
        
      if(yDiff>Math.abs(xDiff)){
        downStep = Math.floor(Math.abs(yDiff*0.1));
        this.goDown = true;
      }else{
        sideStep = Math.floor(Math.abs(xDiff*0.07));
        if(xDiff<-1){
          this.goLeft = true;
        }else if(xDiff>1){
          this.goRight = true;
        } 
      }
      
      });
    }
  }
}