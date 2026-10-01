import { createSignalField } from './signal-field.js';

const tracks = [
  { id: 'nimjyrTPcnw', artist: 'dorian drowns', title: 'chroma', duration: '06:32' },
  { id: 'PsgylGbi310', artist: 'crystal warmth', title: 'eternal', duration: '09:56' },
  { id: 'ywWVFKuQrdw', artist: 'kmru, thea soti', title: 'vacuum', duration: '04:12' },
  { id: 'ibBXlEbeWpo', artist: 'hkls', title: 'a never-ending loop of emotions', duration: '02:45' },
  { id: 'v6NA-M9KpVs', artist: 'c418', title: 'warmth (slowed + reverb)', duration: '06:32' },
  { id: '7w60uIwI3hU', artist: 'burial', title: 'stolen dog (ambient edit)', duration: '10:33' },
  { id: 'kFQ3hry8teM', artist: 'findnothing, hide waldo, hikari', title: 'elsewhere', duration: '01:44' },
];

const menu = document.querySelector('#mobile-menu');
const menuButton = document.querySelector('.menu-button');
const listeningDialog = document.querySelector('#listening-dialog');
const contactDialog = document.querySelector('#contact-dialog');
const videoStage = document.querySelector('#video-stage');
const queue = document.querySelector('#listen-queue');
const previous = document.querySelector('#previous-track');
const next = document.querySelector('#next-track');
const form = document.querySelector('#contact-form');
let selectedIndex = 0;

function selectTrack(index) {
  if (!Number.isInteger(index) || index < 0 || index >= tracks.length) return;
  selectedIndex = index;
  const track = tracks[index];
  document.querySelector('#playing-artist').textContent = track.artist;
  document.querySelector('#playing-title').textContent = track.title;
  document.querySelector('#youtube-fallback').href = `https://www.youtube.com/watch?v=${track.id}`;
  previous.disabled = index === 0;
  next.disabled = index === tracks.length - 1;
  queue.querySelectorAll('button').forEach((button, i) => {
    button.setAttribute('aria-current', String(i === index));
  });
  const iframe = document.createElement('iframe');
  const url = new URL(`https://www.youtube-nocookie.com/embed/${track.id}`);
  url.search = new URLSearchParams({ autoplay: '1', controls: '1', rel: '0', playsinline: '1' }).toString();
  iframe.src = url.href;
  iframe.title = `${track.artist} — ${track.title}, YouTube player`;
  iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen';
  iframe.allowFullscreen = true;
  iframe.referrerPolicy = 'strict-origin-when-cross-origin';
  videoStage.replaceChildren(iframe);
}

function openTrack(id) {
  const index = tracks.findIndex((track) => track.id === id);
  if (index === -1 || typeof listeningDialog.showModal !== 'function') return false;
  if (menu.open) menu.close();
  if (!listeningDialog.open) listeningDialog.showModal();
  selectTrack(index);
  return true;
}

tracks.forEach((track, index) => {
  const li = document.createElement('li');
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'queue-track';
  button.setAttribute('aria-label', `Listen to ${track.title} by ${track.artist}, ${track.duration}`);
  const number = document.createElement('span');
  number.className = 'queue-number mono';
  number.textContent = String(index + 1).padStart(2, '0');
  number.setAttribute('aria-hidden', 'true');
  const label = document.createElement('span');
  const name = document.createElement('span');
  name.className = 'queue-name';
  name.textContent = track.title;
  const artist = document.createElement('span');
  artist.className = 'queue-artist';
  artist.textContent = track.artist;
  label.append(name, artist);
  const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  icon.setAttribute('aria-hidden', 'true');
  const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
  use.setAttribute('href', '#i-play');
  icon.append(use);
  button.append(number, label, icon);
  button.addEventListener('click', () => selectTrack(index));
  li.append(button);
  queue.append(li);
});
document.querySelector('#queue-count').textContent = `${String(tracks.length).padStart(2, '0')} tracks`;

document.addEventListener('click', (event) => {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const listenLink = event.target.closest('a[data-listen]');
  if (listenLink && openTrack(listenLink.dataset.listen)) event.preventDefault();
  const contactLink = event.target.closest('a[data-contact]');
  if (contactLink && typeof contactDialog.showModal === 'function') {
    event.preventDefault();
    if (menu.open) menu.close();
    contactDialog.showModal();
  }
});
previous.addEventListener('click', () => selectTrack(selectedIndex - 1));
next.addEventListener('click', () => selectTrack(selectedIndex + 1));
listeningDialog.addEventListener('close', () => videoStage.replaceChildren());

document.querySelectorAll('dialog').forEach((dialog) => {
  dialog.querySelectorAll('[data-close]').forEach((button) => button.addEventListener('click', () => dialog.close()));
  let backdropDown = false;
  dialog.addEventListener('pointerdown', (event) => {
    const bounds = dialog.getBoundingClientRect();
    backdropDown = event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom);
  });
  dialog.addEventListener('click', (event) => {
    if (backdropDown && event.target === dialog) dialog.close();
    backdropDown = false;
  });
});

menuButton.addEventListener('click', () => {
  if (typeof menu.showModal !== 'function') { location.hash = '#music'; return; }
  menu.showModal();
  menuButton.setAttribute('aria-expanded', 'true');
});
menu.addEventListener('close', () => menuButton.setAttribute('aria-expanded', 'false'));
menu.querySelectorAll('a[href^="#"]').forEach((link) => link.addEventListener('click', () => menu.close()));

form.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const values = new FormData(form);
  const name = String(values.get('name') || '').trim();
  const email = String(values.get('email') || '').trim();
  const topic = String(values.get('topic') || '').trim();
  const message = String(values.get('message') || '').trim();
  if (!name || !message) {
    const status = document.querySelector('#form-status');
    status.textContent = 'Please add your name and a message.';
    status.hidden = false;
    return;
  }
  const subject = `${topic} — ${name}`;
  const body = `Name: ${name}\nEmail: ${email}\n\n${message}`;
  const url = `mailto:hello@drowninfog.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = url;
  const status = document.querySelector('#form-status');
  status.textContent = 'Your email draft is ready. If your email app didn’t open, copy your message and email hello@drowninfog.com. Nothing has been sent from this page.';
  status.hidden = false;
});

const motionButton = document.querySelector('.motion-toggle');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let motionPaused = reduceMotion.matches;
try { if (sessionStorage.getItem('dif-motion') === 'paused') motionPaused = true; } catch {}
const reveals = new Set();
const signal = createSignalField({
  canvas: document.querySelector('#signal-canvas'),
  container: document.querySelector('#signal-art'),
  xLabel: document.querySelector('#field-x'),
  yLabel: document.querySelector('#field-y'),
  paused: motionPaused,
});
function updateMotion() {
  document.documentElement.classList.toggle('motion-paused', motionPaused);
  motionButton.setAttribute('aria-pressed', String(motionPaused));
  motionButton.setAttribute('aria-label', motionPaused ? 'Resume interface motion' : 'Pause interface motion');
  motionButton.querySelector('span').textContent = motionPaused ? 'Motion paused' : 'Pause motion';
  motionButton.querySelector('use').setAttribute('href', motionPaused ? '#i-play' : '#i-pause');
  signal.setPaused(motionPaused);
  if (motionPaused) reveals.forEach(animation => animation.finish());
}
motionButton.addEventListener('click', () => {
  motionPaused = !motionPaused;
  updateMotion();
  try { sessionStorage.setItem('dif-motion', motionPaused ? 'paused' : 'active'); } catch {}
});
reduceMotion.addEventListener('change', event => {
  motionPaused = event.matches;
  try { if (sessionStorage.getItem('dif-motion') === 'paused') motionPaused = true; } catch {}
  updateMotion();
});
updateMotion();
motionButton.hidden = false;
menuButton.hidden = false;
document.querySelector('#year').textContent = String(new Date().getFullYear());

// A modal covers the artwork: stop rendering until it closes, including native Escape dismissal.
const dialogObserver = new MutationObserver(() => {
  signal.setSuspended([...document.querySelectorAll('dialog')].some(dialog => dialog.open));
});
document.querySelectorAll('dialog').forEach(dialog => dialogObserver.observe(dialog, { attributes: true, attributeFilter: ['open'] }));

// Content is always present. Reveals only enhance sections as they become visible.
if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      if (!motionPaused && typeof entry.target.animate === 'function') {
        const animation = entry.target.animate([
          { opacity: .55, transform: 'translateY(18px)' },
          { opacity: 1, transform: 'translateY(0)' },
        ], { duration: 650, easing: 'cubic-bezier(.2,.65,.3,1)' });
        reveals.add(animation);
        animation.finished.then(() => reveals.delete(animation), () => reveals.delete(animation));
      }
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: .06 });
  document.querySelectorAll('.reveal').forEach(element => revealObserver.observe(element));
  const navigation = [...document.querySelectorAll('.desktop-nav a')];
  const sectionObserver = new IntersectionObserver(entries => {
    const entry = entries.find(item => item.isIntersecting);
    if (!entry) return;
    navigation.forEach(link => {
      if (link.hash === '#' + entry.target.id) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }, { rootMargin: '-20% 0px -60% 0px', threshold: 0 });
  document.querySelectorAll('main > section').forEach(section => sectionObserver.observe(section));
}
