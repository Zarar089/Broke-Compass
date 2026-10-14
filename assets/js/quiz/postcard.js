/**
 * Draws a quiz result as a postcard and returns it as a JPEG blob, ready to
 * download or share.
 *
 * Landscape, 1800px wide: the illustration across the top, uncropped; the
 * result written underneath, with a stamp and postmark beside the title; the
 * site's address along the foot. The height follows the description, so a
 * long one is never cut off.
 *
 * Colours come from the site's tokens (assets/css/base/tokens.css) and the
 * fonts are the ones the page already loads, so the card matches the site.
 * All text is ink or denim on parchment, well above WCAG AA contrast.
 */

const WIDTH = 1800;
const MARGIN = 72;
const INNER = WIDTH - MARGIN * 2;
const ADDRESS = 'broke-compass.netlify.app/quiz';

const STAMP = { width: 150, height: 180 };
const POSTMARK_RADIUS = 88;

const FONTS = {
  kicker: '500 24px "JetBrains Mono"',
  title: '600 72px Fraunces',
  body: '400 34px "Source Serif 4"',
  small: '500 20px "JetBrains Mono"',
  tiny: '500 14px "JetBrains Mono"',
};

const LINE_HEIGHT = { title: 84, body: 52 };

/* ---- Helpers ----------------------------------------------------------- */

function readColors() {
  const style = getComputedStyle(document.documentElement);
  const token = (name) => style.getPropertyValue(`--${name}`).trim();
  return {
    ink: token('ink'),
    bark: token('bark'),
    parchment: token('parchment'),
    brass: token('brass'),
    rust: token('rust'),
  };
}

async function loadImage(src) {
  const image = new Image();
  image.src = src;
  await image.decode();
  return image;
}

/** Splits text into lines no wider than maxWidth in the current font. */
function wrapText(ctx, text, maxWidth) {
  const lines = [];
  let line = '';
  for (const word of text.split(/\s+/)) {
    const candidate = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(candidate).width > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function drawLines(ctx, lines, x, y, lineHeight) {
  lines.forEach((line, i) => ctx.fillText(line, x, y + i * lineHeight));
  return y + lines.length * lineHeight;
}

function setText(ctx, font, color, letterSpacing = '0px') {
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.letterSpacing = letterSpacing;
}

/* ---- Furniture: stamp and postmark ------------------------------------- */

/** The site's compass mark: ring, diamond needle, pivot. */
function drawCompass(ctx, cx, cy, r, colors) {
  ctx.save();
  ctx.strokeStyle = colors.brass;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = colors.brass;
  ctx.beginPath();
  ctx.moveTo(cx, cy - r * 0.7);
  ctx.lineTo(cx + r * 0.18, cy);
  ctx.lineTo(cx, cy + r * 0.7);
  ctx.lineTo(cx - r * 0.18, cy);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = colors.parchment;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.12, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/**
 * A perforated stamp. Drawn on its own canvas so the perforations can be
 * punched out as real holes, then laid onto the card with a soft shadow.
 */
function drawStamp(ctx, x, y, colors) {
  const { width, height } = STAMP;
  const stamp = document.createElement('canvas');
  stamp.width = width;
  stamp.height = height;
  const s = stamp.getContext('2d');

  s.fillStyle = colors.parchment;
  s.fillRect(0, 0, width, height);
  s.fillStyle = colors.ink;
  s.fillRect(14, 14, width - 28, height - 28);
  drawCompass(s, width / 2, height / 2 - 14, 34, colors);

  setText(s, FONTS.tiny, colors.parchment, '2px');
  s.textAlign = 'center';
  s.textBaseline = 'alphabetic';
  s.fillText('BROKE', width / 2, height - 46);
  s.fillText('COMPASS', width / 2, height - 28);

  // Punch the perforations.
  s.globalCompositeOperation = 'destination-out';
  const hole = 5;
  const step = 15;
  for (let px = step / 2; px < width; px += step) {
    s.beginPath(); s.arc(px, 0, hole, 0, Math.PI * 2); s.fill();
    s.beginPath(); s.arc(px, height, hole, 0, Math.PI * 2); s.fill();
  }
  for (let py = step / 2; py < height; py += step) {
    s.beginPath(); s.arc(0, py, hole, 0, Math.PI * 2); s.fill();
    s.beginPath(); s.arc(width, py, hole, 0, Math.PI * 2); s.fill();
  }

  ctx.save();
  ctx.shadowColor = 'rgba(33, 47, 63, 0.35)';
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 4;
  ctx.translate(x + width / 2, y + height / 2);
  ctx.rotate(-0.04);
  ctx.drawImage(stamp, -width / 2, -height / 2);
  ctx.restore();
}

/** A round date cancel with wavy lines trailing to its left. */
function drawPostmark(ctx, cx, cy, colors) {
  const date = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    .format(new Date())
    .toUpperCase();

  ctx.save();
  ctx.strokeStyle = colors.ink;
  ctx.globalAlpha = 0.7;
  ctx.lineWidth = 3;
  for (const r of [POSTMARK_RADIUS, POSTMARK_RADIUS - 10]) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  for (let i = -1; i <= 1; i++) {
    ctx.beginPath();
    for (let dx = 0; dx <= 170; dx += 4) {
      const px = cx - POSTMARK_RADIUS - 16 - dx;
      const py = cy + i * 18 + Math.sin(dx / 14) * 6;
      if (dx === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();
  }

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  setText(ctx, FONTS.tiny, colors.ink, '1px');
  ctx.fillText('BROKE COMPASS', cx, cy - 30);
  ctx.fillText('QUIZ POST', cx, cy + 30);
  ctx.font = FONTS.small;
  ctx.fillText(date, cx, cy + 2);
  ctx.restore();
}

/* ---- The card ---------------------------------------------------------- */

/**
 * @param {{kicker: string, title: string, description: string, imageUrl: string}} card
 * @returns {Promise<Blob>} the postcard as a JPEG
 */
export async function renderPostcard({ kicker, title, description, imageUrl }) {
  const [image] = await Promise.all([
    loadImage(imageUrl),
    ...Object.values(FONTS).map((font) => document.fonts.load(font)),
  ]);
  const colors = readColors();

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  // Measure first: the canvas height depends on how the text wraps.
  const imageHeight = Math.round((INNER * image.naturalHeight) / image.naturalWidth);
  const headWidth = INNER - STAMP.width - POSTMARK_RADIUS * 2 - 220;
  ctx.font = FONTS.title;
  const titleLines = wrapText(ctx, title, headWidth);
  ctx.font = FONTS.body;
  const bodyLines = wrapText(ctx, description, INNER);

  const headTop = MARGIN + imageHeight + 48;
  const titleTop = headTop + 46;
  const bodyTop = Math.max(titleTop + titleLines.length * LINE_HEIGHT.title, headTop + STAMP.height) + 28;
  const ruleY = bodyTop + bodyLines.length * LINE_HEIGHT.body + 30;
  const footerY = ruleY + 26;
  canvas.width = WIDTH;
  canvas.height = footerY + 20 + MARGIN;

  // Card and its inner dashed border.
  ctx.fillStyle = colors.parchment;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = colors.rust;
  ctx.lineWidth = 2;
  ctx.setLineDash([10, 8]);
  ctx.strokeRect(28, 28, canvas.width - 56, canvas.height - 56);
  ctx.setLineDash([]);

  // Illustration.
  ctx.drawImage(image, MARGIN, MARGIN, INNER, imageHeight);

  // Stamp and postmark, top right of the writing.
  const stampX = WIDTH - MARGIN - STAMP.width;
  drawStamp(ctx, stampX, headTop, colors);
  drawPostmark(ctx, stampX - POSTMARK_RADIUS - 24, headTop + STAMP.height / 2 + 10, colors);

  // Writing.
  ctx.textBaseline = 'top';
  setText(ctx, FONTS.kicker, colors.bark, '3px');
  ctx.fillText(kicker.toUpperCase(), MARGIN, headTop);
  setText(ctx, FONTS.title, colors.ink);
  drawLines(ctx, titleLines, MARGIN, titleTop, LINE_HEIGHT.title);
  setText(ctx, FONTS.body, colors.ink);
  drawLines(ctx, bodyLines, MARGIN, bodyTop, LINE_HEIGHT.body);

  // Address line.
  ctx.strokeStyle = colors.bark;
  ctx.lineWidth = 1.5;
  ctx.setLineDash([6, 6]);
  ctx.beginPath();
  ctx.moveTo(MARGIN, ruleY);
  ctx.lineTo(WIDTH - MARGIN, ruleY);
  ctx.stroke();
  ctx.setLineDash([]);
  setText(ctx, FONTS.small, colors.bark, '2px');
  ctx.fillText(ADDRESS.toUpperCase(), MARGIN, footerY);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Couldn't draw the postcard."))),
      'image/jpeg',
      0.92,
    );
  });
}
