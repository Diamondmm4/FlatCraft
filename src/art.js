/* FlatCraft's original pixel art. All silhouettes, textures and palettes below
 * are drawn in code; no images or textures from another game are used.
 * The canvas factory keeps this module usable in browsers and headless tests. */

const SIZE = 16;
const BLOCK_IDS = new Set(('air grass dirt stone cobblestone log leaves planks bedrock sand gravel coal_ore iron_ore gold_ore diamond_ore redstone_ore lapis_ore emerald_ore obsidian water lava glass crafting_table furnace chest torch ladder door door_open bed farmland wheat_crop flower grass_tuft snow snow_grass spruce_log spruce_leaves cactus bricks stone_bricks nether_bricks netherrack soul_sand glowstone quartz_ore end_stone end_frame end_portal nether_portal bookshelf enchanting_table brewing_stand iron_block gold_block diamond_block tnt redstone_lamp redstone_wire lever stone_slab oak_sapling fence sugar_cane clay smithing_table').split(' '));

const palettes = {
  dirt: ['#735039', '#805b3d', '#9b6c46', '#b18053', '#593f32'],
  stone: ['#64727b', '#738089', '#83909a', '#a0abb0', '#53616b'],
  sand: ['#bd9c62', '#cfb477', '#e3c98e', '#eddba8', '#ac915f'],
  gravel: ['#68736f', '#828c82', '#a0a697', '#bdbea9', '#535f5b'],
  end: ['#9d976c', '#b8b384', '#d3d1a0', '#e4e3b5', '#81835e'],
  nether: ['#603e43', '#784449', '#915354', '#a9635c', '#452e3a'],
};
const metal = {
  wood: ['#624534', '#a37744', '#deb76a'],
  stone: ['#455461', '#89999c', '#d3d9cc'],
  iron: ['#617280', '#bccdd0', '#f2f1da'],
  gold: ['#946029', '#eac052', '#fff4aa'],
  diamond: ['#21676f', '#53d1c3', '#c5ffdc'],
  netherite: ['#302c40', '#68566c', '#ac8594'],
  leather: ['#603d32', '#a8633e', '#dfa36b'],
};

function hash(id) {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) h = Math.imul(h ^ id.charCodeAt(i), 16777619);
  return h >>> 0;
}
function random(seed) {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

// Pixel-only drawing deliberately avoids antialiasing at the native scale.
class Pixels {
  constructor() { this.a = Array(SIZE * SIZE).fill(null); }
  p(x, y, c) { if (x >= 0 && x < 16 && y >= 0 && y < 16) this.a[(y | 0) * 16 + (x | 0)] = c; }
  r(x, y, w, h, c) { for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) this.p(xx, yy, c); }
  l(x0, y0, x1, y1, c, width = 1) {
    const dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1;
    const dy = -Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    for (;;) {
      this.r(x0, y0, width, width, c);
      if (x0 === x1 && y0 === y1) break;
      const e2 = err * 2;
      if (e2 >= dy) { err += dy; x0 += sx; }
      if (e2 <= dx) { err += dx; y0 += sy; }
    }
  }
  poly(points, color) {
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
      const px = x + .5, py = y + .5;
      let inside = false;
      for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
        const [xi, yi] = points[i], [xj, yj] = points[j];
        if (((yi > py) !== (yj > py)) && px < ((xj - xi) * (py - yi) / (yj - yi) + xi)) inside = !inside;
      }
      if (inside) this.p(x, y, color);
    }
  }
  ellipse(cx, cy, rx, ry, color) {
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++)
      if (((x + .5 - cx) / rx) ** 2 + ((y + .5 - cy) / ry) ** 2 <= 1) this.p(x, y, color);
  }
  outline(color = '#26323a') {
    const old = this.a.slice();
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
      if (old[y * 16 + x]) continue;
      if ((x && old[y * 16 + x - 1]) || (x < 15 && old[y * 16 + x + 1]) ||
          (y && old[(y - 1) * 16 + x]) || (y < 15 && old[(y + 1) * 16 + x])) this.p(x, y, color);
    }
  }
}

function earth(s, pal, rand) {
  s.r(0, 0, 16, 16, pal[1]);
  // Broad mineral patches interlock with small details: texture, not static.
  for (let i = 0; i < 10; i++) {
    const x = (rand() * 16) | 0, y = (rand() * 16) | 0;
    const w = 2 + ((rand() * 4) | 0), h = 1 + ((rand() * 3) | 0);
    s.r(x, y, w, h, pal[i % 2 ? 0 : 2]);
    if (i % 3 === 0) s.r(x + 1, y, Math.max(1, w - 2), 1, pal[3]);
  }
  for (let i = 0; i < 6; i++) s.p((rand() * 16) | 0, (rand() * 16) | 0, pal[4]);
}

function masonry(s, base, light, shadow, mortar, offset = 0, rows = 4) {
  s.r(0, 0, 16, 16, mortar);
  const height = 16 / rows;
  for (let row = 0; row < rows; row++) {
    const shift = ((row + offset) % 2) * 4;
    for (let x = -8 + shift; x < 16; x += 8) {
      s.r(x + 1, row * height + 1, 7, height - 1, base);
      s.r(x + 1, row * height + 1, 7, 1, light);
      s.r(x + 7, row * height + 2, 1, height - 2, shadow);
    }
  }
}

function gem(s, dark, middle, light, x = 8, y = 8, scale = 1) {
  const pts = [[x - 3 * scale, y - 5 * scale], [x + 2 * scale, y - 5 * scale],
    [x + 5 * scale, y - scale], [x + 3 * scale, y + 4 * scale],
    [x - scale, y + 6 * scale], [x - 5 * scale, y + scale]];
  s.poly(pts, dark);
  s.poly([[x - 3 * scale, y - 4 * scale], [x + scale, y - 4 * scale], [x + 3 * scale, y], [x, y + 4 * scale], [x - 3 * scale, y + scale]], middle);
  s.l(x - 2, y - 3, x, y - 3, light);
  s.l(x - 3, y - 2, x - 3, y, light);
  s.p(x + 2, y + 2, light);
}

function ore(s, type, rand) {
  earth(s, type === 'quartz' ? palettes.nether : palettes.stone, rand);
  const shades = {
    coal: ['#27353d', '#384650', '#64717a'], iron: ['#865c46', '#d49770', '#efc49c'],
    gold: ['#ac7632', '#edc354', '#fff1a0'], diamond: ['#257c7e', '#50d8c8', '#c5ffe9'],
    redstone: ['#742b48', '#d34d64', '#ff9b8a'], lapis: ['#284f80', '#497fb7', '#86c3e0'],
    emerald: ['#236749', '#42b773', '#a5f59b'], quartz: ['#9c8490', '#e0d2c5', '#fff3dc'],
  }[type];
  const positions = [[3, 3], [10, 2], [7, 9], [13, 12], [1, 13]];
  for (let i = 0; i < positions.length; i++) {
    let [x, y] = positions[i];
    x = Math.min(13, Math.max(1, x + ((rand() * 3) | 0) - 1));
    y = Math.min(13, Math.max(1, y + ((rand() * 3) | 0) - 1));
    s.r(x - 1, y, 4, 2, shades[0]); s.r(x, y - 1, 2, 4, shades[0]);
    s.r(x, y, 2, 2, shades[1]); s.p(x, y - 1, shades[2]); s.p(x + 2, y, shades[2]);
  }
}

function foliage(s, dark, mid, light, rand) {
  s.r(0, 0, 16, 16, dark);
  // Layered groups suggest small, softly lit bunches of leaves.
  for (let row = 0; row < 4; row++) for (let col = 0; col < 4; col++) {
    const x = col * 4 + ((row % 2) * 2) - 1, y = row * 4;
    s.r(x, y + 1, 4, 3, mid); s.r(x + 1, y, 3, 3, mid);
    s.r(x + 1, y, 2, 1, light);
    if (rand() > .55) s.p(x + 3, y + 2, light);
    if (rand() > .72) s.p(x, y + 3, '#1e443b');
  }
}

function board(s, spruce = false, variant = 0) {
  const p = spruce ? ['#483f39', '#6c5a43', '#978263', '#b8a080'] : ['#664532', '#a77242', '#c38e52', '#e5b879'];
  s.r(0, 0, 16, 16, p[1]);
  for (let x = 0; x < 16; x += 4) {
    s.r(x, 0, 1, 16, p[0]); s.r(x + 1, 0, 1, 16, p[2]);
    s.r(x + 2, (x * 3 + variant * 2) % 10, 1, 4, p[3]);
  }
  s.r(6, 6 + variant, 3, 4, p[0]); s.r(7, 7 + variant, 1, 2, p[2]);
}

function blockPixels(id, variant) {
  const s = new Pixels(), rand = random(hash(id) + variant * 7717);
  switch (id) {
    case 'air': break;
    case 'grass': case 'snow_grass': {
      earth(s, palettes.dirt, rand);
      const snow = id === 'snow_grass';
      const colors = snow ? ['#bad1d4', '#dce9e2', '#f6f6e7'] : ['#456843', '#6a944f', '#a5c963'];
      s.r(0, 0, 16, 3, colors[1]); s.r(0, 0, 16, 1, colors[2]);
      for (let x = 0; x < 16; x++) { const h = 2 + ((rand() * 3) | 0); s.r(x, 2, 1, h, colors[0]); if (h > 3) s.p(x, 3, colors[1]); }
      s.r(2, 1, 3, 1, colors[2]); s.r(10, 2, 4, 1, colors[2]);
      break;
    }
    case 'dirt': earth(s, palettes.dirt, rand); break;
    case 'clay': {
      earth(s, ['#819297', '#9aa9a8', '#b4bfb8', '#d0d1bd', '#6d828b'], rand);
      s.r(1, 4, 5, 1, '#bfcbc3'); s.r(9, 10, 6, 1, '#7d949a');
      s.r(2, 13, 3, 1, '#bec9bd'); break;
    }
    case 'stone': earth(s, palettes.stone, rand); s.l(2, 10, 5, 9, '#5c6972'); s.l(5, 9, 8, 11, '#5c6972'); break;
    case 'sand': earth(s, palettes.sand, rand); s.l(1, 4, 6, 4, '#e4ca8c'); s.l(8, 12, 14, 12, '#b79962'); break;
    case 'gravel': {
      earth(s, palettes.gravel, rand);
      [[1, 1], [7, 2], [11, 0], [3, 7], [10, 8], [0, 12], [7, 13], [14, 12]].forEach(([x, y], i) => {
        s.r(x, y + 1, 3, 2, '#596963'); s.r(x + 1, y, 2, 2, i % 2 ? '#aab1a2' : '#929f96');
      }); break;
    }
    case 'cobblestone': {
      s.r(0, 0, 16, 16, '#3d505a');
      const stones = [[0, 1, 5, 4], [7, 0, 7, 5], [1, 7, 7, 4], [10, 7, 6, 4], [0, 13, 5, 3], [7, 13, 7, 3]];
      for (const [x, y, w, h] of stones) {
        s.r(x, y, w, h, '#82918f'); s.r(x + 1, y, w - 2, 1, '#aeb9ac');
        s.r(x + 1, y + h - 1, w - 1, 1, '#5c706f'); s.p(x, y, '#3d505a');
      } break;
    }
    case 'log': case 'spruce_log': board(s, id === 'spruce_log', variant); break;
    case 'leaves': foliage(s, '#305846', '#477855', '#739550', rand); break;
    case 'spruce_leaves': foliage(s, '#233e3c', '#365a4e', '#547a5c', rand); break;
    case 'planks': {
      s.r(0, 0, 16, 16, '#b18052');
      for (let y = 0; y < 16; y += 4) {
        s.r(0, y, 16, 1, '#e0ae73'); s.r(0, y + 3, 16, 1, '#77543b');
        const join = (y * 3 + 5 + variant * 2) % 16; s.r(join, y + 1, 1, 2, '#77543b');
        s.r((join + 3) % 12, y + 2, 4, 1, '#c49460');
      } break;
    }
    case 'bedrock': earth(s, ['#293941', '#3b4b51', '#515d62', '#687272', '#1f2c36'], rand); s.r(0, 0, 16, 1, '#71807a'); break;
    case 'coal_ore': case 'iron_ore': case 'gold_ore': case 'diamond_ore': case 'redstone_ore': case 'lapis_ore': case 'emerald_ore': case 'quartz_ore': ore(s, id.replace('_ore', ''), rand); break;
    case 'obsidian': {
      earth(s, ['#222335', '#303048', '#46405d', '#5c516a', '#171d2d'], rand);
      s.l(1, 4, 5, 3, '#756582'); s.l(5, 3, 8, 5, '#4c4664'); s.l(9, 13, 14, 11, '#665775');
      break;
    }
    case 'water': {
      s.r(0, 0, 16, 16, '#337dacae');
      for (let y = 2; y < 16; y += 5) {
        const x = (y + variant * 3) % 12;
        s.r(x, y, 5, 1, '#9bd7ddb0'); s.r((x + 8) % 14, y + 1, 4, 1, '#68bad0a0');
      }
      s.r(0, 0, 16, 1, '#b8e2dc90'); break;
    }
    case 'lava': {
      earth(s, ['#ce4a27', '#e56f2b', '#f69b36', '#ffdc66', '#a92f2e'], rand);
      s.l(0, 5, 4, 3, '#ffc35a', 2); s.l(4, 3, 10, 7, '#ffd875', 2);
      s.l(10, 7, 15, 5, '#ffb648', 2); s.l(2, 13, 8, 12, '#ffc75b'); s.p(13, 13, '#fff3b3'); break;
    }
    case 'glass': {
      s.r(1, 1, 14, 14, '#b7e2e41a'); s.r(0, 0, 16, 1, '#ccedddc0'); s.r(0, 0, 1, 16, '#ccedddc0');
      s.r(0, 15, 16, 1, '#6caaabbb'); s.r(15, 0, 1, 16, '#6caaabbb');
      s.l(3, 6, 6, 3, '#d9f5e7b0'); s.l(3, 9, 9, 3, '#d9f5e780'); s.l(10, 12, 12, 10, '#d9f5e780'); break;
    }
    case 'crafting_table': {
      s.r(0, 0, 16, 16, '#704d37'); s.r(1, 4, 14, 11, '#b07948');
      s.r(0, 0, 16, 4, '#ca9c61'); s.r(0, 3, 16, 1, '#694b38');
      for (let x = 3; x < 16; x += 5) s.r(x, 0, 1, 3, '#927249');
      s.r(1, 8, 14, 1, '#d8a866'); s.r(2, 11, 2, 5, '#664732'); s.r(12, 11, 2, 5, '#664732');
      s.l(5, 6, 10, 11, '#eee0b1'); s.l(5, 11, 10, 6, '#574b3c'); s.r(9, 5, 3, 2, '#b7bcb0'); break;
    }
    case 'smithing_table': {
      s.r(0, 0, 16, 16, '#3d414c'); s.r(1, 5, 14, 10, '#755a4c');
      s.r(0, 0, 16, 4, '#566777'); s.r(0, 0, 16, 1, '#a9b7b1');
      s.r(1, 3, 14, 1, '#273b48'); s.r(2, 4, 2, 12, '#354953'); s.r(12, 4, 2, 12, '#354953');
      s.r(5, 6, 6, 2, '#b6a48a'); s.r(6, 8, 4, 1, '#d8c8a2'); s.r(7, 9, 2, 2, '#889593');
      s.r(5, 11, 6, 1, '#bdaf92'); s.r(3, 5, 1, 1, '#d8b67c'); s.r(12, 13, 1, 1, '#d8b67c');
      s.r(6, 1, 5, 1, '#778c91'); break;
    }
    case 'furnace': {
      masonry(s, '#63747b', '#9aa7a8', '#4a5d65', '#344954', 0, 2);
      s.r(3, 3, 10, 2, '#263d49'); s.r(4, 3, 8, 1, '#182d38');
      s.r(2, 8, 12, 6, '#2c3e45'); s.r(4, 9, 8, 4, '#152b35');
      s.r(4, 12, 8, 1, '#cb6b38'); s.r(5, 11, 2, 2, '#f3aa56'); s.r(9, 10, 2, 3, '#e69146');
      s.r(3, 14, 10, 1, '#94a49d'); break;
    }
    case 'chest': {
      s.r(1, 2, 14, 13, '#533b2c'); s.r(2, 3, 12, 10, '#bb894d'); s.r(2, 3, 12, 2, '#e0b775');
      s.r(2, 6, 12, 1, '#6c5134'); s.r(2, 12, 12, 2, '#8f6339');
      s.r(3, 3, 1, 11, '#665543'); s.r(12, 3, 1, 11, '#665543');
      s.r(6, 5, 4, 5, '#5b5b49'); s.r(7, 5, 2, 4, '#e1d28b'); s.p(8, 7, '#574a39'); break;
    }
    case 'torch': {
      s.l(6, 14, 9, 6, '#58433b', 2); s.l(7, 13, 9, 7, '#b48650');
      s.r(7, 3, 5, 4, '#c66536'); s.r(8, 2, 3, 5, '#f9b548'); s.r(9, 1, 1, 5, '#fff0a0');
      s.p(7, 2, '#ed8740'); s.p(11, 5, '#e9a14c'); break;
    }
    case 'ladder': {
      s.r(2, 0, 3, 16, '#685038'); s.r(3, 0, 1, 16, '#d0a36b');
      s.r(11, 0, 3, 16, '#685038'); s.r(12, 0, 1, 16, '#d0a36b');
      for (let y = 2; y < 16; y += 4) { s.r(3, y, 10, 2, '#aa7f4f'); s.r(4, y, 8, 1, '#e0b780'); } break;
    }
    case 'door': {
      s.r(1, 0, 14, 16, '#654733'); s.r(2, 1, 12, 15, '#b18452'); s.r(3, 1, 1, 15, '#d5ac74');
      s.r(5, 2, 6, 5, '#473e32'); s.r(6, 3, 4, 3, '#7dafad'); s.r(8, 3, 1, 3, '#cad2b1');
      s.r(5, 10, 6, 5, '#947046'); s.r(5, 10, 6, 1, '#725b3b'); s.r(12, 8, 1, 2, '#f1d178'); break;
    }
    case 'door_open': { s.r(1, 0, 4, 16, '#654733'); s.r(2, 0, 2, 16, '#c79a60'); s.r(3, 8, 2, 1, '#f1d178'); break; }
    case 'bed': {
      s.r(0, 6, 16, 7, '#714b34'); s.r(1, 7, 14, 4, '#c98476'); s.r(4, 6, 12, 4, '#ac4f5d');
      s.r(4, 6, 12, 1, '#df8890'); s.r(0, 5, 5, 4, '#e7e4ca'); s.r(1, 5, 3, 1, '#fff4d8');
      s.r(1, 13, 2, 3, '#614432'); s.r(13, 13, 2, 3, '#614432'); s.r(1, 11, 14, 1, '#d1a66b'); break;
    }
    case 'farmland': {
      earth(s, ['#493b31', '#684d35', '#80613e', '#a58152', '#342e2b'], rand);
      for (let x = 1; x < 16; x += 4) { s.r(x, 0, 1, 16, '#392f29'); s.r(x + 1, 0, 1, 16, '#95754b'); } break;
    }
    case 'wheat_crop': {
      for (let i = 0; i < 5; i++) {
        const x = 2 + i * 3, y = 2 + ((i + variant) % 3);
        s.l(x, 15, x + (i % 2), y, '#78864b'); s.l(x, 13, x - 2, 10, '#b0ae53');
        s.r(x - 1, y + 1, 3, 5, '#d5b85e'); s.r(x, y, 1, 6, '#f1d881');
        s.p(x - 1, y + 2, '#b59445'); s.p(x + 1, y + 4, '#b59445');
      } break;
    }
    case 'flower': {
      s.r(7, 6, 1, 10, '#538052'); s.l(7, 13, 3, 10, '#77a360'); s.r(8, 11, 4, 2, '#416d50');
      const c = ['#eaa47e', '#d9abc1', '#f2d490'][variant];
      s.r(4, 3, 7, 3, c); s.r(6, 1, 3, 7, c); s.r(6, 3, 3, 3, '#a86661'); s.r(7, 3, 1, 2, '#fff1b5'); break;
    }
    case 'grass_tuft': {
      s.l(7, 15, 2, 6, '#50764c'); s.l(7, 15, 8, 3, '#73914f'); s.l(8, 15, 13, 6, '#8fab59');
      s.l(5, 15, 2, 11, '#819e58'); s.l(10, 15, 14, 11, '#5c844f'); s.l(8, 15, 10, 7, '#b1bd66'); break;
    }
    case 'sugar_cane': {
      // Three jointed reeds keep both the world tile and inventory icon clear.
      for (let i = 0; i < 3; i++) {
        const x = 3 + i * 4;
        s.r(x, i % 2, 2, 16, '#57845a'); s.r(x, i % 2, 1, 16, '#a5c978');
        for (const y of [3, 8, 13]) { s.r(x, y, 2, 1, '#3c634c'); s.p(x, y + 1, '#d5db94'); }
      }
      s.l(3, 6, 0, 2, '#80aa66'); s.l(7, 10, 10, 6, '#91b86b');
      s.l(11, 5, 14, 1, '#afcc75'); s.l(11, 12, 15, 8, '#749e60'); break;
    }
    case 'snow': earth(s, ['#c1d6d7', '#e0e9df', '#eef0e1', '#fffae8', '#b1cdcf'], rand); break;
    case 'cactus': {
      s.r(1, 0, 14, 16, '#3f6850'); s.r(2, 0, 12, 16, '#5b8b54');
      s.r(3, 0, 2, 16, '#86a563'); s.r(8, 0, 1, 16, '#355e49'); s.r(12, 0, 1, 16, '#355e49');
      for (const [x, y] of [[4, 2], [10, 5], [3, 9], [11, 13], [7, 15]]) s.r(x, y, 2, 1, '#d7cb91'); break;
    }
    case 'bricks': masonry(s, '#a8624e', '#ca8a65', '#834535', '#e2c397', variant); break;
    case 'stone_bricks': masonry(s, '#718486', '#aab5a7', '#556b70', '#3d555f', variant, 2); break;
    case 'nether_bricks': masonry(s, '#5e374d', '#815269', '#432b40', '#302435', variant, 4); break;
    case 'netherrack': earth(s, palettes.nether, rand); break;
    case 'soul_sand': {
      earth(s, ['#51433f', '#6d584b', '#8e7058', '#a98c68', '#392f35'], rand);
      for (const [x, y] of [[2, 2], [9, 9]]) { s.r(x, y, 2, 2, '#403633'); s.r(x + 4, y, 2, 2, '#403633'); s.r(x + 2, y + 4, 2, 2, '#403633'); } break;
    }
    case 'glowstone': {
      earth(s, ['#c28946', '#e4b764', '#f4d68b', '#fff4bf', '#936c3d'], rand);
      for (const [x, y] of [[1, 1], [10, 2], [6, 8], [1, 13], [13, 12]]) { s.r(x, y, 3, 3, '#fff1af'); s.p(x, y, '#fffad8'); } break;
    }
    case 'end_stone': earth(s, palettes.end, rand); s.r(4, 3, 2, 1, '#7d8766'); s.r(11, 11, 2, 2, '#929773'); break;
    case 'end_frame': {
      masonry(s, '#647867', '#a4b597', '#455d51', '#314d45', 0, 2);
      s.r(0, 0, 16, 4, '#a4ba8d'); s.r(1, 1, 14, 2, '#d1ce9b');
      s.r(5, 0, 6, 5, '#304e4b'); s.r(6, 1, 4, 2, '#6ec2a0'); s.r(7, 1, 2, 3, '#172f3b');
      s.r(2, 8, 12, 1, '#879b75'); break;
    }
    case 'end_portal': case 'nether_portal': {
      const end = id === 'end_portal';
      s.r(0, 0, 16, 16, end ? '#142d3bea' : '#684b95cf');
      const c = end ? ['#295264', '#427d80', '#b6d8bf'] : ['#8362afd9', '#b88fcbdd', '#e0b1e8dd'];
      s.l(1, 10 - variant, 7, 3 + variant, c[0], 2); s.l(7, 3 + variant, 12, 5, c[1]);
      s.l(14, 7, 7, 13, c[0], 2); s.p(3, 2, c[2]); s.p(12, 12, c[2]); s.p(8, 7, c[2]);
      break;
    }
    case 'bookshelf': {
      s.r(0, 0, 16, 16, '#553f36'); s.r(0, 0, 16, 2, '#bc8e59'); s.r(0, 7, 16, 2, '#bc8e59'); s.r(0, 14, 16, 2, '#bc8e59');
      const books = ['#af665b', '#78967a', '#d1b879', '#5d8097', '#95738b', '#c89663'];
      for (let i = 0; i < 6; i++) { const x = 1 + i * 2; s.r(x, 2, 2, 5 - (i % 2), books[(i + variant) % 6]); s.p(x, 3, '#e4c9a1'); s.r(x, 9, 2, 5, books[(i + 3 + variant) % 6]); s.p(x, 12, '#e4c9a1'); } break;
    }
    case 'enchanting_table': {
      s.r(2, 7, 12, 8, '#343749'); s.r(1, 6, 14, 3, '#b26074'); s.r(3, 8, 10, 1, '#e79c94');
      s.r(3, 10, 2, 3, '#51b0aa'); s.r(11, 10, 2, 3, '#51b0aa'); s.r(4, 14, 8, 1, '#555672');
      s.poly([[2, 2], [7, 3], [8, 6], [2, 4]], '#d6c796'); s.poly([[8, 3], [14, 1], [14, 4], [8, 6]], '#f3e4b6');
      s.l(8, 3, 8, 6, '#936545'); s.p(4, 3, '#987353'); s.p(11, 3, '#a27f59'); break;
    }
    case 'brewing_stand': {
      s.r(1, 13, 14, 2, '#637476'); s.r(4, 12, 8, 1, '#b0b6a7');
      s.r(7, 2, 2, 11, '#b99a5a'); s.r(7, 2, 1, 10, '#f1d58e'); s.r(3, 6, 10, 1, '#9a8052');
      s.r(2, 7, 1, 3, '#a2bec1'); s.r(1, 9, 3, 3, '#7ac5ae'); s.r(12, 7, 1, 3, '#a2bec1'); s.r(11, 9, 3, 3, '#c79ab5'); break;
    }
    case 'iron_block': case 'gold_block': case 'diamond_block': {
      const p = metal[id.split('_')[0]];
      s.r(0, 0, 16, 16, p[0]); s.r(1, 1, 14, 14, p[1]); s.r(1, 1, 14, 1, p[2]); s.r(1, 1, 1, 14, p[2]);
      s.r(3, 3, 10, 10, p[1]); s.l(3, 5, 5, 3, p[2]); s.l(3, 8, 8, 3, p[2]); s.r(12, 12, 2, 2, p[0]); break;
    }
    case 'tnt': {
      s.r(0, 0, 16, 16, '#753f37');
      for (let x = 1; x < 16; x += 4) { s.r(x, 0, 3, 16, '#c4654e'); s.r(x, 0, 1, 16, '#ed9972'); }
      s.r(0, 5, 16, 6, '#dac79f'); s.r(1, 6, 14, 4, '#eee0b6');
      s.r(7, 7, 2, 2, '#815340'); s.p(8, 6, '#b46042'); s.p(6, 9, '#b46042'); s.p(10, 8, '#b46042'); break;
    }
    case 'redstone_lamp': {
      s.r(0, 0, 16, 16, '#5c4740'); s.r(1, 1, 14, 14, '#b66f41');
      for (let y = 2; y < 15; y += 6) for (let x = 2; x < 15; x += 6) {
        s.r(x, y, 5, 5, '#ecc47a'); s.r(x + 1, y + 1, 3, 3, '#ffdf94'); s.p(x + 1, y + 1, '#fff2c3');
      }
      s.r(7, 0, 2, 16, '#705142'); s.r(0, 7, 16, 2, '#705142'); break;
    }
    case 'redstone_wire': {
      s.l(0, 13, 5, 13, '#6c3141', 2); s.l(5, 13, 9, 11, '#6c3141', 2); s.l(9, 11, 15, 13, '#6c3141', 2);
      s.l(0, 13, 5, 13, '#db6464'); s.l(5, 13, 9, 11, '#ec8980'); s.l(9, 11, 15, 13, '#db6464'); break;
    }
    case 'lever': {
      s.r(3, 11, 10, 4, '#576c70'); s.r(4, 10, 8, 3, '#91a29a'); s.r(5, 11, 5, 1, '#bbc6af');
      s.l(7, 11, 11, 3, '#5d4635', 2); s.l(8, 10, 12, 3, '#c49a61'); break;
    }
    case 'stone_slab': { s.r(0, 8, 16, 8, '#718486'); s.r(0, 8, 16, 2, '#aab5a7'); s.r(0, 15, 16, 1, '#3d555f'); s.r(7, 10, 1, 5, '#556b70'); break; }
    case 'oak_sapling': {
      s.r(7, 7, 2, 9, '#967047'); s.r(7, 8, 1, 8, '#c49b5d');
      s.r(3, 4, 9, 5, '#467657'); s.r(5, 2, 7, 6, '#678f56'); s.r(2, 6, 5, 4, '#567f53');
      s.r(6, 2, 4, 1, '#a0b86a'); s.r(3, 5, 3, 1, '#94ab62'); s.r(9, 5, 4, 3, '#345e4a'); break;
    }
    case 'fence': {
      s.r(2, 0, 3, 16, '#8b633e'); s.r(3, 0, 1, 16, '#cc9b5f'); s.r(11, 0, 3, 16, '#8b633e'); s.r(12, 0, 1, 16, '#cc9b5f');
      for (const y of [3, 10]) { s.r(0, y, 16, 3, '#a57949'); s.r(0, y, 16, 1, '#d5ab6e'); s.r(0, y + 2, 16, 1, '#6a4d34'); } break;
    }
    default: gem(s, '#5a4e72', '#ad88b9', '#edd0dc'); s.outline();
  }
  return s;
}

function toolPixels(kind, material) {
  const s = new Pixels(), [dark, mid, light] = metal[material] || metal.wood;
  if (kind === 'sword') {
    s.l(4, 12, 12, 4, dark, 2); s.l(5, 11, 12, 4, mid); s.l(6, 10, 13, 3, light);
    s.p(13, 2, light); s.l(3, 13, 5, 11, '#956440', 2); s.l(3, 9, 7, 13, dark); s.l(4, 9, 7, 12, mid); s.r(2, 13, 2, 2, dark);
  } else {
    s.l(3, 13, 10, 6, '#594735', 2); s.l(4, 13, 10, 7, '#c5975f');
    if (kind === 'pickaxe') {
      s.poly([[3, 3], [9, 2], [13, 5], [14, 10], [12, 9], [11, 6], [8, 5], [3, 5]], dark);
      s.l(3, 3, 8, 3, light); s.l(8, 3, 12, 6, mid); s.l(12, 6, 13, 9, mid); s.r(6, 4, 4, 1, mid);
    } else if (kind === 'axe') {
      s.poly([[7, 2], [12, 2], [14, 5], [12, 8], [8, 7], [7, 5]], dark);
      s.poly([[8, 2], [12, 3], [13, 5], [11, 7], [8, 6]], mid); s.l(9, 2, 12, 3, light); s.l(12, 3, 13, 5, light);
      s.r(6, 3, 2, 3, mid);
    } else if (kind === 'shovel') {
      s.poly([[10, 2], [14, 2], [14, 6], [11, 8], [8, 5]], dark);
      s.poly([[10, 3], [13, 2], [13, 5], [11, 7], [9, 5]], mid); s.l(10, 3, 12, 3, light); s.p(10, 4, light);
    } else if (kind === 'hoe') {
      s.r(4, 3, 8, 2, dark); s.r(4, 3, 7, 1, light); s.r(10, 4, 3, 3, dark); s.r(11, 4, 1, 3, mid); s.r(4, 4, 5, 1, mid);
    }
  }
  s.outline('#233239'); return s;
}

function armorPixels(kind, material) {
  const s = new Pixels(), [dark, mid, light] = metal[material] || metal.leather;
  if (kind === 'helmet') {
    s.r(4, 3, 8, 3, mid); s.r(2, 5, 12, 6, mid); s.r(2, 10, 3, 3, dark); s.r(11, 10, 3, 3, dark);
    s.r(5, 8, 6, 5, null); s.r(4, 3, 7, 1, light); s.r(3, 5, 2, 4, light); s.r(6, 5, 6, 1, light); s.r(11, 7, 3, 2, dark);
  } else if (kind === 'chestplate') {
    s.poly([[2, 3], [5, 2], [7, 4], [9, 4], [11, 2], [14, 3], [14, 7], [12, 7], [12, 14], [4, 14], [4, 7], [2, 7]], mid);
    s.r(5, 2, 1, 3, light); s.r(2, 3, 2, 3, light); s.r(4, 6, 7, 1, light); s.r(5, 8, 2, 4, light);
    s.r(11, 6, 1, 8, dark); s.r(4, 13, 8, 1, dark);
  } else if (kind === 'leggings') {
    s.r(3, 2, 10, 4, mid); s.r(3, 5, 4, 9, mid); s.r(9, 5, 4, 9, mid); s.r(3, 2, 10, 1, light);
    s.r(4, 5, 1, 8, light); s.r(10, 5, 1, 8, light); s.r(6, 6, 1, 8, dark); s.r(12, 6, 1, 8, dark); s.r(7, 3, 2, 2, dark);
  } else {
    s.r(3, 4, 4, 8, mid); s.r(9, 4, 4, 8, mid); s.r(1, 10, 6, 3, mid); s.r(9, 10, 6, 3, mid);
    s.r(1, 13, 6, 1, dark); s.r(9, 13, 6, 1, dark); s.r(3, 4, 4, 1, light); s.r(9, 4, 4, 1, light); s.r(2, 10, 3, 1, light); s.r(10, 10, 3, 1, light);
  }
  s.outline('#293039'); return s;
}

function ingot(s, dark, mid, light) {
  s.poly([[4, 5], [12, 4], [14, 8], [12, 11], [3, 12], [1, 9]], dark);
  s.poly([[4, 5], [11, 5], [13, 8], [4, 9], [2, 8]], light);
  s.poly([[4, 9], [13, 8], [12, 10], [4, 11]], mid);
  s.r(5, 6, 5, 1, '#fff2d77a');
}

function bottle(s, liquid) {
  s.r(6, 1, 4, 2, '#b89061'); s.r(6, 3, 4, 4, '#88aaa9');
  s.ellipse(8, 10, 5, 5, '#82a7aaff'); s.ellipse(8, 10, 4, 4, '#b9d4c4');
  if (liquid) { s.r(4, 9, 8, 3, liquid); s.r(5, 12, 6, 2, liquid); s.r(5, 8, 6, 1, liquid); }
  s.r(5, 8, 1, 4, '#f0f3d6'); s.p(6, 7, '#e6efd1'); s.r(7, 4, 1, 3, '#d7e7cb'); s.r(7, 2, 2, 1, '#dfbd83');
}

function itemPixels(id) {
  let match = id.match(/^(wood|stone|iron|gold|diamond|netherite)_(pickaxe|axe|shovel|hoe|sword)$/);
  if (match) return toolPixels(match[2], match[1]);
  match = id.match(/^(leather|iron|gold|diamond|netherite)_(helmet|chestplate|leggings|boots)$/);
  if (match) return armorPixels(match[2], match[1]);
  const s = new Pixels();
  switch (id) {
    case 'stick': s.l(4, 13, 11, 3, '#77503a', 2); s.l(5, 13, 12, 3, '#c59560'); s.l(7, 10, 10, 6, '#e0b57b'); break;
    case 'coal': case 'charcoal': {
      s.poly([[3, 4], [7, 2], [12, 4], [14, 10], [11, 13], [5, 14], [2, 10]], '#293641');
      s.poly([[4, 5], [8, 3], [11, 5], [9, 9], [3, 9]], id === 'coal' ? '#536271' : '#66544b');
      s.r(4, 5, 3, 1, '#829091'); s.r(9, 10, 3, 2, '#40525c'); break;
    }
    case 'iron_ingot': ingot(s, ...metal.iron); break;
    case 'gold_ingot': ingot(s, ...metal.gold); break;
    case 'netherite_ingot': ingot(s, ...metal.netherite); break;
    case 'clay_ball': {
      s.ellipse(8, 9, 6, 5, '#71858d'); s.ellipse(8, 8, 5, 4, '#adb8b4');
      s.r(4, 6, 4, 2, '#d4d9c9'); s.r(5, 5, 3, 1, '#e2e1cd');
      s.r(10, 9, 2, 2, '#879ca0'); s.r(6, 12, 4, 1, '#5e7581'); break;
    }
    case 'brick': {
      s.poly([[4, 4], [11, 3], [14, 6], [13, 11], [5, 13], [2, 10], [2, 6]], '#864b41');
      s.poly([[4, 4], [11, 4], [13, 6], [5, 8], [2, 6]], '#d8946c');
      s.poly([[5, 8], [13, 6], [12, 10], [5, 12]], '#b76952');
      s.l(4, 5, 9, 4, '#efbb86'); s.r(6, 9, 3, 1, '#c47a5e'); break;
    }
    case 'netherite_upgrade_template': {
      s.poly([[4, 2], [11, 2], [13, 4], [13, 12], [11, 14], [3, 14], [2, 12], [2, 4]], '#5c354a');
      s.r(3, 3, 9, 10, '#a35761'); s.r(4, 3, 7, 1, '#e2ad87'); s.r(3, 4, 1, 8, '#bd8a75');
      s.poly([[5, 7], [8, 4], [11, 7], [9, 7], [9, 10], [7, 10], [7, 7]], '#edd0a0');
      s.r(6, 11, 4, 1, '#f2d8a9'); s.r(12, 5, 1, 6, '#763f52'); s.p(4, 12, '#dbc393'); break;
    }
    case 'raw_iron': case 'raw_gold': case 'netherite_scrap': {
      const p = id === 'raw_gold' ? ['#936339', '#d0a34e', '#f3d37c'] : id === 'raw_iron' ? ['#775243', '#b98c6c', '#ead0aa'] : ['#514352', '#896a73', '#bf9891'];
      s.poly([[4, 3], [9, 2], [13, 5], [12, 11], [8, 14], [3, 12], [2, 7]], p[0]);
      s.r(4, 4, 5, 4, p[1]); s.r(8, 8, 4, 3, p[1]); s.r(3, 9, 3, 3, p[1]); s.r(4, 4, 3, 1, p[2]); s.r(8, 8, 2, 1, p[2]); break;
    }
    case 'diamond': gem(s, '#257c7e', '#50d8c8', '#ceffe6'); break;
    case 'emerald': gem(s, '#256d52', '#59bb79', '#ceeea5'); break;
    case 'lapis': gem(s, '#244f75', '#568bb1', '#a2d4dd'); break;
    case 'quartz': {
      s.poly([[4, 4], [7, 2], [9, 7], [11, 4], [13, 6], [12, 12], [7, 14], [3, 10]], '#928b97');
      s.poly([[5, 4], [7, 3], [8, 8], [7, 12], [4, 10]], '#f0e5d5'); s.poly([[10, 6], [12, 5], [11, 12], [8, 13]], '#c8c6c3'); s.r(5, 5, 1, 4, '#fff2d9'); break;
    }
    case 'redstone': case 'gunpowder': case 'blaze_powder': case 'glowstone_dust': case 'bone_meal': {
      const p = { redstone: ['#753743', '#c96167', '#fba69a'], gunpowder: ['#48545d', '#7f8a8b', '#bec4b2'], blaze_powder: ['#b55e36', '#e6a047', '#ffe595'], glowstone_dust: ['#b58e45', '#eace74', '#fff1a8'], bone_meal: ['#89998b', '#d6d9bd', '#fff4d8'] }[id];
      s.poly([[2, 12], [4, 9], [6, 9], [7, 6], [9, 7], [11, 10], [13, 10], [14, 13], [4, 14]], p[0]);
      s.r(4, 11, 8, 2, p[1]); s.r(7, 8, 3, 4, p[1]); s.r(5, 10, 2, 1, p[2]); s.p(8, 8, p[2]); s.p(11, 11, p[2]); s.r(3, 5, 2, 2, p[1]); s.p(11, 4, p[2]); break;
    }
    case 'flint': { s.poly([[8, 2], [12, 6], [10, 12], [5, 14], [2, 10], [4, 6]], '#43515f'); s.poly([[8, 3], [10, 6], [7, 9], [4, 10]], '#9dabb1'); s.l(6, 11, 9, 7, '#687b89'); break; }
    case 'flint_and_steel': {
      s.r(6, 4, 7, 2, '#b1c0bd'); s.r(11, 5, 2, 7, '#8c9c9d'); s.r(6, 11, 7, 2, '#607280');
      s.r(4, 6, 3, 6, '#425364'); s.r(3, 8, 4, 4, '#687b8a'); s.p(4, 7, '#a4b6b4'); s.p(9, 2, '#f2cf81'); s.p(13, 3, '#e3a45e'); break;
    }
    case 'bucket': case 'water_bucket': case 'lava_bucket': {
      s.l(4, 4, 4, 2, '#a4b7b6'); s.l(4, 2, 11, 2, '#a4b7b6'); s.l(11, 2, 12, 5, '#708995');
      s.poly([[2, 5], [14, 5], [12, 14], [4, 14]], '#667e89'); s.poly([[3, 6], [12, 6], [11, 12], [5, 12]], '#c3d0c5');
      s.r(3, 5, 10, 2, id === 'water_bucket' ? '#60afc8' : id === 'lava_bucket' ? '#f4b650' : '#526b77');
      s.r(4, 8, 1, 3, '#f1edcf'); s.r(9, 12, 3, 1, '#91aaa9'); break;
    }
    case 'wheat_seeds': {
      for (const [x, y] of [[3, 8], [7, 11], [10, 6], [7, 4], [12, 11]]) { s.r(x, y, 2, 3, '#627a48'); s.r(x, y, 1, 2, '#adc779'); }
      s.l(3, 7, 2, 5, '#8eac60'); s.l(9, 5, 12, 3, '#85a65c'); break;
    }
    case 'wheat': {
      s.l(4, 14, 10, 2, '#b6a05a'); s.l(5, 14, 6, 4, '#87904f');
      for (let i = 0; i < 4; i++) { s.r(6 + i, 9 - i * 2, 3, 2, '#dec371'); s.p(7 + i, 8 - i * 2, '#f6df90'); }
      s.r(3, 6, 3, 5, '#c8a758'); s.r(4, 5, 1, 5, '#efcc77'); s.r(4, 12, 4, 1, '#856744'); break;
    }
    case 'bread': {
      s.poly([[2, 8], [5, 4], [11, 3], [14, 6], [13, 11], [7, 14], [2, 12]], '#9a643c');
      s.poly([[3, 7], [6, 4], [11, 4], [13, 6], [12, 9], [6, 12], [2, 11]], '#d7a15b');
      s.l(5, 6, 7, 8, '#f5d692'); s.l(8, 5, 10, 7, '#f5d692'); s.l(10, 4, 12, 6, '#f5d692'); s.r(3, 10, 3, 1, '#e4ba77'); break;
    }
    case 'apple': case 'golden_apple': {
      const gold = id === 'golden_apple';
      s.r(8, 1, 1, 4, '#7a6541'); s.r(9, 1, 3, 2, '#71925a');
      s.poly([[3, 5], [6, 4], [8, 5], [11, 4], [14, 7], [13, 11], [10, 14], [6, 14], [3, 11], [2, 8]], gold ? '#b98634' : '#9e4854');
      s.ellipse(7, 8, 4, 3, gold ? '#f1cf65' : '#dc7871'); s.r(4, 6, 2, 3, gold ? '#fff0a0' : '#ffc0a1'); s.r(5, 6, 2, 1, gold ? '#fff7b9' : '#fca991'); s.p(10, 12, gold ? '#e4b653' : '#c45d62'); break;
    }
    case 'melon_slice': case 'glistering_melon': {
      const gold = id === 'glistering_melon';
      s.poly([[2, 4], [14, 4], [13, 9], [10, 13], [6, 13], [3, 10]], gold ? '#a87d37' : '#487351');
      s.poly([[3, 4], [13, 4], [12, 9], [9, 12], [6, 11], [4, 9]], gold ? '#f1ce71' : '#b8ce86');
      s.poly([[3, 4], [13, 4], [11, 8], [8, 10], [5, 8]], gold ? '#e7a84b' : '#d97678');
      s.r(4, 4, 8, 1, gold ? '#ffed9f' : '#efa79b');
      for (const [x, y] of [[5, 6], [9, 6], [7, 8]]) s.p(x, y, gold ? '#fff2ba' : '#79494d');
      if (gold) { s.p(2, 2, '#ffefab'); s.p(14, 11, '#ffefab'); s.r(13, 12, 3, 1, '#ecc577'); s.p(14, 13, '#ffefab'); }
      break;
    }
    case 'raw_beef': case 'steak': case 'raw_porkchop': case 'cooked_porkchop': {
      const cooked = id === 'steak' || id.startsWith('cooked');
      s.poly([[4, 3], [9, 2], [13, 4], [14, 8], [11, 12], [7, 14], [3, 13], [2, 9]], cooked ? '#674634' : '#9b4c5b');
      s.poly([[5, 4], [9, 3], [12, 5], [12, 8], [9, 11], [4, 12], [3, 8]], cooked ? '#b77d48' : '#db8b8d');
      s.l(4, 6, 7, 4, cooked ? '#dfaa70' : '#f0b6a7'); s.l(5, 10, 9, 7, cooked ? '#704b36' : '#f0c6b0'); s.r(9, 4, 2, 2, cooked ? '#d1a271' : '#e9b5a9'); break;
    }
    case 'raw_chicken': case 'cooked_chicken': {
      const cooked = id.startsWith('cooked');
      s.l(3, 13, 7, 9, '#d7d2af', 2); s.r(2, 12, 2, 3, '#ede5c5'); s.r(3, 13, 3, 2, '#ede5c5');
      s.ellipse(10, 6, 4, 5, cooked ? '#a86638' : '#d59894'); s.ellipse(10, 5, 3, 3, cooked ? '#d39c56' : '#ebc0ac'); s.r(8, 3, 2, 2, cooked ? '#f0c788' : '#fbe1c4'); break;
    }
    case 'feather': {
      s.poly([[4, 11], [5, 5], [11, 2], [13, 3], [12, 8], [8, 12]], '#bed2cb'); s.poly([[5, 10], [7, 5], [11, 3], [12, 3], [9, 9]], '#f5eed7');
      s.l(3, 14, 11, 4, '#92ada4'); s.p(9, 9, null); s.p(10, 8, null); break;
    }
    case 'leather': {
      s.poly([[3, 2], [6, 4], [10, 4], [13, 2], [12, 7], [14, 11], [11, 14], [8, 12], [4, 14], [2, 11], [4, 7]], '#946442');
      s.r(5, 5, 6, 6, '#ba8b58'); s.l(4, 10, 5, 6, '#e0ad72'); s.r(7, 11, 3, 1, '#6b4a38'); break;
    }
    case 'wool': {
      s.r(3, 4, 10, 9, '#bac7b5'); s.r(2, 5, 12, 6, '#dce0c6'); s.r(4, 3, 8, 10, '#e7e8ce');
      s.r(3, 5, 3, 2, '#faf3d8'); s.r(8, 4, 3, 3, '#faf3d8'); s.r(4, 9, 3, 2, '#c1d0b8'); s.r(10, 10, 2, 2, '#b4c5b0'); break;
    }
    case 'string': {
      s.l(3, 5, 5, 3, '#dadcca'); s.l(5, 3, 12, 4, '#e8e6ca'); s.l(12, 4, 13, 8, '#c3d0bd'); s.l(13, 8, 10, 11, '#dce0c8');
      s.l(10, 11, 5, 10, '#eae7cd'); s.l(5, 10, 5, 6, '#aebfae'); s.l(5, 6, 10, 6, '#d6dbc1'); s.l(10, 6, 9, 9, '#eae7cd'); s.l(3, 6, 3, 13, '#eae7cd'); break;
    }
    case 'bone': {
      s.l(4, 12, 11, 5, '#c3c9b1', 2); s.l(5, 12, 12, 5, '#f1eacd');
      [[2, 11], [4, 13], [10, 3], [12, 5]].forEach(([x, y]) => s.r(x, y, 3, 2, '#eee5c4')); s.p(11, 3, '#fff1d0'); break;
    }
    case 'rotten_flesh': {
      s.poly([[3, 4], [7, 3], [9, 5], [13, 4], [12, 9], [10, 10], [10, 14], [6, 12], [3, 13], [4, 8]], '#6d6143');
      s.r(4, 5, 4, 5, '#a77b55'); s.r(8, 7, 4, 2, '#b88d62'); s.r(7, 10, 2, 3, '#8c9a60'); s.p(5, 6, '#d0a378'); break;
    }
    case 'ender_pearl': case 'slimeball': case 'magma_cream': {
      const p = id === 'ender_pearl' ? ['#23515a', '#479593', '#a5d1b8'] : id === 'slimeball' ? ['#547d46', '#9bc76a', '#e1e5a0'] : ['#a75d3d', '#eba950', '#fff2a4'];
      s.ellipse(8, 8, 6, 6, p[0]); s.ellipse(8, 7, 5, 5, p[1]); s.r(5, 4, 3, 2, p[2]); s.r(4, 6, 1, 2, p[2]); s.r(10, 10, 2, 2, p[0]);
      if (id === 'magma_cream') { s.l(4, 10, 8, 8, '#cc7138'); s.l(8, 8, 12, 10, '#cc7138'); } break;
    }
    case 'blaze_rod': {
      s.l(3, 13, 11, 2, '#b77734', 3); s.l(4, 13, 12, 2, '#efc261'); s.l(4, 11, 10, 3, '#ffeca0'); s.p(2, 5, '#f4c66d'); s.p(13, 10, '#e3a34d'); break;
    }
    case 'ender_eye': {
      s.ellipse(8, 8, 6, 5, '#426965'); s.ellipse(8, 7, 5, 4, '#afbf83'); s.ellipse(8, 7, 3, 3, '#428f84');
      s.r(7, 4, 2, 6, '#193e48'); s.r(7, 4, 1, 2, '#d9e1aa'); s.r(4, 7, 1, 2, '#e0dba8'); break;
    }
    case 'arrow': {
      s.l(3, 13, 12, 4, '#a98956'); s.l(4, 13, 12, 5, '#d7b87f');
      s.poly([[10, 3], [14, 2], [13, 7]], '#a9bdbb'); s.l(11, 3, 13, 3, '#e4e6cb');
      s.r(2, 10, 2, 4, '#c7cfb9'); s.r(3, 12, 3, 2, '#f0e9ca'); break;
    }
    case 'bow': {
      s.l(4, 2, 10, 5, '#c0945b'); s.l(10, 5, 12, 8, '#c0945b'); s.l(12, 8, 10, 11, '#9b7048'); s.l(10, 11, 4, 14, '#9b7048');
      s.l(4, 2, 5, 14, '#d7d5b9'); s.l(5, 3, 9, 5, '#e7bd7e'); s.r(10, 7, 2, 3, '#654b38'); break;
    }
    case 'shield': {
      s.poly([[3, 2], [13, 2], [13, 10], [8, 14], [3, 10]], '#849c9e'); s.poly([[4, 3], [12, 3], [12, 9], [8, 13], [4, 9]], '#aa7c4d');
      s.r(5, 3, 1, 7, '#d5a66c'); s.r(9, 3, 1, 7, '#76583e'); s.r(7, 6, 3, 3, '#bed0c1'); s.p(7, 6, '#f0e9c9'); break;
    }
    case 'sugar_cane': {
      for (let i = 0; i < 3; i++) { const x = 4 + i * 3; s.r(x, 2 + i % 2, 2, 12 - i, '#65935b'); s.r(x, 2 + i % 2, 1, 12 - i, '#b3cb7a'); for (const y of [5, 9, 12]) s.r(x, y, 2, 1, '#415f46'); }
      s.l(4, 7, 1, 4, '#9abb68'); s.l(11, 6, 14, 3, '#83a961'); break;
    }
    case 'paper': {
      s.poly([[4, 2], [12, 2], [14, 11], [11, 14], [3, 14], [2, 5]], '#c5c6a9'); s.poly([[4, 2], [11, 2], [13, 11], [10, 12], [3, 12], [2, 5]], '#f0e7bf');
      s.r(5, 4, 5, 1, '#ffefd0'); s.l(5, 8, 10, 8, '#d9cfa7'); s.l(5, 10, 9, 10, '#d9cfa7'); break;
    }
    case 'book': {
      s.poly([[3, 3], [11, 2], [14, 5], [13, 12], [5, 14], [2, 11]], '#60453e');
      s.poly([[4, 4], [12, 3], [13, 6], [12, 11], [5, 13], [3, 10]], '#b36b5b');
      s.r(4, 5, 1, 6, '#d29672'); s.l(6, 12, 12, 10, '#eee0b9'); s.l(6, 10, 12, 8, '#d2c39f'); s.r(7, 5, 3, 3, '#dcb27c'); break;
    }
    case 'nether_wart': {
      s.l(4, 13, 7, 8, '#793750'); s.l(8, 13, 10, 7, '#793750'); s.ellipse(5, 7, 3, 4, '#b85d71'); s.ellipse(10, 6, 3, 4, '#ce7883');
      s.r(4, 4, 2, 2, '#e59b92'); s.r(9, 3, 2, 2, '#ebb0a0'); s.r(10, 8, 3, 3, '#914259'); break;
    }
    case 'glass_bottle': bottle(s, null); break;
    case 'water_bottle': bottle(s, '#60afc0'); break;
    case 'awkward_potion': bottle(s, '#6aa794'); break;
    case 'healing_potion': bottle(s, '#ce7284'); break;
    case 'strength_potion': bottle(s, '#a680bc'); break;
    case 'fire_resistance_potion': bottle(s, '#e4ab59'); break;
    case 'ghast_tear': {
      s.poly([[8, 2], [11, 7], [12, 11], [9, 14], [5, 13], [3, 10], [5, 6]], '#90afb5');
      s.poly([[8, 3], [10, 8], [10, 11], [7, 13], [4, 10], [6, 6]], '#d1e2d8'); s.r(6, 7, 1, 4, '#fff2d6'); s.p(7, 6, '#fff2d6'); break;
    }
    case 'gold_nugget': case 'iron_nugget': {
      const p = id === 'gold_nugget' ? metal.gold : metal.iron;
      s.poly([[6, 4], [10, 3], [13, 6], [12, 10], [8, 12], [4, 10], [3, 7]], p[0]); s.r(5, 5, 6, 4, p[1]); s.r(6, 4, 3, 2, p[2]); s.r(4, 7, 2, 2, p[2]); break;
    }
    case 'ancient_debris': {
      s.r(2, 2, 12, 12, '#69505a'); s.r(3, 3, 10, 10, '#927471'); s.r(5, 4, 6, 7, '#574453'); s.r(6, 5, 5, 5, '#b58d83'); s.r(7, 6, 3, 3, '#685362');
      s.r(3, 3, 2, 8, '#caa294'); s.r(3, 12, 9, 1, '#4b3d4b'); break;
    }
    case 'dragon_egg': {
      s.ellipse(8, 9, 5, 6, '#302e48'); s.ellipse(8, 7, 4, 5, '#49405e');
      s.r(5, 5, 2, 2, '#766382'); s.r(9, 7, 3, 2, '#766382'); s.r(5, 10, 2, 2, '#866c8d'); s.r(8, 12, 2, 1, '#9c829f'); s.p(6, 4, '#b092b1'); break;
    }
    case 'compass': case 'clock': {
      s.ellipse(8, 8, 6, 6, '#9c7d48'); s.ellipse(8, 8, 5, 5, '#e1c885'); s.ellipse(8, 8, 4, 4, '#3d5965');
      if (id === 'compass') { s.l(8, 8, 10, 4, '#ef9382'); s.l(8, 8, 6, 11, '#c3d6cc'); s.p(8, 8, '#f4e6b4'); }
      else { s.r(5, 5, 6, 3, '#73aabe'); s.r(5, 8, 6, 3, '#49546e'); s.r(7, 5, 2, 2, '#f5dc8d'); s.l(8, 8, 8, 5, '#efe4bf'); s.l(8, 8, 10, 9, '#efe4bf'); }
      s.r(4, 4, 2, 1, '#f6e8aa'); break;
    }
    default: gem(s, '#635071', '#b190bb', '#f0d2e2'); break;
  }
  s.outline('#29333b');
  return s;
}

/** Return cached native-size pixel textures. Scale with smoothing disabled. */
export function makeArt(makeCanvas) {
  const factory = makeCanvas || ((w, h) => {
    if (typeof OffscreenCanvas !== 'undefined') return new OffscreenCanvas(w, h);
    if (typeof document !== 'undefined') { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
    throw new Error('FlatCraft art needs a canvas factory in this environment.');
  });
  const blocks = new Map(), items = new Map(), data = new Map();
  function raster(pixels) {
    const canvas = factory(SIZE, SIZE), ctx = canvas.getContext('2d');
    canvas.width = SIZE; canvas.height = SIZE;
    ctx.imageSmoothingEnabled = false;
    pixels.a.forEach((color, index) => {
      if (!color) return;
      ctx.fillStyle = color; ctx.fillRect(index % SIZE, (index / SIZE) | 0, 1, 1);
    });
    return canvas;
  }
  function block(id, variant = 0) {
    variant = ((variant | 0) % 3 + 3) % 3;
    const key = `${id}:${variant}`;
    if (!blocks.has(key)) blocks.set(key, raster(blockPixels(id, variant)));
    return blocks.get(key);
  }
  function item(id) {
    if (!items.has(id)) items.set(id, BLOCK_IDS.has(id) ? block(id, 0) : raster(itemPixels(id)));
    return items.get(id);
  }
  function iconData(id) {
    if (!data.has(id)) {
      const canvas = item(id);
      data.set(id, typeof canvas.toDataURL === 'function' ? canvas.toDataURL('image/png') : null);
    }
    return data.get(id);
  }
  return { block, item, iconData };
}
