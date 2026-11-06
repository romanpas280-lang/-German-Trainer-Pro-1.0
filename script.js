/* ===== GERMAN NUMBER CONVERTER ===== */
const germanNumbers = {
    0: 'null', 1: 'eins', 2: 'zwei', 3: 'drei', 4: 'vier', 5: 'fünf',
    6: 'sechs', 7: 'sieben', 8: 'acht', 9: 'neun', 10: 'zehn',
    11: 'elf', 12: 'zwölf', 13: 'dreizehn', 14: 'vierzehn', 15: 'fünfzehn',
    16: 'sechzehn', 17: 'siebzehn', 18: 'achtzehn', 19: 'neunzehn', 20: 'zwanzig',
    30: 'dreißig', 40: 'vierzig', 50: 'fünfzig', 60: 'sechzig',
    70: 'siebzig', 80: 'achtzig', 90: 'neunzig',
    100: 'hundert', 1000: 'tausend'
};

function numberToGerman(num) {
    if (num === 0) return 'null';
    if (num <= 20) return germanNumbers[num];

    if (num < 100) {
        const ones = num % 10;
        const tens = Math.floor(num / 10) * 10;
        if (ones === 0) return germanNumbers[tens];
        return germanNumbers[ones] + 'und' + germanNumbers[tens];
    }

    if (num < 1000) {
        const hundreds = Math.floor(num / 100);
        const remainder = num % 100;
        let result = (hundreds === 1 ? '' : germanNumbers[hundreds]) + 'hundert';
        if (remainder > 0) result += numberToGerman(remainder);
        return result;
    }

    if (num < 10000) {
        const thousands = Math.floor(num / 1000);
        const remainder = num % 1000;
        let result = (thousands === 1 ? '' : germanNumbers[thousands]) + 'tausend';
        if (remainder > 0) result += numberToGerman(remainder);
        return result;
    }

    return num.toString();
}

function speakGerman(text) {
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'de-DE';
    utterance.rate = (typeof readerSettings !== 'undefined' && readerSettings.rate) || 0.8;
    speechSynthesis.speak(utterance);
}

function stopSpeaking() {
    speechSynthesis.cancel();
}

/* ===== ВБУДОВАНІ ТЕКСТИ ===== */
const builtinTexts = [
    {
        id: 1,
        title: "Привітання",
        content: `Hallo[Привіт|хало]! Wie[Як|ві] geht[йде|гет] es[воно|ес] dir[тобі|дір]?
Mir[Мені|мір] geht[йде|гет] es[воно|ес] gut[добре|гут], danke[дякую|данке]!
Und[І|унд] dir[тобі|дір]?`
    },
    {
        id: 2,
        title: "Знайомство",
        content: `Ich[Я|іх] heiße[звуся|хайсе] Anna[Анна|ана].
Wie[Як|ві] heißt[звуся|хайст] du[ти|ду]?
Freut[Радий|фройт] mich[мене|міх], dich[тебе|діх] kennenzulernen[познайомитись|кененцулернен]!`
    },
    {
        id: 3,
        title: "Сім'я",
        content: `Meine[Моя|майне] Familie[сім'я|фаміліє] ist[є|іст] groß[велика|грос].
Ich[Я|іх] habe[маю|хабе] einen[одного|айнен] Bruder[брата|брудер] und[і|унд] eine[одну|айне] Schwester[сестру|швестер].
Mein[Мій|майн] Vater[батько|фатер] arbeitet[працює|арбайтет] als[як|альс] Lehrer[вчитель|лерер].`
    },
    {
        id: 4,
        title: "Їжа",
        content: `Ich[Я|іх] esse[їм|есе] gern[охоче|герн] Pizza[піцу|піца].
Zum[На|цум] Frühstück[сніданок|фрюштюк] trinke[п'ю|трінке] ich[я|іх] Kaffee[каву|кафе].
Das[Це|дас] Essen[їжа|есен] schmeckt[смакує|шмект] sehr[дуже|зер] gut[добре|гут]!`
    },
    {
        id: 5,
        title: "Погода",
        content: `Heute[Сьогодні|хойте] ist[є|іст] das[це|дас] Wetter[погода|ветер] schön[гарна|шен].
Die[Це|ді] Sonne[сонце|зоне] scheint[світить|шайнт] hell[яскраво|хель].
Es[Воно|ес] ist[є|іст] warm[тепло|варм] und[і|унд] angenehm[приємно|ангенем].`
    }
];

/* ===== ФОНОВА МУЗИКА ===== */
// Вбудована музика генерується в браузері (Web Audio), тому не потребує файлів чи інтернету.
// Також можна вибрати власний файл з пристрою або вставити посилання на MP3.

const midiToFreq = (m) => 440 * Math.pow(2, (m - 69) / 12);

const MusicSynth = {
    ctx: null,
    master: null,
    send: null,
    timer: null,
    preset: null,
    step: 0,
    nextTime: 0,

    ensureContext() {
        if (this.ctx) return this.ctx;
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        this.ctx = new AC();

        this.master = this.ctx.createGain();
        this.master.gain.value = 0;
        const comp = this.ctx.createDynamicsCompressor();
        this.master.connect(comp);
        comp.connect(this.ctx.destination);

        // Легка «луна» для об'єму звуку
        this.send = this.ctx.createGain();
        this.send.gain.value = 0.35;
        const delay = this.ctx.createDelay(1);
        delay.delayTime.value = 0.38;
        const fb = this.ctx.createGain();
        fb.gain.value = 0.35;
        const lp = this.ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.value = 1800;
        this.send.connect(delay);
        delay.connect(lp);
        lp.connect(fb);
        fb.connect(delay);
        lp.connect(this.master);
        return this.ctx;
    },

    note(midi, time, dur, o = {}) {
        const ctx = this.ctx;
        const attack = o.attack ?? 0.02;
        const release = o.release ?? 0.6;
        const peak = o.gain ?? 0.1;

        const env = ctx.createGain();
        env.gain.setValueAtTime(0.0001, time);
        env.gain.linearRampToValueAtTime(peak, time + attack);
        if (o.pluck) {
            env.gain.exponentialRampToValueAtTime(0.0001, time + dur);
        } else {
            env.gain.setValueAtTime(peak, time + Math.max(attack, dur - release));
            env.gain.linearRampToValueAtTime(0.0001, time + dur);
        }

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = o.cutoff ?? 1200;
        filter.connect(env);

        (o.types || ['triangle']).forEach((type, i) => {
            const osc = ctx.createOscillator();
            osc.type = type;
            osc.frequency.value = midiToFreq(midi) * (o.ratios?.[i] ?? 1);
            osc.detune.value = (o.detune ?? 0) * (i % 2 ? -1 : 1);
            const g = ctx.createGain();
            g.gain.value = o.mix?.[i] ?? 1;
            osc.connect(g);
            g.connect(filter);
            osc.start(time);
            osc.stop(time + dur + 0.05);
        });

        env.connect(this.master);
        if (o.wet) {
            const w = ctx.createGain();
            w.gain.value = o.wet;
            env.connect(w);
            w.connect(this.send);
        }
    },

    presets: {
        // Спокійні акорди: Cmaj7 – Am7 – Fmaj7 – G6
        calm: {
            beat: 0.75,
            chords: [[60, 64, 67, 71], [57, 60, 64, 67], [53, 57, 60, 64], [55, 59, 62, 64]],
            scale: [72, 74, 76, 79, 81],
            play(s, t, step) {
                const chord = this.chords[Math.floor(step / 4) % this.chords.length];
                if (step % 4 === 0) {
                    chord.forEach(n => s.note(n, t, this.beat * 4, {
                        types: ['triangle', 'sine'], detune: 6, attack: 0.5, release: 1.4,
                        gain: 0.035, cutoff: 900, wet: 0.4 }));
                    s.note(chord[0] - 24, t, this.beat * 3.8, {
                        types: ['sine'], attack: 0.05, release: 1, gain: 0.12, cutoff: 400 });
                }
                if (Math.random() < 0.35) {
                    const n = this.scale[Math.floor(Math.random() * this.scale.length)];
                    s.note(n, t + (Math.random() < 0.5 ? 0 : this.beat / 2), 1.2, {
                        types: ['sine', 'triangle'], mix: [1, 0.3], pluck: true,
                        gain: 0.05, cutoff: 2500, wet: 0.6 });
                }
            }
        },
        // Ембієнт: довгі м'які шари, D-мажор
        ambient: {
            beat: 2,
            chords: [[50, 57, 62, 66, 69], [47, 54, 57, 62, 66], [43, 55, 59, 62, 66], [45, 52, 57, 62, 64]],
            scale: [74, 76, 78, 81, 83, 86],
            play(s, t, step) {
                const chord = this.chords[Math.floor(step / 4) % this.chords.length];
                if (step % 4 === 0) {
                    chord.forEach(n => s.note(n, t, this.beat * 5, {
                        types: ['sine', 'sine'], detune: 8, attack: 3, release: 4,
                        gain: 0.04, cutoff: 700, wet: 0.5 }));
                }
                if (Math.random() < 0.5) {
                    const n = this.scale[Math.floor(Math.random() * this.scale.length)];
                    s.note(n, t + Math.random(), 3, {
                        types: ['sine'], attack: 0.6, release: 2, gain: 0.025, cutoff: 3000, wet: 0.8 });
                }
            }
        },
        // Піаніно-арпеджіо: Am – F – C – G
        piano: {
            beat: 0.3,
            chords: [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]],
            pattern: [0, 1, 2, 3, 4, 3, 2, 1],
            play(s, t, step) {
                const chord = this.chords[Math.floor(step / 8) % this.chords.length];
                const tones = [chord[0], chord[1], chord[2], chord[0] + 12, chord[1] + 12];
                const n = tones[this.pattern[step % 8]];
                const piano = { types: ['triangle', 'sine'], ratios: [1, 2], mix: [1, 0.25],
                                attack: 0.005, pluck: true, cutoff: 2200, wet: 0.35 };
                s.note(n, t, 1.4, { ...piano, gain: step % 8 === 0 ? 0.09 : 0.065 });
                if (step % 8 === 0) s.note(chord[0] - 12, t, 2.4, { ...piano, gain: 0.08, cutoff: 900 });
            }
        }
    },

    start(name, volume) {
        if (!this.ensureContext()) return false;
        this.stop();
        this.preset = this.presets[name];
        if (!this.preset) return false;
        this.setVolume(volume);
        this.step = 0;
        this.nextTime = this.ctx.currentTime + 0.1;
        // Планувальник: заздалегідь ставить ноти на найближчі пів секунди
        this.timer = setInterval(() => {
            if (this.ctx.state !== 'running') {
                this.nextTime = this.ctx.currentTime + 0.1;
                return;
            }
            while (this.nextTime < this.ctx.currentTime + 0.5) {
                this.preset.play(this, this.nextTime, this.step);
                this.nextTime += this.preset.beat;
                this.step++;
            }
        }, 100);
        return true;
    },

    stop() {
        clearInterval(this.timer);
        this.timer = null;
        this.preset = null;
        if (this.master && this.ctx) {
            // Плавно глушимо ноти, що ще звучать
            const g = this.master.gain;
            const now = this.ctx.currentTime;
            g.cancelScheduledValues(now);
            g.setValueAtTime(g.value, now);
            g.linearRampToValueAtTime(0, now + 0.3);
        }
    },

    setVolume(v) {
        if (!this.master || !this.preset) return;
        const g = this.master.gain;
        g.cancelScheduledValues(this.ctx.currentTime);
        g.setTargetAtTime(Math.pow(v / 100, 1.5) * 1.6, this.ctx.currentTime, 0.05);
    }
};

/* --- Збереження власного файлу (IndexedDB, бо файл завеликий для localStorage) --- */
function musicDb() {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open('germanTrainerMusic', 1);
        req.onupgradeneeded = () => req.result.createObjectStore('files');
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

async function saveMusicFile(file) {
    const db = await musicDb();
    return new Promise((resolve, reject) => {
        const tx = db.transaction('files', 'readwrite');
        tx.objectStore('files').put(file, 'custom');
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error);
    });
}

async function loadMusicFile() {
    const db = await musicDb();
    return new Promise((resolve) => {
        const req = db.transaction('files').objectStore('files').get('custom');
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => resolve(null);
    });
}

/* --- Налаштування --- */
let musicSettings = { enabled: false, volume: 40, currentTrack: 'calm', customUrl: '', fileName: '' };
try {
    Object.assign(musicSettings, JSON.parse(localStorage.getItem('musicSettings')) || {});
} catch (e) { /* пошкоджені налаштування — беремо стандартні */ }
// Перехід зі старих назв треків
musicSettings.currentTrack = { lofi: 'calm', classical: 'piano', custom: 'url', '': 'calm' }[musicSettings.currentTrack]
    ?? musicSettings.currentTrack;

let backgroundMusic = null;   // <audio> для файлу або посилання
let musicFileUrl = null;      // object URL для файлу з пристрою
let musicPausedForMic = false;
let musicPlayId = 0;          // щоб старий запуск не перебив новий

function saveMusicSettings() {
    try { localStorage.setItem('musicSettings', JSON.stringify(musicSettings)); } catch (e) {}
}

function setMusicStatus(text, kind = '') {
    const el = document.getElementById('musicStatus');
    if (!el) return;
    el.textContent = text;
    el.className = 'music-status' + (kind ? ' ' + kind : '');
}

// Google Drive / Dropbox дають сторінку перегляду, а не сам файл — перетворюємо на пряме посилання
function toDirectAudioUrl(url) {
    try {
        const u = new URL(url);
        if (!/^https?:$/.test(u.protocol)) return null;
        if (u.hostname.includes('drive.google.com')) {
            const id = u.pathname.match(/\/d\/([^/]+)/)?.[1] || u.searchParams.get('id');
            if (id) return `https://drive.google.com/uc?export=download&id=${id}`;
        }
        if (u.hostname.includes('dropbox.com')) {
            u.searchParams.delete('dl');
            u.searchParams.set('raw', '1');
            return u.toString();
        }
        return u.toString();
    } catch (e) {
        return null;
    }
}

const TRACK_NAMES = { calm: 'Спокійні акорди', ambient: 'Ембієнт', piano: 'Піаніно-арпеджіо' };

// Браузери не дозволяють вмикати звук, поки людина не торкнулась сторінки
let waitingForGesture = false;
function playAfterFirstGesture() {
    setMusicStatus('⏳ Музика почне грати після першого натискання на сторінці (так вимагає браузер).', 'wait');
    if (waitingForGesture) return;
    waitingForGesture = true;
    const resume = () => {
        waitingForGesture = false;
        document.removeEventListener('pointerdown', resume, true);
        document.removeEventListener('keydown', resume, true);
        if (musicSettings.enabled) playMusic();
    };
    document.addEventListener('pointerdown', resume, true);
    document.addEventListener('keydown', resume, true);
}

async function playMusic() {
    const id = ++musicPlayId;
    stopMusic(true);
    if (!musicSettings.enabled) return;
    const track = musicSettings.currentTrack;

    if (MusicSynth.presets[track]) {
        if (!MusicSynth.start(track, musicSettings.volume)) {
            setMusicStatus('⚠️ Цей браузер не підтримує вбудовану музику.', 'error');
            return;
        }
        try { await MusicSynth.ctx.resume(); } catch (e) {}
        if (id !== musicPlayId) return;
        if (MusicSynth.ctx.state !== 'running') {
            playAfterFirstGesture();
            return;
        }
        setMusicStatus(`▶️ Грає: ${TRACK_NAMES[track]}`, 'ok');
        return;
    }

    let src = null;
    let label = '';
    if (track === 'file') {
        const file = await loadMusicFile().catch(() => null);
        if (id !== musicPlayId) return;
        if (!file) {
            setMusicStatus('📁 Виберіть аудіофайл кнопкою вище.', 'wait');
            return;
        }
        if (!musicSettings.fileName && file.name) {
            musicSettings.fileName = file.name;
            saveMusicSettings();
            document.getElementById('musicFileName').textContent = file.name;
        }
        if (musicFileUrl) URL.revokeObjectURL(musicFileUrl);
        musicFileUrl = URL.createObjectURL(file);
        src = musicFileUrl;
        label = musicSettings.fileName || file.name || 'ваш файл';
    } else if (track === 'url') {
        src = toDirectAudioUrl(musicSettings.customUrl);
        if (!src) {
            setMusicStatus('🔗 Вставте посилання на MP3 і натисніть «Застосувати».', 'wait');
            return;
        }
        label = 'музика за посиланням';
    } else {
        return;
    }

    if (!backgroundMusic) {
        backgroundMusic = new Audio();
        backgroundMusic.loop = true;
        backgroundMusic.addEventListener('error', () => {
            if (!backgroundMusic.getAttribute('src')) return;
            setMusicStatus(musicSettings.currentTrack === 'url'
                ? '❌ Не вдалося відкрити посилання. Переконайтесь, що воно веде саме на аудіофайл і доступне всім.'
                : '❌ Не вдалося відтворити файл. Спробуйте інший формат (MP3, M4A, OGG).', 'error');
        });
    }
    backgroundMusic.volume = musicSettings.volume / 100;
    backgroundMusic.src = src;
    setMusicStatus('⏳ Завантаження…', 'wait');
    try {
        await backgroundMusic.play();
        if (id === musicPlayId) setMusicStatus(`▶️ Грає: ${label}`, 'ok');
    } catch (err) {
        if (id === musicPlayId && err.name === 'NotAllowedError') playAfterFirstGesture();
        // інші помилки показує обробник 'error'
    }
}

function stopMusic(silent = false) {
    MusicSynth.stop();
    if (backgroundMusic) {
        backgroundMusic.pause();
        backgroundMusic.removeAttribute('src');
        backgroundMusic.load();
    }
    if (!silent) setMusicStatus('⏸ Музика вимкнена.');
}

// Пауза на час розпізнавання голосу, щоб мікрофон не чув музику
function pauseMusicForMic(pause) {
    if (pause) {
        if (!musicSettings.enabled) return;
        musicPausedForMic = true;
        if (MusicSynth.preset) MusicSynth.ctx?.suspend();
        backgroundMusic?.pause();
    } else if (musicPausedForMic) {
        musicPausedForMic = false;
        if (MusicSynth.preset) MusicSynth.ctx?.resume();
        if (backgroundMusic?.getAttribute('src')) backgroundMusic.play().catch(() => {});
    }
}

function updateMusicUI() {
    const track = musicSettings.currentTrack;
    document.getElementById('musicToggle').checked = musicSettings.enabled;
    document.getElementById('volumeSlider').value = musicSettings.volume;
    document.getElementById('volumeValue').textContent = musicSettings.volume + '%';
    document.getElementById('musicSelect').value = track;
    document.getElementById('customMusicUrl').value = musicSettings.customUrl || '';
    document.getElementById('customMusicSection').hidden = track !== 'url';
    document.getElementById('musicFileSection').hidden = track !== 'file';
    document.getElementById('musicFileName').textContent = musicSettings.fileName || 'файл не вибрано';
}

function initMusic() {
    updateMusicUI();

    document.getElementById('musicToggle').addEventListener('change', (e) => {
        musicSettings.enabled = e.target.checked;
        saveMusicSettings();
        if (musicSettings.enabled) playMusic(); else { musicPlayId++; stopMusic(); }
    });

    document.getElementById('volumeSlider').addEventListener('input', (e) => {
        musicSettings.volume = parseInt(e.target.value, 10);
        document.getElementById('volumeValue').textContent = musicSettings.volume + '%';
        MusicSynth.setVolume(musicSettings.volume);
        if (backgroundMusic) backgroundMusic.volume = musicSettings.volume / 100;
        saveMusicSettings();
    });

    document.getElementById('musicSelect').addEventListener('change', (e) => {
        musicSettings.currentTrack = e.target.value;
        // Вибір музики одразу її вмикає — так очікує більшість людей
        musicSettings.enabled = true;
        saveMusicSettings();
        updateMusicUI();
        playMusic();
    });

    document.getElementById('addCustomMusic').addEventListener('click', () => {
        const raw = document.getElementById('customMusicUrl').value.trim();
        if (!toDirectAudioUrl(raw)) {
            setMusicStatus('⚠️ Це не схоже на посилання. Воно має починатися з https://', 'error');
            return;
        }
        musicSettings.customUrl = raw;
        musicSettings.currentTrack = 'url';
        musicSettings.enabled = true;
        saveMusicSettings();
        updateMusicUI();
        playMusic();
    });

    const fileInput = document.getElementById('musicFileInput');
    document.getElementById('musicFileBtn').addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', async () => {
        const file = fileInput.files[0];
        fileInput.value = '';
        if (!file) return;
        try {
            await saveMusicFile(file);
        } catch (e) {
            setMusicStatus('⚠️ Не вдалося зберегти файл у браузері (можливо, замало місця).', 'error');
            return;
        }
        musicSettings.fileName = file.name;
        musicSettings.currentTrack = 'file';
        musicSettings.enabled = true;
        saveMusicSettings();
        updateMusicUI();
        playMusic();
    });

    if (musicSettings.enabled) playMusic(); else setMusicStatus('⏸ Музика вимкнена.');
}

/* ===== NAVIGATION ===== */
function showMainMenu() {
    stopReading();
    stopListening();
    exitFocus();
    hideWordTooltip();
    document.getElementById('mainMenu').style.display = 'flex';
    document.getElementById('textChoice').style.display = 'none';
    document.getElementById('builtinTexts').style.display = 'none';
    document.getElementById('customTexts').style.display = 'none';
    document.getElementById('gameMode').style.display = 'none';
    document.getElementById('settingsMode').style.display = 'none';
}

function showMode(mode) {
    stopReading();
    exitFocus();
    hideWordTooltip();
    document.getElementById('mainMenu').style.display = 'none';
    document.getElementById('textChoice').style.display = 'none';
    document.getElementById('builtinTexts').style.display = 'none';
    document.getElementById('customTexts').style.display = 'none';
    document.getElementById('gameMode').style.display = 'none';
    document.getElementById('settingsMode').style.display = 'none';

    if (mode === 'textChoice') {
        document.getElementById('textChoice').style.display = 'flex';
    } else if (mode === 'builtinTexts') {
        document.getElementById('builtinTexts').style.display = 'flex';
        loadBuiltinTexts();
    } else if (mode === 'customTexts') {
        document.getElementById('customTexts').style.display = 'flex';
        renderTree();
    } else if (mode === 'game') {
        document.getElementById('gameMode').style.display = 'flex';
        showGameSettings();
    } else if (mode === 'settings') {
        document.getElementById('settingsMode').style.display = 'flex';
    }
}

/* ===== BUILTIN TEXTS ===== */
function loadBuiltinTexts() {
    const list = document.getElementById('builtinTextList');
    list.innerHTML = '';

    builtinTexts.forEach(text => {
        const li = document.createElement('li');
        li.textContent = text.title;
        li.onclick = () => showBuiltinText(text, li);
        list.appendChild(li);
    });

    if (builtinTexts.length > 0) {
        showBuiltinText(builtinTexts[0], list.firstElementChild);
    }
}

function showBuiltinText(text, li) {
    stopReading();
    document.querySelectorAll('#builtinTextList li').forEach(el => el.classList.remove('active'));
    li?.classList.add('active');

    document.getElementById('builtinTitle').textContent = text.title;
    builtinReader.setContent(text.content, 0);
}

/* ===== ПАРСИНГ ТЕКСТУ ===== */
// Формати: слово[переклад|читання], слово[переклад], {фраза з кількох слів}[переклад|читання]
function parseAnnotated(content) {
    const tokens = [];
    const re = /\{([^{}\[\]]+)\}\s*\[([^\[\]]*)\]|([\p{L}\p{M}\p{N}'’\-]+)\s*\[([^\[\]]*)\]/gu;
    let last = 0;
    let m;
    while ((m = re.exec(content)) !== null) {
        if (m.index > last) tokens.push({ type: 'text', text: content.slice(last, m.index) });
        const word = (m[1] ?? m[3]).trim();
        const [translation = '', reading = ''] = (m[2] ?? m[4]).split('|');
        tokens.push({ type: 'word', word, translation: translation.trim(), reading: reading.trim() });
        last = re.lastIndex;
    }
    if (last < content.length) tokens.push({ type: 'text', text: content.slice(last) });
    return tokens;
}

/* ===== ПОДІЛ НА СТОРІНКИ ===== */
// На телефоні сторінки коротші, щоб не доводилось довго гортати
function wordsPerPage() {
    return window.innerWidth < 600 ? 90 : 160;
}

function countPlainWords(text) {
    return (text.match(/[\p{L}\p{N}]+/gu) || []).length;
}

// Ділить токени на сторінки, намагаючись різати по кінцю речення або абзацу
function paginate(tokens, limit) {
    const pages = [[]];
    let count = 0;
    const newPage = () => { pages.push([]); count = 0; };

    tokens.forEach(t => {
        let page = pages[pages.length - 1];
        if (t.type === 'word') {
            if (count >= limit * 1.5) { newPage(); page = pages[pages.length - 1]; }
            page.push(t);
            count++;
            return;
        }
        let text = t.text;
        while (text) {
            const words = countPlainWords(text);
            if (count + words < limit) {
                page.push({ type: 'text', text });
                count += words;
                return;
            }
            // Шукаємо межу речення/абзацу в цьому шматку тексту
            const re = /\n+|[.!?…]+["»”)]?\s+/g;
            let cut = -1, m;
            while ((m = re.exec(text)) !== null) {
                const before = countPlainWords(text.slice(0, m.index));
                cut = m.index + m[0].length;
                if (count + before >= limit) break;
            }
            if (cut === -1) {
                page.push({ type: 'text', text });
                count += words;
                return;
            }
            page.push({ type: 'text', text: text.slice(0, cut).replace(/\s+$/, '') });
            newPage();
            page = pages[pages.length - 1];
            text = text.slice(cut);
        }
    });

    return pages.filter((p, i) => i === 0 || p.some(t => t.type === 'word' || t.text.trim()));
}

/* ===== ЧИТАЛКА ЗІ СТОРІНКАМИ ===== */
class PagedReader {
    constructor(textEl, pagerEl, onPageChange) {
        this.textEl = textEl;
        this.pagerEl = pagerEl;
        this.onPageChange = onPageChange;
        this.content = '';
        this.pages = [[]];
        this.page = 0;

        pagerEl.querySelector('[data-page="prev"]').addEventListener('click', () => this.go(this.page - 1));
        pagerEl.querySelector('[data-page="next"]').addEventListener('click', () => this.go(this.page + 1));
        this.initSwipe();
    }

    setContent(content, page = 0) {
        this.content = content || '';
        this.pages = paginate(parseAnnotated(this.content), wordsPerPage());
        this.page = Math.max(0, Math.min(page, this.pages.length - 1));
        this.render();
    }

    repaginate() {
        // Після зміни розміру екрана зберігаємо приблизну позицію в тексті
        const ratio = this.pages.length > 1 ? this.page / (this.pages.length - 1) : 0;
        this.pages = paginate(parseAnnotated(this.content), wordsPerPage());
        this.page = Math.round(ratio * (this.pages.length - 1));
        this.render();
    }

    go(page, keepReading = false) {
        if (page < 0 || page >= this.pages.length || page === this.page) return false;
        if (!keepReading) stopReading();
        this.page = page;
        this.render();
        this.textEl.closest('.reader-card')?.scrollTo({ top: 0 });
        this.textEl.closest('.reader-card')?.scrollIntoView({ block: 'nearest' });
        return true;
    }

    render() {
        hideWordTooltip();
        renderTokens(this.content ? this.pages[this.page] : [], this.textEl);
        const total = this.pages.length;
        this.pagerEl.hidden = total <= 1;
        this.pagerEl.querySelector('.pager-info').textContent = `Сторінка ${this.page + 1} з ${total}`;
        this.pagerEl.querySelector('[data-page="prev"]').disabled = this.page === 0;
        this.pagerEl.querySelector('[data-page="next"]').disabled = this.page >= total - 1;
        this.onPageChange?.(this.page);
    }

    currentTokens() {
        return this.pages[this.page] || [];
    }

    initSwipe() {
        const card = this.textEl.closest('.reader-card');
        let x0 = null, y0 = null;
        card.addEventListener('touchstart', (e) => {
            x0 = e.touches[0].clientX;
            y0 = e.touches[0].clientY;
        }, { passive: true });
        card.addEventListener('touchend', (e) => {
            if (x0 === null) return;
            const dx = e.changedTouches[0].clientX - x0;
            const dy = e.changedTouches[0].clientY - y0;
            x0 = null;
            if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
                this.go(this.page + (dx < 0 ? 1 : -1));
            }
        });
    }
}

let builtinReader, customReader;

function activeReader() {
    if (document.getElementById('customTexts').style.display !== 'none') return customReader;
    if (document.getElementById('builtinTexts').style.display !== 'none') return builtinReader;
    return null;
}

function renderAnnotatedText(content, container) {
    renderTokens(content ? parseAnnotated(content) : [], container);
}

function renderTokens(tokens, container) {
    container.innerHTML = '';

    tokens.forEach(t => {
        if (t.type === 'text') {
            container.appendChild(document.createTextNode(t.text));
            return;
        }
        const span = document.createElement('span');
        span.className = 'word';
        span.tabIndex = 0;

        const w = document.createElement('span');
        w.className = 'w';
        w.textContent = t.word;
        span.appendChild(w);

        if (t.translation) {
            const tr = document.createElement('span');
            tr.className = 'tr';
            tr.textContent = t.translation;
            span.appendChild(tr);
        }

        const activate = (e) => {
            e.stopPropagation();
            showWordTooltip(span, t.translation, t.reading);
            speakGerman(t.word);
        };
        span.addEventListener('click', activate);
        span.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(e); }
        });

        container.appendChild(span);
    });
}

function hideWordTooltip() {
    document.getElementById('wordTooltip')?.remove();
    document.querySelectorAll('.word.selected').forEach(el => el.classList.remove('selected'));
}

function showWordTooltip(element, translation, reading) {
    hideWordTooltip();
    element.classList.add('selected');

    const tip = document.createElement('div');
    tip.id = 'wordTooltip';
    const tr = document.createElement('div');
    tr.className = 'tip-translation';
    tr.textContent = translation || '—';
    tip.appendChild(tr);
    if (reading) {
        const rd = document.createElement('div');
        rd.className = 'tip-reading';
        rd.textContent = '[' + reading + ']';
        tip.appendChild(rd);
    }
    document.body.appendChild(tip);

    // Розміщуємо над словом, не виходячи за межі екрана
    const rect = element.getBoundingClientRect();
    const tipRect = tip.getBoundingClientRect();
    let left = rect.left + rect.width / 2 - tipRect.width / 2;
    left = Math.max(8, Math.min(left, window.innerWidth - tipRect.width - 8));
    let top = rect.top - tipRect.height - 10;
    if (top < 8) {
        top = rect.bottom + 10;
        tip.classList.add('below');
    }
    tip.style.left = left + 'px';
    tip.style.top = top + 'px';
}

document.addEventListener('click', hideWordTooltip);
document.addEventListener('scroll', hideWordTooltip, true);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') hideWordTooltip(); });

/* ===== НАЛАШТУВАННЯ ЧИТАННЯ ===== */
let readerSettings = { size: 20, theme: 'light', showTranslations: false, rate: 0.8 };
try {
    Object.assign(readerSettings, JSON.parse(localStorage.getItem('readerSettings')) || {});
} catch (e) { /* ігноруємо пошкоджені налаштування */ }

function applyReaderSettings() {
    const root = document.documentElement;
    root.style.setProperty('--reader-size', readerSettings.size + 'px');
    root.dataset.readerTheme = readerSettings.theme;
    document.body.classList.toggle('show-tr', readerSettings.showTranslations);

    document.querySelectorAll('.theme-dot').forEach(b =>
        b.classList.toggle('active', b.dataset.themeSet === readerSettings.theme));
    document.querySelectorAll('[data-reader="translations"]').forEach(b =>
        b.classList.toggle('active', readerSettings.showTranslations));
    document.querySelectorAll('select[data-reader="rate"]').forEach(s =>
        s.value = String(readerSettings.rate));
    try { localStorage.setItem('readerSettings', JSON.stringify(readerSettings)); } catch (e) {}
}

function initReaderToolbar() {
    document.querySelectorAll('[data-reader="smaller"]').forEach(b => b.addEventListener('click', () => {
        readerSettings.size = Math.max(14, readerSettings.size - 2);
        applyReaderSettings();
    }));
    document.querySelectorAll('[data-reader="bigger"]').forEach(b => b.addEventListener('click', () => {
        readerSettings.size = Math.min(36, readerSettings.size + 2);
        applyReaderSettings();
    }));
    document.querySelectorAll('.theme-dot').forEach(b => b.addEventListener('click', () => {
        readerSettings.theme = b.dataset.themeSet;
        applyReaderSettings();
    }));
    document.querySelectorAll('[data-reader="translations"]').forEach(b => b.addEventListener('click', () => {
        readerSettings.showTranslations = !readerSettings.showTranslations;
        applyReaderSettings();
    }));
    document.querySelectorAll('select[data-reader="rate"]').forEach(s => s.addEventListener('change', () => {
        readerSettings.rate = parseFloat(s.value);
        applyReaderSettings();
    }));

    document.getElementById('toggleEditorBtn')?.addEventListener('click', (e) => {
        const input = document.getElementById('textInput');
        const hidden = input.classList.toggle('hidden');
        e.currentTarget.classList.toggle('active', !hidden);
    });

    applyReaderSettings();
}

/* ===== CUSTOM TEXTS - VSCode Style ===== */
let data = JSON.parse(localStorage.getItem("germanTrainerData")) || {
    id: generateId(),
    type: "folder",
    name: "ROOT",
    isOpen: true,
    children: []
};

let selectedNode = null;
let draggedNode = null;

function generateId() {
    return "_" + Math.random().toString(36).substr(2, 9);
}

function save() {
    localStorage.setItem("germanTrainerData", JSON.stringify(data));
}

function findParent(current, targetId) {
    if (!current.children) return null;
    for (const child of current.children) {
        if (child.id === targetId) return current;
        const found = findParent(child, targetId);
        if (found) return found;
    }
    return null;
}

document.getElementById('toggleSidebarBtn')?.addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('collapsed');
});

function renderTree() {
    const tree = document.getElementById('folderTree');
    if (!tree) return;
    tree.innerHTML = '';
    data.children.forEach(child => {
        tree.appendChild(createTreeNode(child));
    });
}

function createTreeNode(node) {
    const li = document.createElement('li');
    li.dataset.id = node.id;
    li.draggable = true;

    if (node.type === 'folder') {
        li.classList.add('folder');
        if (node.isOpen) li.classList.add('open');
    } else {
        li.classList.add('text');
    }

    if (selectedNode?.id === node.id) {
        li.classList.add('active');
    }

    const content = document.createElement('div');
    content.className = 'item-content';

    const icon = document.createElement('span');
    icon.className = 'item-icon';

    const name = document.createElement('span');
    name.className = 'item-name';
    name.textContent = node.name;

    const actions = document.createElement('div');
    actions.className = 'item-actions';

    const renameBtn = document.createElement('button');
    renameBtn.className = 'action-btn';
    renameBtn.textContent = '✏️';
    renameBtn.title = 'Перейменувати';
    renameBtn.onclick = (e) => {
        e.stopPropagation();
        renameNode(node);
    };

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'action-btn';
    deleteBtn.textContent = '🗑️';
    deleteBtn.title = 'Видалити';
    deleteBtn.onclick = (e) => {
        e.stopPropagation();
        deleteNode(node);
    };

    actions.appendChild(renameBtn);
    actions.appendChild(deleteBtn);

    content.appendChild(icon);
    content.appendChild(name);
    li.appendChild(content);
    li.appendChild(actions);

    content.onclick = (e) => {
        e.stopPropagation();
        if (node.type === 'folder') {
            node.isOpen = !node.isOpen;
            save();
            renderTree();
        } else {
            selectNode(node);
        }
    };

    li.addEventListener('dragstart', (e) => {
        draggedNode = node;
        li.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
    });

    li.addEventListener('dragend', () => {
        li.classList.remove('dragging');
        draggedNode = null;
        document.querySelectorAll('.drop-target-inside').forEach(el => {
            el.classList.remove('drop-target-inside');
        });
    });

    li.addEventListener('dragover', (e) => {
        e.preventDefault();
        if (!draggedNode || draggedNode.id === node.id) return;

        if (node.type === 'folder') {
            li.classList.add('drop-target-inside');
        }
    });

    li.addEventListener('dragleave', () => {
        li.classList.remove('drop-target-inside');
    });

    li.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        li.classList.remove('drop-target-inside');

        if (!draggedNode || draggedNode.id === node.id) return;

        const oldParent = findParent(data, draggedNode.id);
        if (oldParent) {
            oldParent.children = oldParent.children.filter(c => c.id !== draggedNode.id);
        }

        if (node.type === 'folder') {
            node.children.push(draggedNode);
            node.isOpen = true;
        } else {
            const newParent = findParent(data, node.id) || data;
            const index = newParent.children.findIndex(c => c.id === node.id);
            newParent.children.splice(index + 1, 0, draggedNode);
        }

        save();
        renderTree();
    });

    if (node.type === 'folder' && node.children && node.children.length > 0) {
        const ul = document.createElement('ul');
        if (!node.isOpen) ul.style.display = 'none';
        node.children.forEach(child => {
            ul.appendChild(createTreeNode(child));
        });
        li.appendChild(ul);
    }

    return li;
}

function selectNode(node) {
    selectedNode = node;
    renderTree();

    if (node.type === 'text') {
        stopReading();
        const input = document.getElementById('textInput');
        if (input) input.value = node.content || '';
        customReader.setContent(node.content || '', node.lastPage || 0);

        // На телефоні ховаємо список, щоб текст був одразу перед очима
        if (window.innerWidth < 768) {
            document.getElementById('sidebar').classList.add('collapsed');
            // Готовий текст відкриваємо одразу для читання; редактор — кнопкою ✏️
            const hasText = !!(node.content || '').trim();
            input.classList.toggle('hidden', hasText);
            document.getElementById('toggleEditorBtn').classList.toggle('active', !hasText);
        }
    }
}

function renameNode(node) {
    const newName = prompt('Нова назва:', node.name);
    if (newName && newName.trim()) {
        node.name = newName.trim();
        save();
        renderTree();
    }
}

function deleteNode(node) {
    if (confirm(`Видалити "${node.name}"?`)) {
        const parent = findParent(data, node.id);
        if (parent) {
            parent.children = parent.children.filter(c => c.id !== node.id);
            if (selectedNode?.id === node.id) {
                selectedNode = null;
                const input = document.getElementById('textInput');
                if (input) input.value = '';
                customReader.setContent('');
            }
            save();
            renderTree();
        }
    }
}

document.getElementById('newFileBtn')?.addEventListener('click', () => {
    const parent = selectedNode?.type === 'folder' ? selectedNode : data;
    parent.children.push({
        id: generateId(),
        type: 'text',
        name: 'Новий файл.txt',
        content: ''
    });
    save();
    renderTree();
});

document.getElementById('newFolderBtnSidebar')?.addEventListener('click', () => {
    const parent = selectedNode?.type === 'folder' ? selectedNode : data;
    parent.children.push({
        id: generateId(),
        type: 'folder',
        name: 'Нова папка',
        isOpen: true,
        children: []
    });
    save();
    renderTree();
});

document.getElementById('collapseAllBtn')?.addEventListener('click', () => {
    function collapseAll(node) {
        if (node.type === 'folder') {
            node.isOpen = false;
            if (node.children) {
                node.children.forEach(collapseAll);
            }
        }
    }
    collapseAll(data);
    save();
    renderTree();
});

document.getElementById('textInput')?.addEventListener('input', (e) => {
    if (selectedNode && selectedNode.type === 'text') {
        selectedNode.content = e.target.value;
        selectedNode.originalContent = e.target.value;
        save();
        customReader.setContent(e.target.value, customReader.page);
    }
});

function renderCustomTextViewer(content) {
    customReader.setContent(content, 0);
}

/* ===== ЗАВАНТАЖЕННЯ ФАЙЛІВ ===== */
async function readTextFile(file) {
    const buf = await file.arrayBuffer();
    let text = new TextDecoder('utf-8').decode(buf);
    // Старі файли з Windows часто в кодуванні windows-1251
    if (text.includes('�')) {
        try { text = new TextDecoder('windows-1251').decode(buf); } catch (e) {}
    }
    return text.replace(/^﻿/, '').replace(/\r\n?/g, '\n');
}

async function importFiles(fileList) {
    const files = Array.from(fileList || []).filter(f =>
        /\.(txt|md|text)$/i.test(f.name) || f.type.startsWith('text/'));
    if (!files.length) {
        alert('Підтримуються текстові файли: .txt або .md');
        return;
    }
    const parent = selectedNode?.type === 'folder' ? selectedNode : data;
    let last = null;
    for (const file of files) {
        if (file.size > 2 * 1024 * 1024) {
            alert(`Файл "${file.name}" завеликий (максимум 2 МБ).`);
            continue;
        }
        const content = await readTextFile(file);
        last = { id: generateId(), type: 'text', name: file.name, content };
        parent.children.push(last);
    }
    if (parent !== data) parent.isOpen = true;
    try {
        save();
    } catch (e) {
        alert('Не вдалося зберегти: у браузері закінчилось місце для текстів.');
    }
    renderTree();
    if (last) selectNode(last);
}

function initFileUpload() {
    const input = document.getElementById('fileInput');
    ['uploadFileBtn', 'uploadFileBtn2'].forEach(id =>
        document.getElementById(id)?.addEventListener('click', () => input.click()));
    input.addEventListener('change', async () => {
        await importFiles(input.files);
        input.value = '';
    });

    // Перетягування файлу з комп'ютера
    const area = document.getElementById('customReaderArea');
    const hasFiles = (e) => Array.from(e.dataTransfer?.types || []).includes('Files');
    area.addEventListener('dragover', (e) => {
        if (!hasFiles(e)) return;
        e.preventDefault();
        area.classList.add('drag-over');
    });
    area.addEventListener('dragleave', (e) => {
        if (!area.contains(e.relatedTarget)) area.classList.remove('drag-over');
    });
    area.addEventListener('drop', (e) => {
        if (!hasFiles(e)) return;
        e.preventDefault();
        area.classList.remove('drag-over');
        importFiles(e.dataTransfer.files);
    });
}

/* ===== ПОВНОЕКРАННЕ ЧИТАННЯ ===== */
function enterFocus(area) {
    area.classList.add('focus-mode');
    document.body.classList.add('focus-open');
    area.requestFullscreen?.().catch(() => {}); // на iPhone не підтримується — тоді просто розгортаємо на весь екран
    activeReader()?.repaginate();
}

function exitFocus() {
    document.querySelectorAll('.focus-mode').forEach(a => a.classList.remove('focus-mode'));
    document.body.classList.remove('focus-open');
    if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
}

function initFocusMode() {
    document.querySelectorAll('[data-reader="focus"]').forEach(b => b.addEventListener('click', () =>
        enterFocus(b.closest('.reader-area'))));
    document.querySelectorAll('[data-reader="exit-focus"]').forEach(b => b.addEventListener('click', exitFocus));
    document.addEventListener('fullscreenchange', () => {
        if (!document.fullscreenElement && document.body.classList.contains('focus-open')) exitFocus();
    });
    document.addEventListener('keydown', (e) => {
        const reader = activeReader();
        if (!reader || /INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName)) return;
        if (e.key === 'ArrowRight' || e.key === 'PageDown') reader.go(reader.page + 1);
        if (e.key === 'ArrowLeft' || e.key === 'PageUp') reader.go(reader.page - 1);
        if (e.key === 'Escape') exitFocus();
    });
}

/* ===== GAME MODE ===== */
let gameState = {
    range: 99,
    mode: 'training',
    currentNumber: 0,
    attemptsLeft: 2,
    correctAnswer: '',
    answerMode: 'keyboard'
};

function showGameSettings() {
    document.getElementById('gameSettings').style.display = 'block';
    document.getElementById('gamePlay').style.display = 'none';
}

function showGamePlay() {
    document.getElementById('gameSettings').style.display = 'none';
    document.getElementById('gamePlay').style.display = 'block';
    generateNewNumber();
}

document.querySelectorAll('.range-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.range-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        gameState.range = parseInt(btn.dataset.range);
    });
});

document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        gameState.mode = btn.dataset.mode;
    });
});

document.querySelectorAll('.answer-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        if (btn.dataset.answer === 'voice' && !SpeechRec) {
            const note = document.getElementById('voiceSupportNote');
            note.hidden = false;
            note.textContent = '⚠️ Цей браузер не вміє розпізнавати голос. Спробуйте Chrome, Edge або Safari.';
            return;
        }
        document.querySelectorAll('.answer-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        gameState.answerMode = btn.dataset.answer;
    });
});

document.getElementById('startGameBtn')?.addEventListener('click', () => {
    applyAnswerMode();
    showGamePlay();
    updateGameInfo();
});

document.getElementById('backToSettingsBtn')?.addEventListener('click', () => {
    stopListening();
    showGameSettings();
});

/* ===== ВІДПОВІДЬ ГОЛОСОМ ===== */
// Використовується вбудований розпізнавач браузера (Chrome/Edge/Safari, Android, iPhone)
const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognizer = null;
let listening = false;

function applyAnswerMode() {
    const voice = gameState.answerMode === 'voice';
    document.getElementById('voiceArea').hidden = !voice;
    document.getElementById('answerInput').placeholder = voice
        ? 'Тут з’явиться те, що ви сказали…'
        : 'Введіть німецькою...';
    setVoiceStatus('Натисніть 🎤 і скажіть число німецькою');
}

function setVoiceStatus(text, kind = '') {
    const el = document.getElementById('voiceStatus');
    el.textContent = text;
    el.className = 'voice-status' + (kind ? ' ' + kind : '');
}

function setMicState(on) {
    listening = on;
    const btn = document.getElementById('micBtn');
    btn.classList.toggle('listening', on);
    btn.querySelector('.mic-label').textContent = on ? 'Слухаю… (натисніть, щоб зупинити)' : 'Сказати';
}

// Розпізнавач часто повертає цифри («42», «1.000»), тому перетворюємо їх на німецькі слова
function spokenToGerman(text) {
    let t = text.toLowerCase().trim();
    t = t.replace(/(\d)[.\s](?=\d{3}\b)/g, '$1');          // 1.000 / 1 000 → 1000
    t = t.replace(/\d+/g, d => {
        const n = parseInt(d, 10);
        return n < 10000 ? numberToGerman(n) : d;
    });
    return t.replace(/[\s\-.,!?]+/g, '');                  // zwei und vierzig → zweiundvierzig
}

function startListening() {
    if (!SpeechRec) {
        setVoiceStatus('⚠️ Цей браузер не підтримує розпізнавання голосу. Спробуйте Chrome, Edge або Safari.', 'error');
        return;
    }
    if (listening) {
        recognizer?.stop();
        return;
    }

    stopSpeaking(); // щоб розпізнавач не почув озвучку сайту
    recognizer = new SpeechRec();
    recognizer.lang = 'de-DE';
    recognizer.interimResults = true;
    recognizer.continuous = false;
    recognizer.maxAlternatives = 1;

    const input = document.getElementById('answerInput');
    let finalText = '';

    recognizer.onstart = () => {
        pauseMusicForMic(true);
        setMicState(true);
        setVoiceStatus('🔴 Говоріть…', 'active');
    };

    recognizer.onresult = (e) => {
        let interim = '';
        finalText = '';
        for (let i = 0; i < e.results.length; i++) {
            const part = e.results[i][0].transcript;
            if (e.results[i].isFinal) finalText += part; else interim += part;
        }
        const heard = (finalText + interim).trim();
        setVoiceStatus('Чую: «' + heard + '»', 'active');
        input.value = spokenToGerman(heard);
    };

    recognizer.onerror = (e) => {
        const messages = {
            'not-allowed': '🚫 Немає доступу до мікрофона. Дозвольте його в налаштуваннях браузера.',
            'service-not-allowed': '🚫 Немає доступу до мікрофона. Дозвольте його в налаштуваннях браузера.',
            'no-speech': '🤔 Нічого не почуто. Спробуйте ще раз, говоріть трохи голосніше.',
            'audio-capture': '🎤 Мікрофон не знайдено.',
            'network': '🌐 Для розпізнавання потрібен інтернет.',
        };
        if (e.error !== 'aborted') setVoiceStatus(messages[e.error] || '⚠️ Помилка розпізнавання: ' + e.error, 'error');
    };

    recognizer.onend = () => {
        pauseMusicForMic(false);
        setMicState(false);
        if (finalText.trim()) {
            setVoiceStatus('Почуто: «' + finalText.trim() + '». Перевірте текст і натисніть «Перевірити».', 'done');
            input.focus();
        } else if (document.getElementById('voiceStatus').classList.contains('active')) {
            setVoiceStatus('🤔 Нічого не почуто. Натисніть 🎤 і спробуйте ще раз.', 'error');
        }
    };

    input.value = '';
    try {
        recognizer.start();
    } catch (err) {
        setVoiceStatus('⚠️ Не вдалося увімкнути мікрофон.', 'error');
    }
}

function stopListening() {
    if (listening) recognizer?.abort();
    pauseMusicForMic(false);
    setMicState(false);
}

document.getElementById('micBtn')?.addEventListener('click', startListening);

function updateGameInfo() {
    document.getElementById('currentMode').textContent =
        gameState.mode === 'training' ? 'Тренування' : 'Виклик (2 спроби)';
    document.getElementById('currentRange').textContent = `0-${gameState.range}`;

    const attemptsInfo = document.getElementById('attemptsInfo');
    if (gameState.mode === 'challenge') {
        attemptsInfo.style.display = 'block';
        document.getElementById('attemptsLeft').textContent = gameState.attemptsLeft;
    } else {
        attemptsInfo.style.display = 'none';
    }
}

function generateNewNumber() {
    gameState.currentNumber = Math.floor(Math.random() * (gameState.range + 1));
    gameState.correctAnswer = numberToGerman(gameState.currentNumber);
    gameState.attemptsLeft = gameState.mode === 'challenge' ? 2 : 999;

    stopListening();
    if (gameState.answerMode === 'voice') setVoiceStatus('Натисніть 🎤 і скажіть число німецькою');
    document.getElementById('currentNumber').textContent = gameState.currentNumber;
    document.getElementById('answerInput').value = '';
    document.getElementById('resultArea').innerHTML = '';
    document.getElementById('resultArea').className = 'result-area';

    updateGameInfo();
}

document.getElementById('speakNumberBtn')?.addEventListener('click', () => {
    speakGerman(gameState.correctAnswer);
});

document.getElementById('checkBtn')?.addEventListener('click', checkAnswer);
document.getElementById('answerInput')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') checkAnswer();
});

function checkAnswer() {
    // Однаково приймаємо «hundert» і «einhundert», пробіли, дефіси, ß/ss та цифри
    const canon = (s) => s.toLowerCase().trim()
        .replace(/[\s\-.,!?]+/g, '')
        .replace(/ß/g, 'ss')
        .replace(/^ein(hundert|tausend)/, '$1')
        .replace(/tausendein(hundert)/, 'tausend$1');
    const userAnswer = canon(document.getElementById('answerInput').value);
    const correctAnswer = canon(gameState.correctAnswer);
    const resultArea = document.getElementById('resultArea');

    if (!userAnswer) {
        resultArea.innerHTML = '⚠️ Введіть відповідь';
        resultArea.className = 'result-area';
        return;
    }

    if (userAnswer === correctAnswer) {
        resultArea.innerHTML = `✅ Правильно!<br><strong>${gameState.correctAnswer}</strong>`;
        resultArea.className = 'result-area correct';
        speakGerman(gameState.correctAnswer);
        return;
    }

    const distance = levenshteinDistance(userAnswer, correctAnswer);

    if (distance === 1) {
        resultArea.innerHTML = `🟡 Майже правильно! (1 помилка)<br>Правильно: <strong>${gameState.correctAnswer}</strong>`;
        resultArea.className = 'result-area almost';
        speakGerman(gameState.correctAnswer);

        if (gameState.mode === 'challenge') {
            gameState.attemptsLeft--;
            updateGameInfo();
        }
    } else {
        gameState.attemptsLeft--;

        if (gameState.mode === 'training' || gameState.attemptsLeft > 0) {
            resultArea.innerHTML = `❌ Неправильно. Спробуйте ще раз!${gameState.mode === 'challenge' ? '<br>Залишилось спроб: ' + gameState.attemptsLeft : ''}`;
            resultArea.className = 'result-area incorrect';
        } else {
            resultArea.innerHTML = `❌ Неправильно.<br>Правильна відповідь: <strong>${gameState.correctAnswer}</strong>`;
            resultArea.className = 'result-area incorrect';
            speakGerman(gameState.correctAnswer);
        }

        updateGameInfo();
    }
}

document.getElementById('nextNumberBtn')?.addEventListener('click', generateNewNumber);

function levenshteinDistance(str1, str2) {
    const len1 = str1.length;
    const len2 = str2.length;
    const matrix = [];

    for (let i = 0; i <= len1; i++) {
        matrix[i] = [i];
    }

    for (let j = 0; j <= len2; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= len1; i++) {
        for (let j = 1; j <= len2; j++) {
            if (str1[i - 1] === str2[j - 1]) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }

    return matrix[len1][len2];
}

/* ===== INITIALIZATION ===== */
document.addEventListener('DOMContentLoaded', () => {
    builtinReader = new PagedReader(
        document.getElementById('builtinText'),
        document.getElementById('builtinPager'));
    customReader = new PagedReader(
        document.getElementById('customText'),
        document.getElementById('customPager'),
        (page) => {
            // Запам'ятовуємо, на якій сторінці зупинились
            if (selectedNode && selectedNode.type === 'text' && selectedNode.lastPage !== page) {
                selectedNode.lastPage = page;
                save();
            }
        });

    initMusic();
    initReaderToolbar();
    initFileUpload();
    initFocusMode();

    document.getElementById('readCustomTextBtn')?.addEventListener('click', () => readFullText(customReader));
    document.getElementById('readBuiltinTextBtn')?.addEventListener('click', () => readFullText(builtinReader));
    document.getElementById('stopCustomTextBtn')?.addEventListener('click', stopReading);
    document.getElementById('stopBuiltinTextBtn')?.addEventListener('click', stopReading);

    // Перерахунок сторінок при повороті телефона / зміні розміру вікна
    let lastLimit = wordsPerPage();
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (wordsPerPage() === lastLimit) return;
            lastLimit = wordsPerPage();
            builtinReader.repaginate();
            customReader.repaginate();
        }, 200);
    });
});

function setReadingButtons(reading) {
    ['Custom', 'Builtin'].forEach(k => {
        document.getElementById(`read${k}TextBtn`).style.display = reading ? 'none' : 'inline-block';
        document.getElementById(`stop${k}TextBtn`).style.display = reading ? 'inline-block' : 'none';
    });
}

function clearSpeakingHighlight() {
    document.querySelectorAll('.word.speaking').forEach(el => el.classList.remove('speaking'));
}

let readingSession = 0;

function stopReading() {
    readingSession++;
    stopSpeaking();
    clearSpeakingHighlight();
    setReadingButtons(false);
}

// Читає поточну сторінку, а потім автоматично переходить на наступну
function readFullText(reader) {
    if (!reader || !reader.content) return;
    speechSynthesis.cancel();
    clearSpeakingHighlight();
    const session = ++readingSession;

    // Збираємо лише німецький текст і запам'ятовуємо, де починається кожне слово
    let germanText = '';
    const offsets = [];
    reader.currentTokens().forEach(t => {
        if (t.type === 'word') {
            offsets.push(germanText.length);
            germanText += t.word;
        } else {
            germanText += t.text;
        }
    });
    const spans = Array.from(reader.textEl.querySelectorAll('.word'));

    const utterance = new SpeechSynthesisUtterance(germanText);
    utterance.lang = 'de-DE';
    utterance.rate = readerSettings.rate || 0.8;

    // Підсвічуємо слово, яке зараз читається (працює, якщо голос підтримує boundary-події)
    utterance.onboundary = (e) => {
        if (e.name && e.name !== 'word') return;
        let idx = -1;
        for (let i = 0; i < offsets.length && offsets[i] <= e.charIndex + 1; i++) idx = i;
        clearSpeakingHighlight();
        const span = spans[idx];
        if (span && e.charIndex < offsets[idx] + span.querySelector('.w').textContent.length + 1) {
            span.classList.add('speaking');
            span.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
    };

    utterance.onend = () => {
        if (session !== readingSession) return;
        clearSpeakingHighlight();
        if (reader.go(reader.page + 1, true)) {
            readFullText(reader);
        } else {
            setReadingButtons(false);
        }
    };
    utterance.onerror = () => {
        if (session !== readingSession) return;
        clearSpeakingHighlight();
        setReadingButtons(false);
    };

    setReadingButtons(true);
    speechSynthesis.speak(utterance);
}
