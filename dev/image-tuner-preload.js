/**
 * Magnolia Image Tuner — Preload Script
 * Must live in <head>. Injects saved CSS before first paint to prevent
 * flash of unstyled images. Local only — does nothing in production.
 */
const isLocal = ['localhost', '127.0.0.1', ''].includes(window.location.hostname) || window.location.protocol === 'file:';
if (isLocal) {
  try {
    const raw = localStorage.getItem('magnolia-tuner-config');
    if (raw) {
      const config = JSON.parse(raw);
      let css = '';
      for (const [path, img] of Object.entries(config.images || config)) {
        const id = img.id;
        if (!id) continue;
        const t = (img.offsetX !== undefined || img.offsetY !== undefined)
          ? `scale(${img.scale}) translate(${img.offsetX || 0}%, ${img.offsetY || 0}%)`
          : `scale(${img.scale})`;
        css += `[data-tuner-id="${id}"] { width:${img.containerWidth}px !important; height:${img.containerHeight}px !important; overflow:hidden !important; }\n`;
        css += `img[data-tuner-id="${id}"], [data-tuner-id="${id}"] img { transform:${t} !important; transform-origin:center !important; object-fit:${img.objectFit} !important; object-position:${img.objectPositionX}% ${img.objectPositionY}% !important; border-radius:${img.borderRadius}px !important; }\n`;
      }
      if (css) {
        const style = document.createElement('style');
        style.id = 'tuner-preload-styles';
        style.textContent = css;
        document.head.appendChild(style);
      }
    }
  } catch(e) {}
}
