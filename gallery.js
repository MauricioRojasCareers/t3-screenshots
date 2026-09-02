const gallery = document.querySelector('#gallery');
const template = document.querySelector('#card-template');
const count = document.querySelector('#count');
const lightbox = document.querySelector('#lightbox');
let items = [];
let filter = 'all';

const formatSize = bytes => {
  const mb = bytes / 1024 / 1024;
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;
};

const render = () => {
  const visible = items.filter(item => filter === 'all' || item.type === filter);
  gallery.replaceChildren();
  count.textContent = `${visible.length} item${visible.length === 1 ? '' : 's'}`;
  if (!visible.length) {
    gallery.innerHTML = '<p class="empty">No captures in this category yet.</p>';
    return;
  }

  for (const item of visible) {
    const card = template.content.cloneNode(true);
    const media = card.querySelector('.media');
    if (item.type === 'video') {
      const video = document.createElement('video');
      video.controls = true;
      video.playsInline = true;
      video.preload = 'metadata';
      const source = document.createElement('source');
      source.src = item.url;
      source.type = 'video/mp4';
      video.append(source);
      media.append(video);
    } else {
      const image = document.createElement('img');
      image.loading = 'lazy';
      image.alt = 'Desktop screenshot';
      image.src = item.url;
      image.addEventListener('click', () => {
        lightbox.querySelector('img').src = item.url;
        lightbox.showModal();
      });
      media.append(image);
    }
    card.querySelector('.kind').textContent = item.type === 'video' ? 'Recording' : 'Screenshot';
    const date = new Date(item.created_at);
    const time = card.querySelector('time');
    time.dateTime = item.created_at;
    time.textContent = `${date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} · ${formatSize(item.size)}`;
    const download = card.querySelector('.download');
    download.href = item.url;
    download.textContent = item.type === 'video' ? 'Download ↗' : 'Original ↗';
    gallery.append(card);
  }
};

document.querySelectorAll('.filter').forEach(button => button.addEventListener('click', () => {
  document.querySelector('.filter.active').classList.remove('active');
  button.classList.add('active');
  filter = button.dataset.filter;
  render();
}));

lightbox.querySelector('.close').addEventListener('click', () => lightbox.close());
lightbox.addEventListener('click', event => { if (event.target === lightbox) lightbox.close(); });

fetch(`media.json?v=${Date.now()}`)
  .then(response => { if (!response.ok) throw new Error('Could not load media index'); return response.json(); })
  .then(data => { items = data.items; render(); })
  .catch(error => { gallery.innerHTML = `<p class="empty">${error.message}</p>`; });
