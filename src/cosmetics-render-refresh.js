import {installPlayerCosmetics} from './player-cosmetics.js?v=20261011-6';

const renderer=window.FlatCraft?.renderer;
if(renderer){
 renderer.__cosmeticsDrawPlayerInstalled=false;
 installPlayerCosmetics(renderer);
}
