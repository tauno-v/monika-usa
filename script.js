/*
  Rakenduse põhiline JavaScript. Sisaldab andmete haldamist, UI värskendamist,
  kõne sünteesi ja kõnetuvastuse kasutamist ning faili importi/eksporti.
*/

// Selle võtme all hoiustame kasutaja progressi localStorage'is.
const STORAGE_KEY = 'monikaUSAProgress_v1';

// Progressi massiiv, mida täidame käivitamisel.
let phrases = [];

// Aktiivselt kuvatav fraas.
let currentPhrase = null;

// Selektorid ja elemendid.
const searchInput = document.getElementById('searchInput');
const categorySelect = document.getElementById('categorySelect');
const addButton = document.getElementById('addButton');
const importButton = document.getElementById('importButton');
const exportButton = document.getElementById('exportButton');
const addForm = document.getElementById('addForm');
const card = document.getElementById('card');
const estonianDiv = document.getElementById('estonian');
const translationDiv = document.getElementById('translation');
const showTranslationBtn = document.getElementById('showTranslation');
const playEnglishBtn = document.getElementById('playEnglish');
const recordSpeechBtn = document.getElementById('recordSpeech');
const correctBtn = document.getElementById('correctButton');
const wrongBtn = document.getElementById('wrongButton');
const speechResultDiv = document.getElementById('speechResult');
const importFileInput = document.getElementById('importFile');
// Add form fields
const newEstonian = document.getElementById('newEstonian');
const newEnglish = document.getElementById('newEnglish');
const newCategory = document.getElementById('newCategory');
const saveNewBtn = document.getElementById('saveNew');
const cancelAddBtn = document.getElementById('cancelAdd');

// Laadime progressi või loome uue.
function loadProgress() {
  let stored;
  try {
    stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
  } catch (e) {
    stored = null;
  }
  // Kui localStorage'is pole midagi või struktuur on vale, alustame algandmetega.
  if (!stored || !Array.isArray(stored)) {
    return basePhrases.map(p => createProgressEntry(p));
  }
  // Kui on salvestatud progress, uuendame seda algandmetega.
  // Kui mõni fraas on lisatud hiljem, lisame selle progressi.
  const updated = [...stored];
  basePhrases.forEach(p => {
    if (!updated.some(sp => sp.estonian === p.estonian && sp.english === p.english)) {
      updated.push(createProgressEntry(p));
    }
  });
  return updated;
}

// Loome progressiüksuse algandmete baasil.
function createProgressEntry(p) {
  return {
    id: generateId(),
    estonian: p.estonian,
    english: p.english,
    category: p.category,
    interval: 1, // päevades
    due: Date.now(), // täna
    lastReviewed: null,
  };
}

// Genereeri lihtne juhuslik ID.
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// Salvesta progress localStorage'i.
function saveProgress() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(phrases));
}

// Võta sobivad fraasid vastavalt otsingule ja kategooriale.
function getFilteredPhrases() {
  const term = searchInput.value.trim().toLowerCase();
  const cat = categorySelect.value;
  return phrases.filter(p => {
    const matchesTerm =
      !term || p.estonian.toLowerCase().includes(term) || p.english.toLowerCase().includes(term);
    const matchesCat = cat === 'all' || p.category === cat;
    return matchesTerm && matchesCat;
  });
}

// Leia järgmine fraas, mis on "due" – st. aeg on möödas – või kui pole, siis kõige varem esinev.
function getNextPhrase() {
  const now = Date.now();
  const filtered = getFilteredPhrases();
  if (filtered.length === 0) return null;
  // Sorteerime esialgu due kuupäeva alusel
  filtered.sort((a, b) => a.due - b.due);
  // Leia esimene, mis on tänaseks või varasemaks tähtajaks
  for (const p of filtered) {
    if (p.due <= now) {
      return p;
    }
  }
  // Kui kõik on tulevikus, tagasta esimene (kõige varem due)
  return filtered[0];
}

// Värskenda kategooria valiku menüüd unikaalsete kategooriatega.
function populateCategories() {
  // Esiteks puhastame kõik vana
  categorySelect.innerHTML = '';
  const optAll = document.createElement('option');
  optAll.value = 'all';
  optAll.textContent = 'Kõik kategooriad';
  categorySelect.appendChild(optAll);
  const cats = Array.from(new Set(phrases.map(p => p.category))).sort();
  cats.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
    categorySelect.appendChild(opt);
  });
}

// Kuva fraas kaardil.
function showPhrase() {
  currentPhrase = getNextPhrase();
  if (!currentPhrase) {
    card.classList.add('hidden');
    return;
  }
  card.classList.remove('hidden');
  estonianDiv.textContent = currentPhrase.estonian;
  translationDiv.textContent = currentPhrase.english;
  translationDiv.classList.add('hidden');
  showTranslationBtn.classList.remove('hidden');
  speechResultDiv.textContent = '';
}

// Märgi vastus õigeks või valeks ja ajasta järgmist kordust.
function mark(correct) {
  if (!currentPhrase) return;
  if (correct) {
    currentPhrase.interval = Math.min(currentPhrase.interval * 2, 64);
  } else {
    currentPhrase.interval = 1;
  }
  currentPhrase.lastReviewed = Date.now();
  currentPhrase.due = Date.now() + currentPhrase.interval * 24 * 60 * 60 * 1000;
  saveProgress();
  showPhrase();
}

// Nõnda realiseerime kõnesünteesi.
function speak(text) {
  if (!('speechSynthesis' in window)) {
    alert('Sinu brauser ei toeta kõnesünteesi.');
    return;
  }
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'en-US';
  speechSynthesis.speak(utter);
}

// Nõnda realiseerime kõnetuvastuse.
function listen() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert('Sinu brauser ei toeta kõnetuvastust.');
    return;
  }
  const recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  speechResultDiv.textContent = 'Kuulan…';
  recognition.onresult = event => {
    const transcript = event.results[0][0].transcript;
    speechResultDiv.textContent = 'Sa ütlesid: ' + transcript;
  };
  recognition.onerror = () => {
    speechResultDiv.textContent = 'Kõnetuvastus ebaõnnestus';
  };
  recognition.start();
}

// Impordi failist progress.
function handleImport(files) {
  const file = files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (!Array.isArray(data)) throw new Error('Vigane fail');
      // valime ainult korrektse struktuuri kirjed.
      const cleaned = data
        .filter(item => item.estonian && item.english)
        .map(item => ({
          id: item.id || generateId(),
          estonian: item.estonian,
          english: item.english,
          category: item.category || 'muu',
          interval: item.interval || 1,
          due: item.due || Date.now(),
          lastReviewed: item.lastReviewed || null,
        }));
      phrases = cleaned;
      saveProgress();
      populateCategories();
      showPhrase();
      alert('Andmed imporditud');
    } catch (e) {
      alert('Faili lugemine ebaõnnestus');
    }
  };
  reader.readAsText(file);
}

// Ekspordi progress faili.
function handleExport() {
  const dataStr = JSON.stringify(phrases, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const date = new Date().toISOString().slice(0, 10);
  a.download = `monikausa_export_${date}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Lisa uus fraas
function saveNewPhrase() {
  const est = newEstonian.value.trim();
  const eng = newEnglish.value.trim();
  const cat = newCategory.value.trim() || 'muu';
  if (!est || !eng) {
    alert('Palun sisesta nii eesti- kui ingliskeelne fraas.');
    return;
  }
  const newEntry = {
    id: generateId(),
    estonian: est,
    english: eng,
    category: cat,
    interval: 1,
    due: Date.now(),
    lastReviewed: null,
  };
  phrases.push(newEntry);
  saveProgress();
  populateCategories();
  hideAddForm();
  // tühjendame vormi
  newEstonian.value = '';
  newEnglish.value = '';
  newCategory.value = '';
  showPhrase();
}

// Näita/lokaalne lisa vorm.
function showAddForm() {
  addForm.classList.remove('hidden');
  card.classList.add('hidden');
}

function hideAddForm() {
  addForm.classList.add('hidden');
  card.classList.remove('hidden');
}

// Algtegevused
function init() {
  phrases = loadProgress();
  populateCategories();
  showPhrase();
  // Otsing
  searchInput.addEventListener('input', () => {
    showPhrase();
  });
  // Kategooria filter
  categorySelect.addEventListener('change', () => {
    showPhrase();
  });
  // Näita tõlget
  showTranslationBtn.addEventListener('click', () => {
    translationDiv.classList.remove('hidden');
    showTranslationBtn.classList.add('hidden');
  });
  // Mängi ingliskeelne kõne
  playEnglishBtn.addEventListener('click', () => {
    if (currentPhrase) {
      speak(currentPhrase.english);
    }
  });
  // Kõnetuvastus
  recordSpeechBtn.addEventListener('click', () => {
    listen();
  });
  // Õige/vale
  correctBtn.addEventListener('click', () => mark(true));
  wrongBtn.addEventListener('click', () => mark(false));
  // Lisa fraas nupp
  addButton.addEventListener('click', showAddForm);
  cancelAddBtn.addEventListener('click', hideAddForm);
  saveNewBtn.addEventListener('click', saveNewPhrase);
  // Import ja eksport
  importButton.addEventListener('click', () => importFileInput.click());
  importFileInput.addEventListener('change', () => handleImport(importFileInput.files));
  exportButton.addEventListener('click', handleExport);
}

// Käivitame pärast DOM'i laadimist.
document.addEventListener('DOMContentLoaded', init);