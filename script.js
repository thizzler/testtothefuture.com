/* =============================================
   STATE
   ============================================= */
let selectedIndex = 0;
let currentSection = null;
let isPaused = false;
let isSelectOpen = false;
const menuItems = document.querySelectorAll('.sc-menu-item');
const totalItems = menuItems.length;

/* =============================================
   RESPONSIVE SCALING
   ============================================= */
function scaleToFit() {
  const gb = document.getElementById('gameboy');
  gb.style.transform = 'scale(1)';
  const rect = gb.getBoundingClientRect();
  const padding = 40;
  const scaleX = (window.innerWidth - padding) / rect.width;
  const scaleY = (window.innerHeight - padding) / rect.height;
  const scale = Math.min(scaleX, scaleY);
  gb.style.transform = `scale(${scale})`;
}

window.addEventListener('resize', scaleToFit);
window.addEventListener('load', scaleToFit);

/* =============================================
   MENU NAVIGATION
   ============================================= */
function updateSelection(newIndex) {
  selectedIndex = ((newIndex % totalItems) + totalItems) % totalItems;
  menuItems.forEach((item, i) => {
    item.classList.toggle('selected', i === selectedIndex);
  });
  flashScreen();
}

function navigateUp()    { if (!currentSection) updateSelection(selectedIndex - 1); else scrollSection(-120); }
function navigateDown()  { if (!currentSection) updateSelection(selectedIndex + 1); else scrollSection(120); }
function navigateRight() { if (!currentSection) openSection(); }
function navigateLeft()  { if (currentSection) closeSection(); }

function scrollSection(amount) {
  const view = document.getElementById('view-' + currentSection);
  if (!view) return;
  const body = view.querySelector('.sv-body');
  if (body) body.scrollBy({ top: amount, behavior: 'smooth' });
}

/* =============================================
   OPEN / CLOSE SECTION
   ============================================= */
function openSection(target) {
  const item = target || menuItems[selectedIndex].dataset.target;
  currentSection = item;

  const gb = document.getElementById('gameboy');
  const view = document.getElementById('view-' + item);
  if (!view) return;

  const screen = document.getElementById('gbScreen');
  const screenRect = screen.getBoundingClientRect();
  const centerX = screenRect.left + screenRect.width / 2;
  const centerY = screenRect.top + screenRect.height / 2;
  const originX = (centerX / window.innerWidth * 100).toFixed(1) + '%';
  const originY = (centerY / window.innerHeight * 100).toFixed(1) + '%';

  view.style.transformOrigin = originX + ' ' + originY;

  gb.classList.add('zooming');

  setTimeout(() => {
    view.classList.add('open');
  }, 120);

  pressBtn('btnA');
}

function closeSection() {
  if (!currentSection) return;

  const view = document.getElementById('view-' + currentSection);
  const gb = document.getElementById('gameboy');

  view.classList.remove('open');

  setTimeout(() => {
    gb.classList.remove('zooming');
    currentSection = null;
    scaleToFit();
  }, 300);

  pressBtn('btnB');
}

/* =============================================
   PAUSE
   ============================================= */
function togglePause() {
  isPaused = !isPaused;
  const overlay = document.getElementById('pauseOverlay');
  overlay.classList.toggle('visible', isPaused);
  if (isSelectOpen) closeSelect();
  pressBtn('btnStart');
  flashScreen();
}

/* =============================================
   SELECT EASTER EGG
   ============================================= */
function toggleSelect() {
  if (currentSection) return;
  isSelectOpen = !isSelectOpen;
  const overlay = document.getElementById('selectOverlay');
  overlay.classList.toggle('visible', isSelectOpen);
  if (isPaused) { isPaused = false; document.getElementById('pauseOverlay').classList.remove('visible'); }
  pressBtn('btnSelect');
  flashScreen();
}

function closeSelect() {
  isSelectOpen = false;
  document.getElementById('selectOverlay').classList.remove('visible');
}

/* =============================================
   SCREEN FLASH EFFECT
   ============================================= */
function flashScreen() {
  const screen = document.getElementById('gbScreen');
  screen.classList.remove('screen-flash');
  void screen.offsetWidth;
  screen.classList.add('screen-flash');
}

/* =============================================
   BUTTON PRESS VISUAL
   ============================================= */
function pressBtn(id) {
  const btn = document.getElementById(id);
  if (!btn) return;
  btn.classList.add('pressed');
  setTimeout(() => btn.classList.remove('pressed'), 120);
}

function pressDpad(dir) {
  const dpH = document.getElementById('dpH');
  const dpV = document.getElementById('dpV');
  if (dir === 'left' || dir === 'right') {
    dpH.classList.add('pressed');
    setTimeout(() => dpH.classList.remove('pressed'), 120);
  } else {
    dpV.classList.add('pressed');
    setTimeout(() => dpV.classList.remove('pressed'), 120);
  }
}

/* =============================================
   KEYBOARD CONTROLS
   ============================================= */
document.addEventListener('keydown', (e) => {
  if (e.repeat) return;

  if ((e.key === 'Escape' || e.key === 'b' || e.key === 'B') && isSelectOpen) {
    closeSelect();
    return;
  }
  if ((e.key === 'Escape' || e.key === 'b' || e.key === 'B') && isPaused) {
    togglePause();
    return;
  }
  if (isPaused || isSelectOpen) return;

  switch (e.key) {
    case 'ArrowUp':
      e.preventDefault();
      navigateUp();
      pressDpad('up');
      break;
    case 'ArrowDown':
      e.preventDefault();
      navigateDown();
      pressDpad('down');
      break;
    case 'ArrowRight':
      e.preventDefault();
      if (!currentSection) { navigateRight(); pressDpad('right'); }
      break;
    case 'ArrowLeft':
      e.preventDefault();
      if (currentSection) { navigateLeft(); pressDpad('left'); }
      break;
    case 'Enter':
    case 'a':
    case 'A':
      if (!currentSection) openSection();
      else pressBtn('btnA');
      break;
    case 'Escape':
    case 'b':
    case 'B':
      if (currentSection) closeSection();
      break;
    case 'p':
    case 'P':
      if (!currentSection) togglePause();
      break;
    case 'Tab':
      e.preventDefault();
      toggleSelect();
      break;
  }
});

/* =============================================
   CLICK/TOUCH CONTROLS FOR DPAD
   ============================================= */
const dpH = document.getElementById('dpH');
const dpV = document.getElementById('dpV');

function getDpadDirection(e, el) {
  const rect = el.getBoundingClientRect();
  const x = (e.clientX || (e.touches && e.touches[0].clientX) || 0) - rect.left;
  const y = (e.clientY || (e.touches && e.touches[0].clientY) || 0) - rect.top;
  if (el === dpH) return x < rect.width / 2 ? 'left' : 'right';
  if (el === dpV) return y < rect.height / 2 ? 'up' : 'down';
  return null;
}

function handleDpadPress(e, el) {
  const dir = getDpadDirection(e, el);
  if (!dir) return;
  if (isPaused || isSelectOpen) return;
  switch (dir) {
    case 'up':    navigateUp();    break;
    case 'down':  navigateDown();  break;
    case 'left':  navigateLeft();  break;
    case 'right': navigateRight(); break;
  }
}

dpH.addEventListener('click', (e) => handleDpadPress(e, dpH));
dpV.addEventListener('click', (e) => handleDpadPress(e, dpV));

document.getElementById('btnA').addEventListener('click', () => {
  if (isPaused || isSelectOpen) return;
  if (!currentSection) openSection();
});

document.getElementById('btnB').addEventListener('click', () => {
  if (isSelectOpen) { closeSelect(); return; }
  if (isPaused) { togglePause(); return; }
  if (currentSection) closeSection();
});

document.getElementById('btnStart').addEventListener('click', () => {
  if (!currentSection) togglePause();
});

document.getElementById('btnSelect').addEventListener('click', () => {
  toggleSelect();
});

menuItems.forEach((item, i) => {
  item.addEventListener('click', () => {
    updateSelection(i);
    setTimeout(() => openSection(), 80);
  });
});

/* =============================================
   INIT
   ============================================= */
updateSelection(0);
