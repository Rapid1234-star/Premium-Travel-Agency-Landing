import sharp from 'sharp';
import { readdir, mkdir } from 'fs/promises';
import { join } from 'path';

const SRC_DIR = 'c:\\Users\\aayan\\React\\landing\\vlack-plane\\ezgif-3635bce39f34e4f5-jpg';
const DESKTOP_DIR = 'public\\frames\\desktop';
const MOBILE_DIR = 'public\\frames\\mobile';

const DESKTOP_WIDTH = 1920;
const DESKTOP_QUALITY = 65;
const MOBILE_WIDTH = 1080;
const MOBILE_QUALITY = 55;

async function convert() {
  await mkdir(DESKTOP_DIR, { recursive: true });
  await mkdir(MOBILE_DIR, { recursive: true });

  const files = (await readdir(SRC_DIR))
    .filter(f => f.startsWith('ezgif-frame-') && f.endsWith('.jpg'))
    .sort();

  console.log(`Found ${files.length} frames to convert...\n`);

  let desktopTotal = 0;
  let mobileTotal = 0;

  for (let i = 0; i < files.length; i++) {
    const src = join(SRC_DIR, files[i]);
    const outName = `frame-${String(i + 1).padStart(3, '0')}.webp`;
    const desktopOut = join(DESKTOP_DIR, outName);
    const mobileOut = join(MOBILE_DIR, outName);

    const [desktopBuf, mobileBuf] = await Promise.all([
      sharp(src).resize(DESKTOP_WIDTH, null, { withoutEnlargement: true }).webp({ quality: DESKTOP_QUALITY }).toBuffer(),
      sharp(src).resize(MOBILE_WIDTH, null, { withoutEnlargement: true }).webp({ quality: MOBILE_QUALITY }).toBuffer(),
    ]);

    await Promise.all([
      sharp(desktopBuf).toFile(desktopOut),
      sharp(mobileBuf).toFile(mobileOut),
    ]);

    desktopTotal += desktopBuf.length;
    mobileTotal += mobileBuf.length;

    if ((i + 1) % 50 === 0 || i === files.length - 1) {
      console.log(`  [${i + 1}/${files.length}] ${outName} — desktop: ${Math.round(desktopBuf.length / 1024)}KB, mobile: ${Math.round(mobileBuf.length / 1024)}KB`);
    }
  }

  console.log(`\nDone!`);
  console.log(`  Desktop: ${files.length} frames, ${(desktopTotal / 1024 / 1024).toFixed(1)}MB total`);
  console.log(`  Mobile:  ${files.length} frames, ${(mobileTotal / 1024 / 1024).toFixed(1)}MB total`);
}

convert().catch(err => { console.error(err); process.exit(1); });
