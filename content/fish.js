let fishCanvas = null;

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === 'showFish' && !fishCanvas) {
    startFishAnimation();
  }
});

function startFishAnimation() {
  const canvas = document.createElement('canvas');
  canvas.id = '__fish_canvas__';
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);
  fishCanvas = canvas;

  const ctx = canvas.getContext('2d');
  const img = new Image();
  img.src = chrome.runtime.getURL('assets/fish.svg');

  const count = Math.floor(Math.random() * 11) + 15; // 15〜25匹
  const fishes = Array.from({ length: count }, () => ({
    x: canvas.width + Math.random() * 400,
    y: Math.random() * (canvas.height - 80) + 40,
    speed: Math.random() * 3 + 2,   // 2〜5 px/frame
    size: Math.random() * 30 + 30,  // 30〜60 px
    angle: Math.random() * Math.PI * 2,
    angleSpeed: (Math.random() - 0.5) * 0.06,
  }));

  let animId;

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let allGone = true;
    for (const f of fishes) {
      f.x -= f.speed;
      f.angle += f.angleSpeed;
      f.y += Math.sin(f.angle) * 1.5;

      if (f.x > -f.size) {
        allGone = false;
        ctx.save();
        ctx.translate(f.x + f.size / 2, f.y + f.size / 2);
        ctx.scale(-1, 1); // 左向きに反転
        ctx.drawImage(img, -f.size / 2, -f.size / 2, f.size, f.size * 0.6);
        ctx.restore();
      }
    }

    if (allGone) {
      canvas.remove();
      fishCanvas = null;
      cancelAnimationFrame(animId);
    } else {
      animId = requestAnimationFrame(draw);
    }
  }

  img.onload = () => {
    animId = requestAnimationFrame(draw);
  };

  // SVGがキャッシュ済みの場合 onload が発火しないケースへの対応
  if (img.complete) {
    animId = requestAnimationFrame(draw);
  }
}
