let c,ctx;
let mouse=[0,0];
let camera=[0,0];
let grid;
let player;
let lvl=1;
let time;
const startTime=50;
const speed=2.8;
const tileSize=30;
const playerSize=20;
const first=8;
const limit=18;
const dirs=[
        [0,-1,1],
        [0,1,0],
        [-1,0,3],
        [1,0,2],
    ];
const init=()=>{
    c=document.querySelector("canvas");
    canvasResize();
    ctx=c.getContext("2d");
    events();
    alert("Reach the red place!\n");
    alert("Level 1");
    startLevel(first,first);
    time=startTime;
    setInterval(()=>{
        if(--time<=0) {
            alert("You lost!");
            alert("You reached level "+lvl);
            lvl=1;
            time=startTime;
            startLevel(first,first);
        }
    },1000);
    frame();
}
const canvasResize=()=>{
    c.width=innerWidth;
    c.height=innerHeight;
}
const events=()=>{
    onresize=canvasResize;
    addEventListener("ontouchstart" in document?"touchstart":"mousemove",e=>{
        if(e.changedTouches) e=e.changedTouches[0];
        mouse[0]=e.pageX;
        mouse[1]=e.pageY;
    });
    addEventListener("ontouchstart" in document?"touchmove":"mousemove",e=>{
        if(e.changedTouches) e=e.changedTouches[0];
        player[2]=Math.atan2(e.pageY-mouse[1],e.pageX-mouse[0]);
        player[3]=Math.hypot(e.pageY-mouse[1],e.pageX-mouse[0])>20?true:false;
    });
    addEventListener("ontouchstart" in document?"touchend":"mouseup",()=>{
        player[3]=false;
    });
}
const frame=()=>{
    updatePlayer();
    follow(player[0],player[1],c.width/2,c.height/2);
    ctx.beginPath();
    ctx.fillStyle="black";
    ctx.fillRect(0,0,c.width,c.height);
    drawMaze();
    drawPlayer();
    ctx.beginPath();
    ctx.fillStyle="lime";
    ctx.font="20px monospace";
    ctx.fillText(time+" seconds remaining",10,20);
    requestAnimationFrame(frame);
}
const makeMaze=(w,h)=>{
    let mazeMap=new Array(h).fill(0).map(row=>new Array(w).fill(0).map(cell=>[0,0,0,0,0]));
    let active=[
        [0,0]
    ];
    mazeMap[0][0][4]=1;
    while(active.length) {
        let idx=Math.floor(Math.random()*active.length);
        let a=active[idx];
        let nb=[];
        for(let i=0;i<4;i++){
            let dir=dirs[i];
            let x=a[0]+dir[0];
            let y=a[1]+dir[1];
            if(x<0||x>w-1||y<0||y>h-1) continue;
            let cell=mazeMap[y][x];
            if(cell[4]==0) {
                cell[4]=1;
                cell[dir[2]]=1;
                mazeMap[a[1]][a[0]][i]=1;
                nb.push([x,y]);
            }
        }
        if(!nb.length) {
            active.splice(idx,1);
            continue;
        }
        active=active.concat(nb);
    }
    grid=new Array(h*2+1).fill(0).map((row,y)=>new Array(w*2+1).fill(0).map((tile,x)=>y%2&&x%2?0:1));
    for(let y=0;y<h;y++) {
        for(let x=0;x<w;x++) {
            let cell=mazeMap[y][x];
            for(let i=0;i<4;i++) {
                if(cell[i]) grid[2*y+1+dirs[i][1]][2*x+1+dirs[i][0]]=0;
            }
        }
    }
    grid[rand(0,h-1)*2+1][w*2]=2;
}
const drawMaze=()=>{
    grid.forEach((row,y)=>{
        row.forEach((tile,x)=>{
            ctx.beginPath();
            const grd1=ctx.createRadialGradient(player[0]+camera[0],player[1]+camera[1],0,player[0]+camera[0],player[1]+camera[1],140);
            grd1.addColorStop(0,"white");
            grd1.addColorStop(1,"black");
            const grd2=ctx.createRadialGradient(player[0]+camera[0],player[1]+camera[1],0,player[0]+camera[0],player[1]+camera[1],140);
            grd2.addColorStop(0,"red");
            grd2.addColorStop(1,"black");
            ctx.fillStyle=tile?tile==1?"black":grd2:grd1;
            ctx.fillRect(x*tileSize+camera[0],y*tileSize+camera[1],tileSize,tileSize);
        });
    });
}
const drawPlayer=()=>{
    ctx.beginPath();
    ctx.fillStyle="lime";
    ctx.fillRect(player[0]-playerSize/2+camera[0],player[1]-playerSize/2+camera[1],playerSize,playerSize);
}
const updatePlayer=()=>{
    if(player[3]) {
        let vx=speed*Math.cos(player[2]);
        let vy=speed*Math.sin(player[2]);
        let pos=[Math.floor(player[0]/tileSize),Math.floor(player[1]/tileSize)];
        if(vx>0&&(collide(pos[0]+1,pos[1]))) {
            player[0]=(pos[0]+1)*tileSize-playerSize/2;
        } else if(vx<0&&(collide(pos[0]-1,pos[1]))) {
            player[0]=pos[0]*tileSize+playerSize/2;
        } else {
            player[0]+=vx;
        }
        if(vy>0&&(collide(pos[0],pos[1]+1))) {
            player[1]=(pos[1]+1)*tileSize-playerSize/2;
        } else if(vy<0&&(collide(pos[0],pos[1]-1))) {
            player[1]=pos[1]*tileSize+playerSize/2;
        } else {
            player[1]+=vy;
        }
    }
}
const startLevel=(w,h)=>{
    makeMaze(w,h);
    player=[1.5*tileSize,1.5*tileSize+(rand(0,first+lvl-1)*2)*tileSize,0,false];
}
const collide=(x,y)=>{
    if(Math.abs(x*tileSize+tileSize/2-player[0])<=(tileSize+playerSize)/2&&Math.abs(y*tileSize+tileSize/2-player[1])<=(tileSize+playerSize)/2) {
        if(grid[y][x]==1) return true;
        if(grid[y][x]==2) {
            time+=startTime/2;
            lvl++;
            alert("You won!");
            alert("Level "+lvl);
            startLevel(first+Math.min(lvl,limit),first+Math.min(lvl,limit));
        }
    }
    return false;
}
const follow=(x,y,posX,posY)=>{
    camera[0]=-x+posX;
    camera[1]=-y+posY;
}
const rand=(min,max)=>Math.floor(Math.random()*(max-min+1)+min);
onload=setTimeout(()=>{
    document.querySelector(".loading").style.display="none";
    init();
},3000);