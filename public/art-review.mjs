// Presentation of the approved reference. Deliberately static: no animation claims.
export async function createArtReview(canvas) {
  const image = new Image();
  image.src = new URL('./assets/romanian-approved-reference.png', import.meta.url).href;
  await image.decode();
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas unavailable');
  let width = 1, height = 1, dirty = true;
  function resize(w, h) {
    width = w; height = h;
    const ratio = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(w * ratio); canvas.height = Math.round(h * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    dirty = true;
  }
  return { resize, get stats() { return { engine: 'art-review', static: true, rendered: !dirty }; }, render() {
    if (!dirty) return;
    context.fillStyle = '#263c34'; context.fillRect(0, 0, width, height);
    const cover = Math.max(width / image.width, height / image.height);
    context.filter = 'blur(18px)';
    context.drawImage(image, (width-image.width*cover)/2, (height-image.height*cover)/2, image.width*cover, image.height*cover);
    context.filter = 'none';
    const scale = Math.min(width / image.width, height / image.height);
    context.drawImage(image, (width-image.width*scale)/2, (height-image.height*scale)/2, image.width*scale, image.height*scale);
    dirty = false;
  } };
}
