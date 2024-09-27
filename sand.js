class Sand{
  constructor(x,y,size,role,color = 'teal'){
    this.x = x,
    this.y = y;
    this.size = size;
    this.role = role;
    this.color = color;
  }

  draw(ctx){
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.rect(this.x*this.size,this.y*this.size,this.size,this.size);
    ctx.fill();
  }
  
  static update(grid){
    for(let row = grid.length-1;row>0;row--){
      for(let col = grid[row].length-1;col>=0;col--){
        const curr = grid[row][col];
        const above = grid[row-1][col];

        let dir = Math.random()>0.5?-1:1;
        
        const randomSide = grid[row][col+dir];
        const otherSide = grid[row][col-dir];
        
        if(above.role==='sand'){
          if(curr.role==='air'){
            [curr.role,above.role] = ['sand','air'];
            [curr.color,above.color] = [above.color,curr.color];
          }else if(randomSide && randomSide.role === 'air'){
            [randomSide.role,above.role] = ['sand','air'];
            [randomSide.color,above.color] = [above.color,randomSide.color];
          }else if(otherSide && otherSide.role === 'air'){
            [otherSide.role,above.role] = ['sand','air'];
            [otherSide.color,above.color] = [above.color,otherSide.color];
          }
        }
      }
    }
  }

  getNeighbours(grid){
    const neighbours = [];
    const row = this.y;
    const col = this.x;
    //top
    if(grid[row-1] && grid[row-1][col].role === 'sand' && grid[row-1][col].color === this.color){
      neighbours.push(grid[row-1][col]);
    }
    //bottom
    if(grid[row+1] && grid[row+1][col].role === 'sand' && grid[row+1][col].color === this.color){
      neighbours.push(grid[row+1][col]);
    }
    //left
    if(grid[row][col-1] && grid[row][col-1].role === 'sand' && grid[row][col-1].color === this.color){
      neighbours.push(grid[row][col-1]);
    }
    //right
    if(grid[row][col+1] && grid[row][col+1].role === 'sand' && grid[row][col+1].color === this.color){
      neighbours.push(grid[row][col+1]);
    }
    //top left
    if(grid[row-1] && grid[row-1][col-1] && grid[row-1][col-1].role === 'sand' && grid[row-1][col-1].color === this.color){
      neighbours.push(grid[row-1][col-1]);
    }
    //top right
    if(grid[row-1] && grid[row-1][col+1] && grid[row-1][col+1].role === 'sand' && grid[row-1][col+1].color === this.color){
      neighbours.push(grid[row-1][col+1]);
    }
    //bottom left
    if(grid[row+1] && grid[row+1][col-1] && grid[row+1][col-1].role === 'sand' && grid[row+1][col-1].color === this.color){
      neighbours.push(grid[row+1][col-1]);
    }
    //bottom right
    if(grid[row+1] && grid[row+1][col+1] && grid[row+1][col+1].role === 'sand' && grid[row+1][col+1].color === this.color){
      neighbours.push(grid[row+1][col+1]);
    }
    return neighbours;
  }
  
}