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
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'de-DE';
    utterance.rate = 0.8;
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

/* ===== BACKGROUND MUSIC SYSTEM ===== */
// ⚠️ ЯК ДОДАТИ СВОЮ МУЗИКУ:
// Додайте URL своїх MP3 файлів у об'єкт musicTracks нижче
// Формат: 'назва': 'https://your-url.com/music.mp3'

const musicTracks = {
    'lofi': '', // Додайте URL для Lofi Study
    'ambient': '', // Додайте URL для Ambient
    'classical': '', // Додайте URL для Classical
    // Приклад:
    // 'mytrack': 'https://example.com/my-music.mp3',
};

let backgroundMusic = null;
let musicSettings = JSON.parse(localStorage.getItem('musicSettings')) || {
    enabled: false,
    volume: 50,
    currentTrack: '',
    customUrl: ''
};

function initMusic() {
    backgroundMusic = new Audio();
    backgroundMusic.loop = true;
    backgroundMusic.volume = musicSettings.volume / 100;

    document.getElementById('musicToggle').checked = musicSettings.enabled;
    document.getElementById('volumeSlider').value = musicSettings.volume;
    document.getElementById('volumeValue').textContent = musicSettings.volume + '%';
    document.getElementById('musicSelect').value = musicSettings.currentTrack;
    document.getElementById('customMusicUrl').value = musicSettings.customUrl;

    if (musicSettings.enabled && (musicSettings.currentTrack || musicSettings.customUrl)) {
        playMusic();
    }
}

function playMusic() {
    if (!backgroundMusic) return;

    let url = '';
    if (musicSettings.currentTrack === 'custom' && musicSettings.customUrl) {
        url = musicSettings.customUrl;
    } else if (musicTracks[musicSettings.currentTrack]) {
        url = musicTracks[musicSettings.currentTrack];
    }

    if (url) {
        backgroundMusic.src = url;
        backgroundMusic.play().catch(err => {
            console.log('Помилка відтворення музики:', err);
        });
    }
}

function stopMusic() {
    if (backgroundMusic) {
        backgroundMusic.pause();
        backgroundMusic.currentTime = 0;
    }
}

function saveMusicSettings() {
    localStorage.setItem('musicSettings', JSON.stringify(musicSettings));
}

/* ===== NAVIGATION ===== */
function showMainMenu() {
    document.getElementById('mainMenu').style.display = 'flex';
    document.getElementById('textChoice').style.display = 'none';
    document.getElementById('builtinTexts').style.display = 'none';
    document.getElementById('customTexts').style.display = 'none';
    document.getElementById('gameMode').style.display = 'none';
    document.getElementById('settingsMode').style.display = 'none';
}

function showMode(mode) {
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
        li.onclick = () => showBuiltinText(text);
        list.appendChild(li);
    });

    if (builtinTexts.length > 0) {
        showBuiltinText(builtinTexts[0]);
    }
}

function showBuiltinText(text) {
    document.querySelectorAll('#builtinTextList li').forEach(li => li.classList.remove('active'));
    event.target.classList.add('active');

    const viewer = document.getElementById('builtinTextViewer');
    viewer.innerHTML = `<h2>${text.title}</h2>`;
    viewer.dataset.currentContent = text.content;

    renderBuiltinTextContent(text.content, viewer);
}

function renderBuiltinTextContent(content, container) {
    const regex = /([^\[\]]+?)\s*\[(.*?)\|(.*?)\]/g;
    let lastIndex = 0;
    let match;
    const words = [];

    while ((match = regex.exec(content)) !== null) {
        words.push({
            word: match[1].trim(),
            translation: match[2],
            reading: match[3],
            index: match.index,
            fullLength: match[0].length
        });
    }

    lastIndex = 0;
    words.forEach(w => {
        if (w.index > lastIndex) {
            container.appendChild(document.createTextNode(content.slice(lastIndex, w.index)));
        }

        const span = document.createElement('span');
        span.className = 'word';
        span.textContent = w.word;

        span.onclick = (e) => {
            e.stopPropagation();
            showWordTooltip(e.target, w.translation, w.reading);
            speakGerman(w.word);
        };

        container.appendChild(span);
        lastIndex = w.index + w.fullLength;
    });

    if (lastIndex < content.length) {
        container.appendChild(document.createTextNode(content.slice(lastIndex)));
    }
}

function showWordTooltip(element, translation, reading) {
    document.getElementById('wordTooltip')?.remove();

    const tip = document.createElement('div');
    tip.id = 'wordTooltip';
    tip.innerHTML = `${translation} | ${reading}`;

    const rect = element.getBoundingClientRect();
    tip.style.top = rect.top + window.scrollY - 50 + 'px';
    tip.style.left = rect.left + window.scrollX + 'px';
    document.body.appendChild(tip);

    setTimeout(() => {
        document.addEventListener('click', () => tip.remove(), { once: true });
    }, 10);
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
        const input = document.getElementById('textInput');
        const viewer = document.getElementById('textViewer');
        if (input && viewer) {
            // Показуємо оригінальний текст з форматуванням у textarea
            input.value = node.content || '';
            // Рендеримо перетворений текст у viewer
            renderCustomTextViewer(node.content || '');
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
                const viewer = document.getElementById('textViewer');
                if (input) input.value = '';
                if (viewer) viewer.innerHTML = '';
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
        console.log('Saving content:', e.target.value);
        save();
        renderCustomTextViewer(e.target.value);
    }
});

function renderCustomTextViewer(content) {
    const viewer = document.getElementById('textViewer');
    if (!viewer) {
        console.log('Viewer not found!');
        return;
    }
    viewer.innerHTML = '';
    if (!content) {
        console.log('No content!');
        return;
    }

    console.log('Rendering content:', content);

    // Змінений regex: бере всі слова (включаючи пробіли) до дужок
    const regex = /([^\[\]]+?)\s*\[(.*?)\|(.*?)\]/g;
    let lastIndex = 0;
    let match;
    const words = [];

    // Збираємо всі слова з форматуванням
    while ((match = regex.exec(content)) !== null) {
        words.push({
            word: match[1].trim(), // trim() прибирає зайві пробіли
            translation: match[2],
            reading: match[3],
            index: match.index,
            fullLength: match[0].length
        });
    }

    console.log('Found words:', words);

    // Рендеримо текст
    lastIndex = 0;
    words.forEach(w => {
        // Додаємо текст перед словом
        if (w.index > lastIndex) {
            const textBefore = content.slice(lastIndex, w.index);
            viewer.appendChild(document.createTextNode(textBefore));
        }

        // Створюємо інтерактивне слово (показуємо тільки німецьке слово)
        const span = document.createElement('span');
        span.className = 'word';
        span.textContent = w.word; // Тільки німецьке слово!
        span.onclick = (e) => {
            e.stopPropagation();
            showWordTooltip(e.target, w.translation, w.reading);
            speakGerman(w.word);
        };

        viewer.appendChild(span);
        lastIndex = w.index + w.fullLength;
    });

    // Додаємо текст після останнього слова
    if (lastIndex < content.length) {
        viewer.appendChild(document.createTextNode(content.slice(lastIndex)));
    }
}

/* ===== SETTINGS ===== */
document.getElementById('musicToggle')?.addEventListener('change', (e) => {
    musicSettings.enabled = e.target.checked;
    saveMusicSettings();

    if (musicSettings.enabled) {
        playMusic();
    } else {
        stopMusic();
    }
});

document.getElementById('volumeSlider')?.addEventListener('input', (e) => {
    musicSettings.volume = parseInt(e.target.value);
    document.getElementById('volumeValue').textContent = musicSettings.volume + '%';
    if (backgroundMusic) {
        backgroundMusic.volume = musicSettings.volume / 100;
    }
    saveMusicSettings();
});

document.getElementById('musicSelect')?.addEventListener('change', (e) => {
    musicSettings.currentTrack = e.target.value;
    saveMusicSettings();

    const customSection = document.getElementById('customMusicSection');
    if (e.target.value === 'custom') {
        customSection.style.display = 'flex';
    } else {
        customSection.style.display = 'none';
    }

    if (musicSettings.enabled) {
        stopMusic();
        playMusic();
    }
});

document.getElementById('addCustomMusic')?.addEventListener('click', () => {
    const url = document.getElementById('customMusicUrl').value.trim();
    if (url) {
        musicSettings.customUrl = url;
        musicSettings.currentTrack = 'custom';
        saveMusicSettings();
        alert('Власну музику додано! Увімкніть музику для відтворення.');

        if (musicSettings.enabled) {
            stopMusic();
            playMusic();
        }
    } else {
        alert('Будь ласка, введіть URL музики');
    }
});

/* ===== GAME MODE ===== */
let gameState = {
    range: 99,
    mode: 'training',
    currentNumber: 0,
    attemptsLeft: 2,
    correctAnswer: ''
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

document.getElementById('startGameBtn')?.addEventListener('click', () => {
    showGamePlay();
    updateGameInfo();
});

document.getElementById('backToSettingsBtn')?.addEventListener('click', () => {
    showGameSettings();
});

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
    const userAnswer = document.getElementById('answerInput').value.trim().toLowerCase();
    const correctAnswer = gameState.correctAnswer.toLowerCase();
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
    initMusic();

    // Read custom text button
    document.getElementById('readCustomTextBtn')?.addEventListener('click', () => {
        if (selectedNode && selectedNode.type === 'text' && selectedNode.content) {
            readFullText(selectedNode.content);
            document.getElementById('readCustomTextBtn').style.display = 'none';
            document.getElementById('stopCustomTextBtn').style.display = 'inline-block';
        }
    });

    // Stop custom text button
    document.getElementById('stopCustomTextBtn')?.addEventListener('click', () => {
        stopSpeaking();
        document.getElementById('readCustomTextBtn').style.display = 'inline-block';
        document.getElementById('stopCustomTextBtn').style.display = 'none';
    });

    // Read builtin text button
    document.getElementById('readBuiltinTextBtn')?.addEventListener('click', () => {
        const viewer = document.getElementById('builtinTextViewer');
        if (viewer && viewer.dataset.currentContent) {
            readFullText(viewer.dataset.currentContent);
            document.getElementById('readBuiltinTextBtn').style.display = 'none';
            document.getElementById('stopBuiltinTextBtn').style.display = 'inline-block';
        }
    });

    // Stop builtin text button
    document.getElementById('stopBuiltinTextBtn')?.addEventListener('click', () => {
        stopSpeaking();
        document.getElementById('readBuiltinTextBtn').style.display = 'inline-block';
        document.getElementById('stopBuiltinTextBtn').style.display = 'none';
    });

    // Listen for speech end to reset buttons
    speechSynthesis.addEventListener('end', () => {
        document.getElementById('readCustomTextBtn').style.display = 'inline-block';
        document.getElementById('stopCustomTextBtn').style.display = 'none';
        document.getElementById('readBuiltinTextBtn').style.display = 'inline-block';
        document.getElementById('stopBuiltinTextBtn').style.display = 'none';
    });
});

function readFullText(content) {
    // Extract only German words from the text
    const regex = /([^\[\]]+?)\s*\[(.*?)\|(.*?)\]/g;
    let germanText = content;
    let match;
    const replacements = [];

    while ((match = regex.exec(content)) !== null) {
        replacements.push({
            full: match[0],
            word: match[1].trim()
        });
    }

    // Replace formatted words with just the German word
    replacements.forEach(r => {
        germanText = germanText.replace(r.full, r.word);
    });

    // Speak the full German text
    const utterance = new SpeechSynthesisUtterance(germanText);
    utterance.lang = 'de-DE';
    utterance.rate = 0.8;

    utterance.onend = () => {
        document.getElementById('readCustomTextBtn').style.display = 'inline-block';
        document.getElementById('stopCustomTextBtn').style.display = 'none';
        document.getElementById('readBuiltinTextBtn').style.display = 'inline-block';
        document.getElementById('stopBuiltinTextBtn').style.display = 'none';
    };

    speechSynthesis.speak(utterance);
}
