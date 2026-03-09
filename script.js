/* =============================================
   STATE
   ============================================= */
let selectedIndex = 0;
let currentSection = null;
let isPaused = false;
let isSelectOpen = false;

const menuItems = document.querySelectorAll('.sc-menu-item');
const totalItems = menuItems.length;

const sectionMeta = {
  about:   { screen: 'ABOUT',   sub: 'Player Profile' },
  skills:  { screen: 'SKILLS',  sub: 'Skill Tree' },
  writing: { screen: 'WRITING', sub: 'Field Notes' },
  contact: { screen: 'CONTACT', sub: 'Send Message' },
};

/* =============================================
   RESPONSIVE SCALING (homepage only)
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

window.addEventListener('resize', () => { if (!currentSection) scaleToFit(); });
window.addEventListener('load', scaleToFit);

/* =============================================
   MENU NAVIGATION (homepage)
   ============================================= */
function updateSelection(newIndex) {
  selectedIndex = ((newIndex % totalItems) + totalItems) % totalItems;
  menuItems.forEach((item, i) => item.classList.toggle('selected', i === selectedIndex));
  flashScreen();
}

function navigateUp()    { if (!currentSection) updateSelection(selectedIndex - 1); }
function navigateDown()  { if (!currentSection) updateSelection(selectedIndex + 1); }
function navigateRight() { if (!currentSection) openSection(); }
function navigateLeft()  { if (currentSection) closeSection(); }

/* =============================================
   OPEN / CLOSE SECTION
   ============================================= */
function openSection(target) {
  const item = target || menuItems[selectedIndex].dataset.target;
  currentSection = item;

  // Update sidebar mini screen
  const meta = sectionMeta[item];
  document.getElementById('ssSection').textContent = meta.screen;
  document.getElementById('ssSub').textContent = meta.sub;

  // Update sidebar nav
  document.querySelectorAll('.snav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.target === item);
    el.textContent = (el.dataset.target === item ? '▶ ' : '') + el.dataset.target.toUpperCase();
  });

  // Show correct section page
  document.querySelectorAll('.section-page').forEach(p => p.classList.remove('active'));
  document.getElementById('section-' + item).classList.add('active');

  // Reset content scroll
  document.getElementById('contentArea').scrollTop = 0;

  // Transition: hide homepage, show section layout
  document.getElementById('homepage').classList.add('hidden');
  setTimeout(() => {
    document.getElementById('sectionLayout').classList.add('open');
  }, 100);
}

function closeSection() {
  if (!currentSection) return;
  currentSection = null;

  document.getElementById('sectionLayout').classList.remove('open');
  setTimeout(() => {
    document.getElementById('homepage').classList.remove('hidden');
    scaleToFit();
  }, 200);
}

function switchSection(target) {
  if (target === currentSection) return;
  currentSection = target;

  const meta = sectionMeta[target];
  document.getElementById('ssSection').textContent = meta.screen;
  document.getElementById('ssSub').textContent = meta.sub;

  document.querySelectorAll('.snav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.target === target);
    el.textContent = (el.dataset.target === target ? '▶ ' : '') + el.dataset.target.toUpperCase();
  });

  document.querySelectorAll('.section-page').forEach(p => p.classList.remove('active'));
  document.getElementById('section-' + target).classList.add('active');
  document.getElementById('contentArea').scrollTop = 0;
}

/* =============================================
   PAUSE
   ============================================= */
function togglePause() {
  isPaused = !isPaused;
  document.getElementById('pauseOverlay').classList.toggle('visible', isPaused);
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
  document.getElementById('selectOverlay').classList.toggle('visible', isSelectOpen);
  if (isPaused) {
    isPaused = false;
    document.getElementById('pauseOverlay').classList.remove('visible');
  }
  pressBtn('btnSelect');
  flashScreen();
}

function closeSelect() {
  isSelectOpen = false;
  document.getElementById('selectOverlay').classList.remove('visible');
}

/* =============================================
   SCREEN FLASH
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
  const id = (dir === 'left' || dir === 'right') ? 'dpH' : 'dpV';
  const el = document.getElementById(id);
  el.classList.add('pressed');
  setTimeout(() => el.classList.remove('pressed'), 120);
}

/* =============================================
   KEYBOARD
   ============================================= */
document.addEventListener('keydown', (e) => {
  if (e.repeat) return;

  if ((e.key === 'Escape' || e.key === 'b' || e.key === 'B') && isSelectOpen) { closeSelect(); return; }
  if ((e.key === 'Escape' || e.key === 'b' || e.key === 'B') && isPaused) { togglePause(); return; }
  if (isPaused || isSelectOpen) return;

  switch (e.key) {
    case 'ArrowUp':
      e.preventDefault();
      if (currentSection) document.getElementById('contentArea').scrollBy({ top: -120, behavior: 'smooth' });
      else { navigateUp(); pressDpad('up'); }
      break;
    case 'ArrowDown':
      e.preventDefault();
      if (currentSection) document.getElementById('contentArea').scrollBy({ top: 120, behavior: 'smooth' });
      else { navigateDown(); pressDpad('down'); }
      break;
    case 'ArrowRight':
      e.preventDefault();
      if (!currentSection) { navigateRight(); pressDpad('right'); }
      break;
    case 'ArrowLeft':
      e.preventDefault();
      if (currentSection) { closeSection(); pressDpad('left'); }
      break;
    case 'Enter': case 'a': case 'A':
      if (!currentSection) openSection();
      break;
    case 'Escape': case 'b': case 'B':
      if (currentSection) closeSection();
      break;
    case 'p': case 'P':
      if (!currentSection) togglePause();
      break;
    case 'Tab':
      e.preventDefault();
      toggleSelect();
      break;
  }
});

/* =============================================
   HOMEPAGE CLICK CONTROLS
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

dpH.addEventListener('click', (e) => {
  const dir = getDpadDirection(e, dpH);
  if (!dir || isPaused || isSelectOpen) return;
  if (dir === 'left' && currentSection) closeSection();
  if (dir === 'right' && !currentSection) openSection();
});

dpV.addEventListener('click', (e) => {
  const dir = getDpadDirection(e, dpV);
  if (!dir || isPaused || isSelectOpen) return;
  if (dir === 'up') navigateUp();
  if (dir === 'down') navigateDown();
});

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

document.getElementById('btnSelect').addEventListener('click', () => toggleSelect());

menuItems.forEach((item, i) => {
  item.addEventListener('click', () => {
    updateSelection(i);
    setTimeout(() => openSection(), 80);
  });
});

/* =============================================
   SIDEBAR CONTROLS
   ============================================= */
document.querySelectorAll('.snav-item').forEach(el => {
  el.addEventListener('click', () => switchSection(el.dataset.target));
});

document.getElementById('sidebarBackBtn').addEventListener('click', closeSection);

/* =============================================
   INIT
   ============================================= */
updateSelection(0);
