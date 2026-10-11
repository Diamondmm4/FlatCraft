import {B,BD} from './data.js';

// Tree foliage should never block movement. This affects the player and mobs
// because both collision systems read the shared block `solid` property.
if(BD[B.leaves]) BD[B.leaves].solid=false;
if(BD[B.spruce_leaves]) BD[B.spruce_leaves].solid=false;
