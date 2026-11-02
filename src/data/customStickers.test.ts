import { describe, expect, it } from 'vitest';
import { zipSync } from 'fflate';
import { byPack, naturalCompare, picturesInZip, sniffType, stickerId, tidyPackName, type CustomSticker } from './customStickers';

const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1, 2, 3]);

describe('custom stickers', () => {
  it('tidies a pack name', () => {
    expect(tidyPackName('Note Taking vol3 PNG')).toBe('Note Taking vol3');
    expect(tidyPackName('a18ec425-NoteTakingvol3PNG.zip')).toBe('a18ec425-NoteTakingvol3PNG');
    expect(tidyPackName('cute_cats - png.zip')).toBe('cute cats');
    expect(tidyPackName('.zip')).toBe('My stickers');
  });

  it('sorts names the way people count', () => {
    expect(['10', '2', '1', '94'].sort(naturalCompare)).toEqual(['1', '2', '10', '94']);
  });

  it('knows a picture by its first bytes', () => {
    expect(sniffType(PNG)).toBe('image/png');
    expect(sniffType(new Uint8Array([0xff, 0xd8, 0xff, 0xe0]))).toBe('image/jpeg');
    expect(sniffType(new TextEncoder().encode('RIFF\0\0\0\0WEBPVP8 '))).toBe('image/webp');
    expect(sniffType(new TextEncoder().encode('GIF89a'))).toBe('image/gif');
    expect(sniffType(new TextEncoder().encode('<svg'))).toBeNull();
  });

  it('takes the pictures out of a zip, named after their folder', () => {
    const zip = zipSync({
      'Note Taking vol3 PNG/1.png': PNG,
      'Note Taking vol3 PNG/10.png': PNG,
      'Note Taking vol3 PNG/readme.txt': new TextEncoder().encode('thanks for buying'),
      '__MACOSX/Note Taking vol3 PNG/._1.png': PNG,
      'Note Taking vol3 PNG/.DS_Store': PNG,
      'top.webp': PNG,
    });
    const got = picturesInZip('Pack.zip', zip).map(({ name, pack }) => ({ name, pack }));
    expect(got).toEqual(
      expect.arrayContaining([
        { name: '1', pack: 'Note Taking vol3' },
        { name: '10', pack: 'Note Taking vol3' },
        { name: 'top', pack: 'Pack' },
      ]),
    );
    expect(got).toHaveLength(3);
  });

  it('refuses a broken zip kindly', () => {
    expect(() => picturesInZip('half.zip', new Uint8Array([1, 2, 3]))).toThrow(/half\.zip/);
  });

  it('gives the same file the same id', async () => {
    const a = await stickerId(PNG);
    expect(a).toMatch(/^st-[0-9a-f]{24}$/);
    expect(await stickerId(PNG.slice())).toBe(a);
    expect(await stickerId(new Uint8Array([1]))).not.toBe(a);
  });

  it('groups by pack in order', () => {
    const s = (id: string, pack: string): CustomSticker => ({ id, name: id, pack, photoId: id, width: 1, height: 1 });
    expect(byPack([s('a', 'A'), s('b', 'A'), s('c', 'B')]).map((g) => [g.pack, g.stickers.length])).toEqual([
      ['A', 2],
      ['B', 1],
    ]);
  });
});
