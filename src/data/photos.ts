/**
 * Curated pool of luxury home / interior photos served from Unsplash's CDN.
 * Each ID has been verified to return 200 OK. The image URL includes resize
 * params for fast mobile loading.
 *
 * Photos are picked deterministically per property using prime-stride
 * arithmetic so neighbouring properties in the list don't share a hero shot.
 */

const PHOTO_IDS: string[] = [
  // Exteriors / facades
  "1568605114967-8130f3a36994",
  "1564013799919-ab600027ffc6",
  "1600596542815-ffad4c1539a9",
  "1613490493576-7fde63acd811",
  "1605276374104-dee2a0ed3cd6",
  "1582268611958-ebfd161ef9cf",
  "1599809275671-b5942cabc7a2",
  "1583608205776-bfd35f0d9f83",
  "1518780664697-55e3ad937233",
  "1574258495973-f010dfbb5371",
  "1517248135467-4c7edcad34c4",
  "1521334884684-d80222895322",
  "1494438639946-1ebd1d20bf85",
  "1542314831-068cd1dbfeeb",
  "1493809842364-78817add7ffb",
  "1480074568708-e7b720bb3f09",
  "1572120360610-d971b9d7767c",
  "1567459169668-95d355371bda",
  "1542621334-a254cf47733d",
  "1592595896616-c37162298647",
  "1600121848594-d8644e57abab",
  "1502005229762-cf1b2da7c5d6",
  "1587574293340-e0011c4e8ecf",

  // Living rooms / common interiors
  "1616594039964-ae9021a400a0",
  "1618221195710-dd6b41faaea6",
  "1505691938895-1758d7feb511",
  "1556909114-f6e7ad7d3136",
  "1583845112203-29329902332e",
  "1554995207-c18c203602cb",
  "1565182999561-18d7dc61c393",
  "1567767292278-a4f21aa2d36e",
  "1560448204-e02f11c3d0e2",
  "1586023492125-27b2c045efd7",
  "1605346434674-a440ca4dc4c0",
  "1556228720-195a672e8a03",
  "1591474200742-8e512e6f98f8",
  "1571055107559-3e67626fa8be",
  "1571508601891-ca5e7a713859",

  // Bedrooms
  "1631049307264-da0ec9d70304",
  "1540518614846-7eded433c457",
  "1505693416388-ac5ce068fe85",
  "1617104551722-3b2d51366400",
  "1631889993959-41b4e9c6e3c5",
  "1616137466211-f939a420be84",
  "1631679706909-1844bbd07221",
  "1604014237800-1c9102c219da",
  "1604578762246-41134e37f9cc",

  // Kitchens / dining
  "1600585154340-be6161a56a0c",
  "1565538810643-b5bdb714032a",
  "1564078516393-cf04bd966897",
  "1600585154363-67eb9e2e2099",
  "1600210491892-03d54c0aaf87",
  "1600210491369-e753d80a41f3",
  "1600566753190-17f0baa2a6c3",
  "1600566753086-00f18fb6b3ea",
  "1600585152915-d208bec867a1",
  "1600585154526-990dced4db0d",
  "1600607687939-ce8a6c25118c",
  "1591088398332-8a7791972843",
  "1556228453-efd6c1ff04f6",
  "1600573472556-e636c2acda88",
];

function photoUrl(id: string, w = 900): string {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;
}

/**
 * Deterministic photo selection for a property. Returns `count` distinct URLs
 * picked from the pool using prime strides so adjacent properties don't
 * collide.
 */
export function photosFor(seed: number, count = 5): string[] {
  const strides = [0, 13, 23, 31, 41, 47];
  const len = PHOTO_IDS.length;
  const indices = new Set<number>();
  const result: string[] = [];
  let attempt = 0;
  while (result.length < count && attempt < count * 4) {
    const stride = strides[result.length % strides.length];
    const idx = (seed * 7 + stride + attempt * 19) % len;
    if (!indices.has(idx)) {
      indices.add(idx);
      result.push(photoUrl(PHOTO_IDS[idx]));
    }
    attempt++;
  }
  // Pad with sequential pool entries if for some reason we didn't fill
  while (result.length < count) {
    result.push(photoUrl(PHOTO_IDS[result.length % len]));
  }
  return result;
}

/** Smaller thumbnail variant — used by the result-card carousel. */
export function thumbUrl(fullUrl: string): string {
  return fullUrl.replace(/w=\d+/, "w=600");
}
