// Optional renderer QA: uses the Canvas 2D API, without a browser.
// Run where @napi-rs/canvas is available. Outputs are kept outside source.
import {createRequire} from 'node:module';
import fs from 'node:fs';
import {Game} from '../src/game.js';
import {Renderer} from '../src/render.js';
const require=createRequire(import.meta.url),{createCanvas}=require('@napi-rs/canvas');
const out=process.argv[2]||'../flatcraft-qa';fs.mkdirSync(out,{recursive:true});
const g=new Game();g.newWorld({seed:'First Horizons',difficulty:'peaceful'});
const canvas=createCanvas(1440,900),r=new Renderer(canvas,createCanvas);r.resize(1440,900,1);
for(let i=0;i<60;i++)g.update(1/60,{});
function shot(name){r.lightTimer=-1;r.snap(g);r.render(g,1/60);fs.writeFileSync(`${out}/${name}.png`,canvas.toBuffer('image/png'));}
shot('day');
g.time=785;shot('evening');
g.time=390;g.player.x=132;g.player.y=82;g.world.rect(128,78,10,7,0);g.world.set(130,83,'torch');g.world.set(135,83,'torch');shot('cave');
g.changeDimension('nether');for(let i=0;i<60;i++)g.update(1/60,{});shot('nether');
g.changeDimension('end');g.player.x=125;g.player.y=84.22;for(let i=0;i<2;i++)g.update(1/60,{});r.render(g,.016);shot('end');
g.changeDimension('overworld');Object.assign(g.player,{x:92.5,y:49.22});g.time=390;r.resize(390,844,1);shot('mobile');
console.log('Canvas renderer QA complete: day, evening, cave, nether, end, mobile.');
