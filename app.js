document.addEventListener("DOMContentLoaded", () => {
    const splashScreen = document.getElementById('splash-screen');
    const appContainer = document.getElementById('app');

    // File Manager Elements
    const welcomeScreen = document.getElementById('welcome-screen');
    const dropZone = document.getElementById('drop-zone');
    const fileManager = document.getElementById('file-manager');
    const fmList = document.getElementById('fm-list');
    const fmSearch = document.getElementById('fm-search');
    const btnSelectFiles = document.getElementById('btn-select-files');
    const btnLoadFolder = document.getElementById('btn-load-folder');
    const btnFmAddFiles = document.getElementById('btn-fm-add-files');
    const btnFmLoadFolder = document.getElementById('btn-fm-load-folder');
    const videoUpload = document.getElementById('video-upload');
    const folderUpload = document.getElementById('folder-upload');
    const subUpload = document.getElementById('sub-upload');
    const welcomeFormats = document.getElementById('welcome-formats');

    // Player Elements
    const playerContainer = document.getElementById('player-container');
    const videoWrapper = document.getElementById('video-wrapper');
    const video = document.getElementById('main-video');
    const controls = document.querySelectorAll('.player-controls');

    // UI Elements
    const speedIndicator = document.getElementById('speed-indicator');
    const speedIndicatorText = document.getElementById('speed-indicator-text');
    const centerVol = document.getElementById('center-volume-indicator');
    const centerVolFill = document.getElementById('center-vol-fill');
    const centerVolText = document.getElementById('center-vol-text');
    const centerVolIcon = document.getElementById('center-vol-icon');
    let centerVolTimeout;

    const centerPPIndicator = document.getElementById('center-play-pause-indicator');
    const centerPPIcon = document.getElementById('center-pp-icon');
    let ppAnimTimeout;

    const btnPlay = document.getElementById('btn-play');
    const playIcon = document.getElementById('play-icon');
    const btnMute = document.getElementById('btn-mute');
    const muteIcon = document.getElementById('mute-icon');
    const volumeSlider = document.getElementById('volume-slider');
    const timeCurrent = document.getElementById('current-time');
    const timeDuration = document.getElementById('duration');
    const progressContainer = document.getElementById('progress-container');
    const progressFilled = document.getElementById('progress-filled');
    const progressThumb = document.querySelector('.progress-thumb');

    const thumbnailPreview = document.getElementById('thumbnail-preview');
    const previewVideo = document.getElementById('preview-video');
    const previewTime = document.getElementById('preview-time');
    let hoverTimeout;

    const btnFullscreen = document.getElementById('btn-fullscreen');
    const fullscreenIcon = document.getElementById('fullscreen-icon');
    const btnPip = document.getElementById('btn-pip');
    const btnSpeed = document.getElementById('btn-speed');
    const btnCloseVideo = document.getElementById('btn-close-video');
    const videoTitle = document.getElementById('video-title');

    // Panels
    const cropPanel = document.getElementById('crop-panel');
    const settingsPanel = document.getElementById('settings-panel');
    const btnCropMenu = document.getElementById('btn-crop-menu');
    const btnSettingsWelcome = document.getElementById('btn-welcome-settings');
    const btnSettingsPlayer = document.getElementById('btn-settings-player');
    const closePanels = document.querySelectorAll('.close-panel');
    const stopProps = document.querySelectorAll('.stop-propagation');

    const dtLeft = document.getElementById('dt-ripple-left');
    const dtRight = document.getElementById('dt-ripple-right');
    const resumeToast = document.getElementById('resume-toast');
    const resumeTimeTxt = document.getElementById('resume-time-txt');
    const btnResumeYes = document.getElementById('btn-resume-yes');
    const btnResumeNo = document.getElementById('btn-resume-no');
    const btnResumeClose = document.getElementById('btn-resume-close');
    let resumeToastTimeout = null;
    let resumeToastFadeTimeout = null;

    // Music Elements
    const musicArtBox = document.getElementById('music-art-box');
    const musicArtBg = document.getElementById('music-art-bg');
    const musicArtImg = document.getElementById('music-art-img');
    const defaultMusicIcon = document.getElementById('default-music-icon');

    // Lyrics Elements
    const btnToggleLyrics = document.getElementById('btn-toggle-lyrics');
    const lyricsContainer = document.getElementById('lyrics-container');
    const lyricsBgVideo = document.getElementById('lyrics-bg-video');
    const lyricsDisplay = document.getElementById('lyrics-display');
    const lyricsEditor = document.getElementById('lyrics-editor');
    const lyricsEmptyState = document.getElementById('lyrics-empty-state');
    const lyricsInput = document.getElementById('lyrics-input');
    const btnAddLyrics = document.getElementById('btn-add-lyrics');
    const btnSaveLyrics = document.getElementById('btn-save-lyrics');
    const btnCloseLyrics = document.getElementById('btn-close-lyrics');
    const btnEditLyrics = document.getElementById('btn-edit-lyrics');
    const btnLyricsTheme = document.getElementById('btn-lyrics-theme');
    const btnLyricsFont = document.getElementById('btn-lyrics-font');
    const lyricsFontMenu = document.getElementById('lyrics-font-menu');
    const btnLyricsBgUpload = document.getElementById('btn-lyrics-bg-upload');
    const lyricsBgUpload = document.getElementById('lyrics-bg-upload');
    const lyricsPingPongToggle = document.getElementById('setting-lyrics-ping-pong');
    const btnAutoFetchLyrics = document.getElementById('btn-auto-fetch-lyrics');
    const btnAiAlign = document.getElementById('btn-ai-align');
    const btnPreviewLyrics = document.getElementById('btn-preview-lyrics');
    const autoLyricsToggle = document.getElementById('setting-auto-lyrics');
    const btnPreviousTrack = document.getElementById('btn-previous-track');
    const btnNextTrack = document.getElementById('btn-next-track');
    const btnRepeatMode = document.getElementById('btn-repeat-mode');
    const repeatModeIcon = document.getElementById('repeat-mode-icon');

    let currentVideoURL = null, fileKey = null;
    let hideControlsTimeout;
    let pendingResumeTime = 0;
    let isAudioPlaying = false;
    let currentArtBlobUrl = null;
    let lastSavedSecond = -1; // Throttle var for localstorage

    // File Variables
    let currentFile = null;
    let currentFileHandle = null;
    let currentTags = {};
    let currentPictureData = null;
    let currentPictureFormat = null;
    let currentLyrics = null;
    let lyricsMetadataReady = true;
    let autoLyricsLookupFileKey = null;
    let customLyricsBgUrl = null;
    let pingPongTimer = null;
    let lyricsBackgroundDirection = 1;

    // Cinematic Sync Engine States
    let syncedLyricsData = [];
    let lyricCueTimes = [];
    let lastActiveLineIndex = -1;
    const lyricIdleTimeout = 10;
    const lyricHighlightLead = 0.7;

    let fmFilesMap = new Map();
    let lyricsThemes = ['theme-aesthetic', 'theme-lofi', 'theme-sans'];
    let bgVideos = ['assets/aesthetic.mp4', 'assets/lofi.mp4', 'assets/sans.mp4'];
    let currentLyricsThemeIdx = 0;
    let currentLyricsFont = 'default';

    // --- Web Worker Setup for Background AI ---
    let aiWorker = null;
    let aiWorkerAvailable = false;
    try {
        aiWorker = new Worker('worker.js', { type: 'module' });
        aiWorkerAvailable = true;
    } catch (error) {
        console.warn('AI worker could not start. Open NovaPlayer over HTTP to enable local AI.', error);
    }

    if (aiWorker) aiWorker.onmessage = (e) => {
        const { status, message } = e.data;

        if (status === 'loading' || status === 'processing') {
            btnAiAlign.innerHTML = `<span class="material-symbols-outlined">auto_fix_high</span> ${message}`;
        } else if (status === 'success_aligned') {
            lyricsInput.value = e.data.lrc;
            lyricsEditor.classList.remove('hidden');
            lyricsDisplay.classList.add('hidden');
            lyricsEmptyState.classList.add('hidden');
            alert('Your lyrics were aligned to the recognized vocal timing. Review them, then choose View / Play or Save to File.');
            resetAiAlignButton();
        } else if (status === 'error') {
            console.error(message);
            alert("Lyrics alignment failed: " + message);
            resetAiAlignButton();
        }
    };

    if (aiWorker) aiWorker.onerror = (event) => {
        aiWorkerAvailable = false;
        console.error('AI worker failed to load:', event.message);
        resetAiAlignButton();
    };

    function resetAiAlignButton() {
        btnAiAlign.innerHTML = `<span class="material-symbols-outlined">auto_fix_high</span> Sync My Text`;
        btnAiAlign.disabled = false;
    }

    setTimeout(() => {
        if (splashScreen) {
            splashScreen.style.opacity = '0';
            setTimeout(() => {
                splashScreen.classList.add('hidden');
                if (appContainer) appContainer.classList.remove('hidden');
            }, 500);
        }
    }, 1200);

    // --- Settings Setup ---
    const defaultSettings = { theme: 'dark', amoled: false, resumeAction: 'ask', doubleTapSeek: 10, spaceSpeed: 2.0, musicMode: false, lyricsTheme: 0, autoShowLyrics: true, repeatMode: 'off', lyricsPingPong: false, lyricsFont: 'default' };
    let appSettings = defaultSettings;
    try {
        const saved = localStorage.getItem('novaSettings');
        if (saved) appSettings = Object.assign({}, defaultSettings, JSON.parse(saved));
    } catch (e) { appSettings = defaultSettings; }

    function saveSettings() { try { localStorage.setItem('novaSettings', JSON.stringify(appSettings)); } catch (e) { } }

    if (!['off', 'all', 'one'].includes(appSettings.repeatMode)) appSettings.repeatMode = 'off';

    function updateRepeatModeControl() {
        const mode = appSettings.repeatMode;
        const label = mode === 'one' ? 'Repeat one' : mode === 'all' ? 'Repeat all loaded tracks' : 'Repeat off';
        repeatModeIcon.textContent = mode === 'one' ? 'repeat_one' : 'repeat';
        btnRepeatMode.dataset.tooltip = label;
        btnRepeatMode.setAttribute('aria-label', label);
        btnRepeatMode.setAttribute('aria-pressed', String(mode !== 'off'));
        btnRepeatMode.classList.toggle('repeat-off', mode === 'off');
        video.loop = mode === 'one';
    }

    updateRepeatModeControl();
    btnRepeatMode.addEventListener('click', () => {
        const modes = ['off', 'all', 'one'];
        appSettings.repeatMode = modes[(modes.indexOf(appSettings.repeatMode) + 1) % modes.length];
        saveSettings();
        updateRepeatModeControl();
        updateTrackNavigationButtons();
    });

    currentLyricsThemeIdx = appSettings.lyricsTheme || 0;
    updateLyricsTheme();
    updateLyricsFont(appSettings.lyricsFont);

    if (lyricsPingPongToggle) {
        lyricsPingPongToggle.checked = !!appSettings.lyricsPingPong;
        lyricsPingPongToggle.addEventListener('change', () => {
            appSettings.lyricsPingPong = lyricsPingPongToggle.checked;
            saveSettings();
            updateLyricsBackgroundPlayback();
        });
    }

    const amoledToggle = document.getElementById('setting-amoled');
    if (amoledToggle) {
        amoledToggle.checked = !!appSettings.amoled;
        if (appSettings.amoled) document.body.classList.add('amoled-mode');
        amoledToggle.addEventListener('change', () => {
            appSettings.amoled = amoledToggle.checked;
            appSettings.amoled ? document.body.classList.add('amoled-mode') : document.body.classList.remove('amoled-mode');
            saveSettings();
        });
    }

    const musicToggle = document.getElementById('setting-music');
    if (musicToggle) {
        musicToggle.checked = !!appSettings.musicMode;
        musicToggle.addEventListener('change', () => {
            appSettings.musicMode = musicToggle.checked;
            saveSettings();
            updateMusicSettingsUI();
        });
    }

    function updateMusicSettingsUI() {
        if (welcomeFormats) welcomeFormats.textContent = appSettings.musicMode ? 'Supports MP4, WebM, MKV, MP3, FLAC, WAV' : 'Supports MP4, WebM, MKV';
        if (videoUpload) videoUpload.accept = appSettings.musicMode ? 'video/*, audio/*' : 'video/*';
        if (folderUpload) folderUpload.accept = appSettings.musicMode ? 'video/*, audio/*' : 'video/*';
    }
    updateMusicSettingsUI();

    if (autoLyricsToggle) {
        autoLyricsToggle.checked = !!appSettings.autoShowLyrics;
        autoLyricsToggle.addEventListener('change', () => {
            appSettings.autoShowLyrics = autoLyricsToggle.checked;
            saveSettings();
            if (autoLyricsToggle.checked && !video.paused) ensureLyricsForCurrentTrack();
        });
    }

    function setupCustomSelect(id, settingKey) {
        const sel = document.getElementById(id);
        if (!sel) return;
        const selected = sel.querySelector('.select-selected');
        const items = sel.querySelector('.select-items');
        if (!selected || !items) return;

        const currentVal = (appSettings[settingKey] !== undefined) ? appSettings[settingKey].toString() : defaultSettings[settingKey].toString();
        const initItem = items.querySelector(`[data-value="${currentVal}"]`) || items.firstElementChild;
        if (initItem) selected.textContent = initItem.textContent;

        selected.addEventListener('click', (e) => {
            e.stopPropagation();
            document.querySelectorAll('.select-items').forEach(i => { if (i !== items) i.classList.add('hidden'); });
            document.querySelectorAll('.custom-select').forEach(s => { if (s !== sel) s.classList.remove('active'); });
            items.classList.toggle('hidden');
            sel.classList.toggle('active');
        });

        items.querySelectorAll('div').forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                selected.textContent = item.textContent;
                items.classList.add('hidden');
                sel.classList.remove('active');

                let val = item.getAttribute('data-value');
                appSettings[settingKey] = (isNaN(val) || val === '' || settingKey === 'theme' || settingKey === 'resumeAction') ? val : parseFloat(val);
                saveSettings();
                if (settingKey === 'theme') document.documentElement.setAttribute('data-theme', val);
            });
        });
    }

    setupCustomSelect('select-theme', 'theme');
    setupCustomSelect('select-resume', 'resumeAction');
    setupCustomSelect('select-dt', 'doubleTapSeek');
    document.documentElement.setAttribute('data-theme', appSettings.theme || 'dark');

    document.addEventListener('click', () => {
        document.querySelectorAll('.select-items').forEach(el => el.classList.add('hidden'));
        document.querySelectorAll('.custom-select').forEach(el => el.classList.remove('active'));
    });

    stopProps.forEach(el => {
        ['click', 'dblclick', 'pointerdown', 'pointerup', 'wheel'].forEach(evt => { el.addEventListener(evt, e => e.stopPropagation()); });
    });
    controls.forEach(c => {
        ['click', 'dblclick', 'pointerdown'].forEach(evt => { c.addEventListener(evt, e => e.stopPropagation()); });
    });

    function toggleSettingsPanel(e) {
        e.stopPropagation();
        const isHidden = settingsPanel.classList.contains('hidden');
        closeAllPanels();
        if (isHidden) settingsPanel.classList.remove('hidden');
    }
    if (btnSettingsWelcome) btnSettingsWelcome.addEventListener('click', toggleSettingsPanel);
    if (btnSettingsPlayer) btnSettingsPlayer.addEventListener('click', toggleSettingsPanel);

    // --- File & Folder Manager Setup ---
    function formatBytes(bytes, decimals = 2) {
        if (!+bytes) return '0 Bytes';
        const k = 1024, dm = decimals < 0 ? 0 : decimals, sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
    }

    function renderFileManagerList() {
        dropZone.classList.add('hidden');
        fileManager.classList.remove('hidden');
        fmList.innerHTML = '';
        fmSearch.value = '';

        if (fmFilesMap.size === 0) {
            updateTrackNavigationButtons();
            alert("No valid media files found.");
            dropZone.classList.remove('hidden');
            fileManager.classList.add('hidden');
            return;
        }

        const fragment = document.createDocumentFragment();
        fmFilesMap.forEach((data, id) => {
            const { file, handle } = data;
            const isAudio = file.type.startsWith('audio/') || file.name.endsWith('.mp3');
            const item = document.createElement('div');
            item.className = 'file-item';
            item.innerHTML = `
                <span class="material-symbols-outlined file-icon">${isAudio ? 'music_note' : 'movie'}</span>
                <div class="file-info">
                    <span class="file-name" title="${file.name}">${file.name}</span>
                    <span class="file-meta">${formatBytes(file.size)} &bull; ${isAudio ? 'Audio' : 'Video'}</span>
                </div>
            `;
            item.addEventListener('click', () => handleFile(file, handle));
            fragment.appendChild(item);
        });
        fmList.appendChild(fragment);
        updateTrackNavigationButtons();
    }

    function getPlaylistEntries() {
        return Array.from(fmFilesMap.entries()).sort((left, right) =>
            left[1].file.name.localeCompare(right[1].file.name, undefined, { numeric: true, sensitivity: 'base' })
        );
    }

    function getCurrentPlaylistIndex(entries = getPlaylistEntries()) {
        return entries.findIndex(([, item]) => item.file === currentFile ||
            (currentFile && item.file.name === currentFile.name && item.file.size === currentFile.size));
    }

    function updateTrackNavigationButtons() {
        const entries = getPlaylistEntries();
        const index = getCurrentPlaylistIndex(entries);
        const hasMultipleTracks = entries.length > 1;
        btnPreviousTrack.disabled = !hasMultipleTracks;
        btnNextTrack.disabled = !hasMultipleTracks ||
            (appSettings.repeatMode !== 'all' && index === entries.length - 1);
    }

    function navigatePlaylist(direction, fromPlaybackEnd = false) {
        const entries = getPlaylistEntries();
        const currentIndex = getCurrentPlaylistIndex(entries);
        if (entries.length < 2 || currentIndex < 0) return;

        if (direction < 0 && !fromPlaybackEnd && video.currentTime > 3) {
            video.currentTime = 0;
            return;
        }

        let nextIndex = currentIndex + direction;
        if (nextIndex < 0 || nextIndex >= entries.length) {
            if (appSettings.repeatMode === 'all') nextIndex = (nextIndex + entries.length) % entries.length;
            else if (direction < 0) {
                video.currentTime = 0;
                return;
            } else return;
        }

        const [, nextTrack] = entries[nextIndex];
        handleFile(nextTrack.file, nextTrack.handle);
    }

    function dismissResumeToast() {
        clearTimeout(resumeToastTimeout);
        clearTimeout(resumeToastFadeTimeout);
        if (resumeToast.classList.contains('hidden')) return;
        resumeToast.classList.add('fade-out');
        resumeToastFadeTimeout = setTimeout(() => {
            resumeToast.classList.add('hidden');
            resumeToast.classList.remove('fade-out');
        }, 350);
    }

    function showResumeToast() {
        clearTimeout(resumeToastTimeout);
        clearTimeout(resumeToastFadeTimeout);
        resumeToast.classList.remove('hidden', 'fade-out');
        resumeToastTimeout = setTimeout(dismissResumeToast, 5000);
    }

    async function openFilePicker() {
        if (window.showOpenFilePicker) {
            try {
                const acceptFilters = { 'video/*': ['.mp4', '.webm', '.mkv'] };
                if (appSettings.musicMode) { acceptFilters['audio/*'] = ['.mp3', '.flac', '.wav', '.m4a']; }

                const handles = await window.showOpenFilePicker({
                    multiple: true,
                    types: [{ description: 'Media Files', accept: acceptFilters }]
                });
                for (const handle of handles) {
                    const file = await handle.getFile();
                    if (file.type.startsWith('video/') || (appSettings.musicMode && (file.type.startsWith('audio/') || file.name.endsWith('.mp3')))) {
                        fmFilesMap.set(file.name + file.size, { file, handle });
                    }
                }
                renderFileManagerList();
            } catch (e) { }
        } else {
            videoUpload.click();
        }
    }

    async function openDirectoryPicker() {
        if (window.showDirectoryPicker) {
            try {
                const dirHandle = await window.showDirectoryPicker();
                for await (const entry of dirHandle.values()) {
                    if (entry.kind === 'file') {
                        const file = await entry.getFile();
                        if (file.type.startsWith('video/') || (appSettings.musicMode && (file.type.startsWith('audio/') || file.name.endsWith('.mp3')))) {
                            fmFilesMap.set(file.name + file.size, { file, handle: entry });
                        }
                    }
                }
                renderFileManagerList();
            } catch (e) { }
        } else {
            folderUpload.click();
        }
    }

    btnSelectFiles.addEventListener('click', openFilePicker);
    btnFmAddFiles.addEventListener('click', openFilePicker);
    btnLoadFolder.addEventListener('click', openDirectoryPicker);
    btnFmLoadFolder.addEventListener('click', openDirectoryPicker);

    if (videoUpload) videoUpload.addEventListener('change', e => {
        if (e.target.files.length) {
            Array.from(e.target.files).forEach(f => fmFilesMap.set(f.name + f.size, { file: f, handle: null }));
            renderFileManagerList();
        }
    });
    if (folderUpload) folderUpload.addEventListener('change', e => {
        if (e.target.files.length) {
            Array.from(e.target.files).forEach(f => fmFilesMap.set(f.name + f.size, { file: f, handle: null }));
            renderFileManagerList();
        }
    });

    if (fmSearch) {
        fmSearch.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const items = fmList.querySelectorAll('.file-item');
            items.forEach(item => {
                const fileName = item.querySelector('.file-name').textContent.toLowerCase();
                if (fileName.includes(query)) item.style.display = 'flex';
                else item.style.display = 'none';
            });
        });
    }

    function preventDefaults(e) { e.preventDefault(); e.stopPropagation(); }
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(ev => {
        if (dropZone) dropZone.addEventListener(ev, preventDefaults);
        if (fileManager) fileManager.addEventListener(ev, preventDefaults);
    });
    ['dragenter', 'dragover'].forEach(ev => dropZone && dropZone.addEventListener(ev, () => dropZone.classList.add('dragover')));
    ['dragleave', 'drop'].forEach(ev => dropZone && dropZone.addEventListener(ev, () => dropZone.classList.remove('dragover')));

    function handleDrop(e) {
        if (e.dataTransfer.files.length) {
            Array.from(e.dataTransfer.files).forEach(f => fmFilesMap.set(f.name + f.size, { file: f, handle: null }));
            renderFileManagerList();
        }
    }
    if (dropZone) dropZone.addEventListener('drop', handleDrop);
    if (fileManager) fileManager.addEventListener('drop', handleDrop);

    // --- Enhanced Cinematic Synced Lyrics Parser (.LRC / .ELRC) ---
    function parseLRC(lrcText) {
        const lines = lrcText.split('\n');
        const parsed = [];
        const lineTimeRegEx = /\[(\d{2,}):(\d{2})(?:[.:](\d{1,3}))?\]/;
        const wordTimeRegEx = /<(\d{2,}):(\d{2})(?:[.:](\d{1,3}))?>([^<]*)/g;

        lines.forEach(line => {
            const lineMatch = lineTimeRegEx.exec(line);
            if (lineMatch) {
                const minutes = parseInt(lineMatch[1]);
                const seconds = parseInt(lineMatch[2]);
                const msStr = lineMatch[3] || '0';
                const ms = parseInt(msStr) * (msStr.length === 2 ? 10 : (msStr.length === 1 ? 100 : 1));
                const timeInSeconds = (minutes * 60) + seconds + (ms / 1000);

                let cleanText = line.replace(lineTimeRegEx, '').trim();
                let words = [];
                let wordMatch;
                let hasWordSync = false;

                // Ensure word regex advances safely
                wordTimeRegEx.lastIndex = 0;
                while ((wordMatch = wordTimeRegEx.exec(cleanText)) !== null) {
                    hasWordSync = true;
                    const wM = parseInt(wordMatch[1]);
                    const wS = parseInt(wordMatch[2]);
                    const wMsStr = wordMatch[3] || '0';
                    const wMs = parseInt(wMsStr) * (wMsStr.length === 2 ? 10 : (wMsStr.length === 1 ? 100 : 1));
                    const wTime = (wM * 60) + wS + (wMs / 1000);
                    const wText = wordMatch[4].trim();
                    if (wText) words.push({ time: wTime, text: wText, element: null });
                }

                if (!hasWordSync) {
                    cleanText = cleanText.replace(/<[^>]*>/g, '').trim();
                    if (cleanText) parsed.push({ time: timeInSeconds, text: cleanText, words: null, element: null });
                } else {
                    parsed.push({ time: timeInSeconds, text: cleanText.replace(/<[^>]*>/g, '').trim(), words: words, element: null });
                }
            }
        });
        return parsed.sort((a, b) => a.time - b.time);
    }

    function renderLyricsToDisplay(text) {
        lyricsDisplay.innerHTML = '';
        syncedLyricsData = parseLRC(text);
        lyricCueTimes = syncedLyricsData.flatMap(line =>
            line.words && line.words.length ? line.words.map(word => word.time) : [line.time]
        ).sort((left, right) => left - right);
        lastActiveLineIndex = -1;

        if (syncedLyricsData.length > 0) {
            lyricsDisplay.classList.remove('static-lyrics-mode');
            syncedLyricsData.forEach((line, index) => {
                const p = document.createElement('div');
                p.className = 'lyric-line';
                p.dataset.index = index;
                p.dataset.time = line.time;

                if (line.words) {
                    line.words.forEach((word, wordIndex) => {
                        if (wordIndex) p.appendChild(document.createTextNode(' '));
                        const span = document.createElement('span');
                        span.className = 'lyric-word elrc-word';
                        span.style.setProperty('--w-idx', wordIndex);
                        span.dataset.time = word.time;
                        span.textContent = word.text;
                        p.appendChild(span);
                    });
                } else {
                    line.text.split(/\s+/).forEach((word, wordIndex) => {
                        if (wordIndex) p.appendChild(document.createTextNode(' '));
                        const span = document.createElement('span');
                        span.className = 'lyric-word';
                        span.style.setProperty('--w-idx', wordIndex);
                        span.textContent = word;
                        p.appendChild(span);
                    });
                }
                p.addEventListener('click', () => {
                    video.currentTime = line.time;
                    video.play().catch(() => { });
                });
                lyricsDisplay.appendChild(p);
                line.element = p;
            });

            let initialActiveIndex = -1;
            const currentTime = Number.isFinite(video.currentTime) ? video.currentTime : 0;
            for (let index = 0; index < syncedLyricsData.length; index++) {
                if (syncedLyricsData[index].time > currentTime) break;
                initialActiveIndex = index;
            }
            syncedLyricsData.forEach((line, index) => {
                if (index === initialActiveIndex) line.element.classList.add('active');
                else if (initialActiveIndex >= 0 && index === initialActiveIndex + 1) line.element.classList.add('next');
                else line.element.classList.add('past');
            });
            lastActiveLineIndex = initialActiveIndex;
            const latestCue = lyricCueTimes.filter(time => time <= currentTime).pop();
            const nextCue = lyricCueTimes.find(time => time > currentTime);
            const cueStartingSoon = nextCue !== undefined && nextCue - currentTime <= lyricHighlightLead;
            lyricsDisplay.classList.toggle(
                'lyrics-display-idle',
                !cueStartingSoon && (latestCue === undefined || currentTime - latestCue >= lyricIdleTimeout)
            );
        } else {
            lyricCueTimes = [];
            lyricsDisplay.classList.remove('lyrics-display-idle');
            lyricsDisplay.classList.add('static-lyrics-mode');
            const lines = text.split('\n').map(l => l.trim().replace(/\[.*?\]/g, '').replace(/<[^>]*>/g, '')).filter(l => l);
            lines.forEach(line => {
                const p = document.createElement('p');
                p.className = 'lyric-line static-lyric';
                p.textContent = line;
                lyricsDisplay.appendChild(p);
            });
        }
    }

    // --- File Handling & Meta Reading ---
    function handleFile(file, handle = null) {
        if (!file) return;
        const isVideo = file.type.startsWith('video/');
        const isAudio = file.type.startsWith('audio/') || file.name.endsWith('.mp3');

        currentFile = file;
        currentFileHandle = handle;
        isAudioPlaying = isAudio;

        currentTags = {};
        currentPictureData = null;
        currentPictureFormat = null;
        currentLyrics = null;
        lyricsMetadataReady = !(isAudio && window.jsmediatags);
        autoLyricsLookupFileKey = null;
        syncedLyricsData = [];
        lastActiveLineIndex = -1;

        if (currentVideoURL) URL.revokeObjectURL(currentVideoURL);
        if (currentArtBlobUrl) { URL.revokeObjectURL(currentArtBlobUrl); currentArtBlobUrl = null; }

        musicArtBg.style.backgroundImage = 'none';
        musicArtImg.classList.add('hidden');
        musicArtImg.src = '';
        defaultMusicIcon.classList.remove('hidden');

        currentVideoURL = URL.createObjectURL(file);
        video.src = currentVideoURL;
        fileKey = `nova_meta_${file.name}_${file.size}`;
        currentLyrics = localStorage.getItem(`${fileKey}_lyrics`) || null;
        updateTrackNavigationButtons();

        if (isAudioPlaying) {
            musicArtBox.classList.remove('hidden');
            if (btnCropMenu) btnCropMenu.style.display = 'none';

            if (window.jsmediatags) {
                window.jsmediatags.read(file, {
                    onSuccess: function (tag) {
                        const tags = tag.tags;
                        if (tags.title) currentTags.title = tags.title;
                        if (tags.artist) currentTags.artist = tags.artist;
                        if (tags.album) currentTags.album = tags.album;

                        if (tags.picture) {
                            const byteArray = new Uint8Array(tags.picture.data);
                            const blob = new Blob([byteArray], { type: tags.picture.format });
                            currentArtBlobUrl = URL.createObjectURL(blob);
                            musicArtImg.src = currentArtBlobUrl;
                            musicArtBg.style.backgroundImage = `url(${currentArtBlobUrl})`;
                            musicArtImg.classList.remove('hidden');
                            defaultMusicIcon.classList.add('hidden');
                            currentPictureData = byteArray.buffer;
                            currentPictureFormat = tags.picture.format;
                        }

                        // Favor Synced Lyrics over Unsynced
                        if (tags.lyrics) { currentLyrics = tags.lyrics.lyrics || tags.lyrics; }
                        else if (tags.USLT) { currentLyrics = tags.USLT.lyrics || tags.USLT; }
                        lyricsMetadataReady = true;
                        if (appSettings.autoShowLyrics && !video.paused) ensureLyricsForCurrentTrack();
                    },
                    onError: function () {
                        lyricsMetadataReady = true;
                        if (appSettings.autoShowLyrics && !video.paused) ensureLyricsForCurrentTrack();
                    }
                });
            }
        } else {
            musicArtBox.classList.add('hidden');
            if (btnCropMenu) btnCropMenu.style.display = 'flex';
        }

        if (previewVideo) previewVideo.src = currentVideoURL;
        if (videoTitle) videoTitle.textContent = file.name;

        dismissResumeToast();
        lyricsContainer.classList.add('hidden');

        while (video.firstChild) video.removeChild(video.firstChild);
        welcomeScreen.classList.add('hidden');
        playerContainer.classList.remove('hidden');
        resetCrop();
        video.load();

        video.onloadedmetadata = () => {
            if (timeDuration) timeDuration.textContent = formatTime(video.duration);
            const savedStr = localStorage.getItem(`resume_${fileKey}`);
            if (savedStr) {
                const savedTime = parseFloat(savedStr);
                if (savedTime > 5 && savedTime < video.duration - 5) {
                    if (appSettings.resumeAction === 'always') {
                        video.currentTime = savedTime; video.play().catch(() => { });
                    } else if (appSettings.resumeAction === 'ask') {
                        pendingResumeTime = savedTime;
                        resumeTimeTxt.textContent = formatTime(savedTime);
                        showResumeToast();
                        video.play().catch(() => { });
                    } else { video.play().catch(() => { }); }
                } else { video.play().catch(() => { }); }
            } else { video.play().catch(() => { }); }
        };
    }

    if (btnResumeYes) btnResumeYes.addEventListener('click', () => { video.currentTime = pendingResumeTime; dismissResumeToast(); });
    if (btnResumeNo) btnResumeNo.addEventListener('click', () => { video.currentTime = 0; dismissResumeToast(); });
    if (btnResumeClose) btnResumeClose.addEventListener('click', dismissResumeToast);
    if (btnCloseVideo) btnCloseVideo.addEventListener('click', () => { video.pause(); playerContainer.classList.add('hidden'); welcomeScreen.classList.remove('hidden'); });

    // --- LYRICS ENGINE & API FETCH ---
    function updateLyricsTheme() {
        lyricsContainer.classList.remove(...lyricsThemes);
        lyricsContainer.classList.add(lyricsThemes[currentLyricsThemeIdx]);

        const backgroundSource = customLyricsBgUrl || bgVideos[currentLyricsThemeIdx];
        if (lyricsBgVideo.src !== new URL(backgroundSource, document.baseURI).href) {
            lyricsBgVideo.src = backgroundSource;
        }
        updateLyricsBackgroundPlayback();

        const names = ['Aesthetic', 'Lo-Fi', 'Sans'];
        btnLyricsTheme.innerHTML = `<span class="material-symbols-outlined" style="font-size: 16px;">palette</span> Style: ${names[currentLyricsThemeIdx]}`;
    }

    function updateLyricsFont(font = appSettings.lyricsFont) {
        const fonts = ['default', 'vintage', 'typewriter', 'cursive'];
        currentLyricsFont = fonts.includes(font) ? font : 'default';
        lyricsContainer.classList.remove(...fonts.map(name => `lyrics-font-${name}`));
        lyricsContainer.classList.add(`lyrics-font-${currentLyricsFont}`);
        btnLyricsFont.dataset.tooltip = `Lyrics font: ${currentLyricsFont}`;
        lyricsFontMenu.querySelectorAll('[data-lyrics-font]').forEach(option => {
            option.setAttribute('aria-checked', String(option.dataset.lyricsFont === currentLyricsFont));
        });
    }

    function updateLyricsBackgroundPlayback() {
        clearInterval(pingPongTimer);
        pingPongTimer = null;
        lyricsBackgroundDirection = 1;
        lyricsBgVideo.pause();
        lyricsBgVideo.loop = !appSettings.lyricsPingPong;
        if (appSettings.lyricsPingPong && lyricsBgVideo.ended) lyricsBgVideo.currentTime = 0;
        lyricsBgVideo.play().catch(() => { });
    }

    lyricsBgVideo.addEventListener('ended', () => {
        if (!appSettings.lyricsPingPong || !Number.isFinite(lyricsBgVideo.duration)) return;
        lyricsBgVideo.pause();
        lyricsBackgroundDirection = -1;
        pingPongTimer = setInterval(() => {
            if (lyricsBgVideo.readyState < 2 || lyricsBgVideo.seeking) return;
            const nextTime = Math.max(0, lyricsBgVideo.currentTime - (1 / 24));
            lyricsBgVideo.currentTime = nextTime;
            if (nextTime === 0) {
                clearInterval(pingPongTimer);
                pingPongTimer = null;
                lyricsBackgroundDirection = 1;
                lyricsBgVideo.play().catch(() => { });
            }
        }, 1000 / 24);
    });

    function loadCustomLyricsBackground(file) {
        if (!file || !file.type.startsWith('video/')) {
            alert('Choose a video file for the lyrics background.');
            return;
        }
        const candidateUrl = URL.createObjectURL(file);
        const probe = document.createElement('video');
        probe.preload = 'metadata';
        probe.onloadedmetadata = () => {
            const duration = probe.duration;
            probe.removeAttribute('src');
            probe.load();
            if (!Number.isFinite(duration) || duration > 12) {
                URL.revokeObjectURL(candidateUrl);
                alert('Lyrics background videos must be 12 seconds or shorter.');
                return;
            }
            if (customLyricsBgUrl) URL.revokeObjectURL(customLyricsBgUrl);
            customLyricsBgUrl = candidateUrl;
            updateLyricsTheme();
        };
        probe.onerror = () => {
            URL.revokeObjectURL(candidateUrl);
            alert('This video could not be opened as a lyrics background.');
        };
        probe.src = candidateUrl;
    }

    btnLyricsFont.addEventListener('click', event => {
        event.stopPropagation();
        lyricsFontMenu.classList.toggle('hidden');
    });

    lyricsFontMenu.querySelectorAll('[data-lyrics-font]').forEach(option => {
        option.addEventListener('click', () => {
            appSettings.lyricsFont = option.dataset.lyricsFont;
            updateLyricsFont(appSettings.lyricsFont);
            saveSettings();
            lyricsFontMenu.classList.add('hidden');
        });
    });

    btnLyricsBgUpload.addEventListener('click', () => lyricsBgUpload.click());
    lyricsBgUpload.addEventListener('change', () => {
        loadCustomLyricsBackground(lyricsBgUpload.files[0]);
        lyricsBgUpload.value = '';
    });

    document.addEventListener('click', event => {
        if (!lyricsFontMenu.contains(event.target) && event.target !== btnLyricsFont) {
            lyricsFontMenu.classList.add('hidden');
        }
    });

    btnLyricsTheme.addEventListener('click', (e) => {
        e.stopPropagation();
        currentLyricsThemeIdx = (currentLyricsThemeIdx + 1) % lyricsThemes.length;
        appSettings.lyricsTheme = currentLyricsThemeIdx;
        saveSettings();
        updateLyricsTheme();
    });

    btnToggleLyrics.addEventListener('click', () => {
        if (!currentFile) return;
        const isHidden = lyricsContainer.classList.contains('hidden');
        if (isHidden) {
            lyricsContainer.classList.remove('hidden');

            let displayLyrics = getCurrentLyrics();

            if (displayLyrics) {
                renderLyricsToDisplay(displayLyrics);
                lyricsDisplay.classList.remove('hidden');
                lyricsEmptyState.classList.add('hidden');
                lyricsEditor.classList.add('hidden');
            } else {
                lyricsDisplay.classList.add('hidden');
                lyricsEmptyState.classList.remove('hidden');
                lyricsEditor.classList.add('hidden');
            }
        } else {
            lyricsContainer.classList.add('hidden');
        }
    });

    btnCloseLyrics.addEventListener('click', () => lyricsContainer.classList.add('hidden'));

    function getCurrentLyrics() {
        return (fileKey && localStorage.getItem(`${fileKey}_lyrics`)) || currentLyrics;
    }

    function showLyrics() {
        if (!currentFile) return;
        lyricsContainer.classList.remove('hidden');
        const text = getCurrentLyrics();
        if (text) {
            renderLyricsToDisplay(text);
            lyricsDisplay.classList.remove('hidden');
            lyricsEmptyState.classList.add('hidden');
            lyricsEditor.classList.add('hidden');
        } else {
            lyricsDisplay.classList.add('hidden');
            lyricsEmptyState.classList.remove('hidden');
            lyricsEditor.classList.add('hidden');
        }
    }

    btnPreviewLyrics.addEventListener('click', () => {
        const text = lyricsInput.value.trim();
        if (!text) return;
        renderLyricsToDisplay(text);
        lyricsEditor.classList.add('hidden');
        lyricsEmptyState.classList.add('hidden');
        lyricsDisplay.classList.remove('hidden');
    });

    btnEditLyrics.addEventListener('click', () => {
        lyricsDisplay.classList.add('hidden');
        lyricsEmptyState.classList.add('hidden');
        lyricsEditor.classList.remove('hidden');
        lyricsInput.value = getCurrentLyrics() || '';
        lyricsInput.focus();
    });

    btnAddLyrics.addEventListener('click', () => {
        lyricsEmptyState.classList.add('hidden');
        lyricsEditor.classList.remove('hidden');
        lyricsInput.value = '';
        lyricsInput.focus();
    });

    async function fetchLyricsForCurrentTrack(silent = false) {
        if (!currentFile || !fileKey) return null;
        const requestedFile = currentFile;
        const requestedFileKey = fileKey;
        const trackTitle = currentTags.title || currentFile.name.replace(/\.[^/.]+$/, '');
        const trackArtist = currentTags.artist;
        const trackDuration = Number.isFinite(video.duration) ? video.duration : null;
        if (!silent) {
            btnAutoFetchLyrics.innerHTML = `<span class="material-symbols-outlined">hourglass_empty</span> Searching...`;
            btnAutoFetchLyrics.disabled = true;
        }
        try {
            const query = trackTitle + (trackArtist ? ` ${trackArtist}` : '');
            const searchUrl = new URL('https://lrclib.net/api/search');
            searchUrl.searchParams.set('q', query);
            let data;

            for (let attempt = 0; attempt < 4; attempt++) {
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), 12000);
                try {
                    const response = await fetch(searchUrl, {
                        headers: { Accept: 'application/json' },
                        signal: controller.signal
                    });
                    if (!response.ok) {
                        const details = await response.clone().json().catch(() => null);
                        const serverMessage = details && typeof details.message === 'string' ? `: ${details.message}` : '';
                        const error = new Error(`LRCLIB responded with HTTP ${response.status}${serverMessage}.`);
                        const retryAfter = Number(response.headers.get('Retry-After'));
                        error.retryable = response.status === 429 || response.status >= 500;
                        error.retryAfter = Number.isFinite(retryAfter) ? retryAfter : null;
                        throw error;
                    }

                    data = await response.json();
                    if (!Array.isArray(data)) throw new Error('LRCLIB returned an unexpected response.');
                    break;
                } catch (error) {
                    const retryable = error.name === 'AbortError' || error instanceof TypeError || error.retryable;
                    if (attempt < 3 && retryable) {
                        const delay = error.retryAfter > 0
                            ? Math.min(error.retryAfter * 1000, 5000)
                            : Math.min(1000 * (2 ** attempt), 4000);
                        await new Promise(resolve => setTimeout(resolve, delay));
                        continue;
                    }
                    if (error.name === 'AbortError') throw new Error('The LRCLIB request timed out.');
                    throw error;
                } finally {
                    clearTimeout(timeout);
                }
            }

            if (data && data.length > 0) {
                const normalize = value => String(value || '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
                const expectedTitle = normalize(trackTitle);
                const expectedArtist = normalize(trackArtist);
                const match = data.slice().sort((left, right) => {
                    const score = item => {
                        let value = 0;
                        if (normalize(item.trackName) === expectedTitle) value += 4;
                        if (expectedArtist && normalize(item.artistName) === expectedArtist) value += 3;
                        if (trackDuration !== null && Number.isFinite(item.duration)) {
                            const difference = Math.abs(item.duration - trackDuration);
                            if (difference <= 2) value += 5;
                            else if (difference <= 5) value += 3;
                            else if (difference <= 15) value += 1;
                        }
                        if (item.syncedLyrics) value += 1;
                        return value;
                    };
                    return score(right) - score(left);
                })[0];
                const fetchedText = match.syncedLyrics || match.plainLyrics || "";
                if (fetchedText) {
                    localStorage.setItem(`${requestedFileKey}_lyrics`, fetchedText);
                    if (currentFile === requestedFile && fileKey === requestedFileKey) {
                        currentLyrics = fetchedText;
                        lyricsInput.value = fetchedText;
                        renderLyricsToDisplay(fetchedText);
                        lyricsEditor.classList.add('hidden');
                        lyricsEmptyState.classList.add('hidden');
                        lyricsDisplay.classList.remove('hidden');
                        lyricsContainer.classList.remove('hidden');
                    }
                    return fetchedText;
                } else {
                    if (!silent) alert("Match found, but no lyrics text available in database.");
                }
            } else {
                if (!silent) alert("No lyrics found online. Please paste them manually.");
            }
            return null;
        } catch (e) {
            console.error('LRCLIB search failed:', e);
            if (!silent && e instanceof TypeError) {
                const launchHint = location.protocol === 'file:' ? ' Launch Nova Player.bat to open the app over localhost.' : ' Check your internet connection and try again.';
                alert(`Could not reach LRCLIB: ${e.message}.${launchHint}`);
            } else if (!silent) {
                alert(`LRCLIB search failed: ${e.message || 'Unknown error.'}`);
            }
            return null;
        } finally {
            if (!silent) {
                btnAutoFetchLyrics.innerHTML = `<span class="material-symbols-outlined">cloud_download</span> Database Search`;
                btnAutoFetchLyrics.disabled = false;
            }
        }
    }

    function ensureLyricsForCurrentTrack() {
        if (!appSettings.autoShowLyrics || !currentFile || !lyricsMetadataReady) return;
        if (getCurrentLyrics()) {
            showLyrics();
            return;
        }
        if (autoLyricsLookupFileKey === fileKey) return;
        autoLyricsLookupFileKey = fileKey;
        fetchLyricsForCurrentTrack(true);
    }

    btnAutoFetchLyrics.addEventListener('click', () => fetchLyricsForCurrentTrack());

    btnAiAlign.addEventListener('click', async () => {
        if (!currentFile) return;
        if (!aiWorkerAvailable) {
            alert('The AI worker is unavailable. Launch NovaPlayer with Nova Player.bat or open it over HTTP; file:// blocks the local AI model.');
            return;
        }
        const userLines = lyricsInput.value.split(/\r?\n/)
            .map(line => line.replace(/^\s*\[\d{2,}:\d{2}(?:[.:]\d{1,3})?\]\s*/, '').trim())
            .filter(Boolean);
        if (!userLines.length) {
            alert('Enter or fetch the lyrics first, then use Sync My Text.');
            return;
        }

        btnAiAlign.disabled = true;
        btnAiAlign.innerHTML = `<span class="material-symbols-outlined">memory</span> Preparing Audio...`;
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
            const audioBuffer = await audioContext.decodeAudioData(await currentFile.arrayBuffer());
            const audioData = audioBuffer.getChannelData(0);
            aiWorker.postMessage({ type: 'align', audioData, userLines });
            await audioContext.close();
        } catch (error) {
            console.error(error);
            alert('Audio decode failed: ' + error.message);
            btnAiAlign.disabled = false;
            btnAiAlign.innerHTML = `<span class="material-symbols-outlined">auto_fix_high</span> Sync My Text`;
        }
    });

    // Write to file exactly in place without downloads or duplicating
    btnSaveLyrics.addEventListener('click', async () => {
        const text = lyricsInput.value.trim();
        if (!text || !currentFile) return;

        // GUARANTEE LOSSLESS FOR NON-MP3
        if (!currentFile.name.toLowerCase().endsWith('.mp3')) {
            localStorage.setItem(`${fileKey}_lyrics`, text);
            currentLyrics = text;
            lyricsEditor.classList.add('hidden');
            renderLyricsToDisplay(text);
            lyricsDisplay.classList.remove('hidden');
            alert(`Lyrics saved losslessly via Nova Meta-Ledger.\n\n(Direct binary injection is reserved for .mp3. Since this is a ${currentFile.name.split('.').pop().toUpperCase()} file, it was left 100% untouched to prevent corruption.)`);
            return;
        }

        if (!window.ID3Writer) {
            alert("ID3 library failed to load. Check your internet connection.");
            return;
        }

        if (!currentFileHandle || !currentFileHandle.createWritable) {
            alert("Please load the file using the 'Load Folder' or 'Select Files' buttons to enable Direct Disk Overwriting. Otherwise, the browser security sandbox blocks direct saving.");
            return;
        }

        try {
            const currentTime = video.currentTime;
            const isPaused = video.paused;

            // 1. Explicitly request User Gesture permissions
            const options = { mode: 'readwrite' };
            const permissionStatus = await currentFileHandle.queryPermission(options);

            if (permissionStatus !== 'granted') {
                const requestStatus = await currentFileHandle.requestPermission(options);
                if (requestStatus !== 'granted') {
                    alert("Write permission was denied by the browser. Cannot inject ID3 tags directly.");
                    return;
                }
            }

            // 2. Unload the video entirely to clear cached DOM lock from OS
            video.removeAttribute('src');
            video.load();
            await new Promise(r => setTimeout(r, 100)); // Release lock

            // 3. Native buffer pull (keeps user gesture intact)
            const freshFile = await currentFileHandle.getFile();
            const buffer = await freshFile.arrayBuffer();
            const writer = new window.ID3Writer(buffer);

            if (currentTags.title) writer.setFrame('TIT2', currentTags.title);
            if (currentTags.artist) writer.setFrame('TPE1', [currentTags.artist]);
            if (currentTags.album) writer.setFrame('TALB', currentTags.album);
            if (currentPictureData) {
                writer.setFrame('APIC', {
                    type: 3,
                    data: currentPictureData,
                    description: 'Cover',
                    mimeType: currentPictureFormat || 'image/jpeg'
                });
            }

            writer.setFrame('USLT', { description: '', lyrics: text });
            writer.addTag();

            // 4. Direct Overwrite
            const writable = await currentFileHandle.createWritable();
            await writable.write(writer.arrayBuffer);
            await writable.close();

            // 5. Reload seamless
            currentFile = await currentFileHandle.getFile();
            currentVideoURL = URL.createObjectURL(currentFile);
            video.src = currentVideoURL;
            video.currentTime = currentTime;
            if (!isPaused) video.play().catch(() => { });

            currentLyrics = text;
            lyricsEditor.classList.add('hidden');
            renderLyricsToDisplay(text);
            lyricsDisplay.classList.remove('hidden');

        } catch (e) {
            console.error(e);
            alert(`Error writing to file: ${e.message}`);
        }
    });

    // --- Playback Controls ---
    function togglePlay() { video.paused ? video.play() : video.pause(); }
    function showCenterPlayPause() {
        if (!centerPPIndicator || !centerPPIcon) return;
        if (centerVol) { clearTimeout(centerVolTimeout); centerVol.classList.add('hidden'); centerVol.classList.remove('fade-out'); }
        clearTimeout(ppAnimTimeout);
        centerPPIndicator.classList.remove('hidden', 'animate');
        void centerPPIndicator.offsetWidth;
        centerPPIcon.textContent = video.paused ? 'pause' : 'play_arrow';
        centerPPIndicator.classList.add('animate');
        ppAnimTimeout = setTimeout(() => centerPPIndicator.classList.add('hidden'), 1500);
    }

    if (btnPlay) btnPlay.addEventListener('click', togglePlay);
    btnPreviousTrack.addEventListener('click', () => navigatePlaylist(-1));
    btnNextTrack.addEventListener('click', () => navigatePlaylist(1));
    video.addEventListener('play', () => {
        if (playIcon) playIcon.textContent = 'pause';
        if (appSettings.autoShowLyrics) ensureLyricsForCurrentTrack();
    });
    video.addEventListener('pause', () => { if (playIcon) playIcon.textContent = 'play_arrow'; });
    video.addEventListener('ended', () => {
        if (appSettings.repeatMode === 'all') navigatePlaylist(1, true);
    });

    let wasPlayingBeforeHidden = false;
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) { wasPlayingBeforeHidden = !video.paused; }
        else if (wasPlayingBeforeHidden && video.paused) { video.play().catch(() => { }); }
    });

    let rafPending = false;
    video.addEventListener('timeupdate', () => {
        if (!rafPending && video.duration) {
            rafPending = true;
            requestAnimationFrame(() => {
                const ct = video.currentTime;
                const percent = (ct / video.duration) * 100;

                if (progressFilled) progressFilled.style.width = `${percent}%`;
                if (progressThumb) progressThumb.style.left = `${percent}%`;
                if (timeCurrent) timeCurrent.textContent = formatTime(ct);

                // --- ADVANCED KARAOKE SYNC ALGORITHM ---
                if (syncedLyricsData.length > 0 && !lyricsContainer.classList.contains('hidden')) {
                    let activeIndex = -1;

                    const syncTime = ct;

                    for (let i = 0; i < syncedLyricsData.length; i++) {
                        if (syncTime >= syncedLyricsData[i].time) {
                            activeIndex = i;
                        } else { break; }
                    }
                    let latestCue = null;
                    let nextCue = null;
                    for (const cueTime of lyricCueTimes) {
                        if (cueTime > syncTime) {
                            nextCue = cueTime;
                            break;
                        }
                        latestCue = cueTime;
                    }
                    const cueStartingSoon = nextCue !== null && nextCue - syncTime <= lyricHighlightLead;
                    lyricsDisplay.classList.toggle(
                        'lyrics-display-idle',
                        !cueStartingSoon && (latestCue === null || syncTime - latestCue >= lyricIdleTimeout)
                    );

                    if (activeIndex !== lastActiveLineIndex) {
                        syncedLyricsData.forEach((line, idx) => {
                            line.element.className = 'lyric-line';
                            if (activeIndex >= 0 && idx === activeIndex) line.element.classList.add('active');
                            else if (activeIndex >= 0 && idx === activeIndex + 1) line.element.classList.add('next');
                            else if (idx < activeIndex) line.element.classList.add('past');
                            else line.element.classList.add('past');
                        });
                        lastActiveLineIndex = activeIndex;
                    }

                    if (activeIndex !== -1) {
                        const activeLine = syncedLyricsData[activeIndex];
                        if (activeLine.words) {
                            const wordSpans = activeLine.element.querySelectorAll('.elrc-word');
                            activeLine.words.forEach((w, i) => {
                                if (ct >= w.time - lyricHighlightLead) {
                                    if (wordSpans[i]) wordSpans[i].classList.add('word-active');
                                } else {
                                    if (wordSpans[i]) wordSpans[i].classList.remove('word-active');
                                }
                            });
                        }
                    }
                }

                rafPending = false;
            });
        }

        const currentSecond = Math.floor(video.currentTime);
        if (fileKey && appSettings.resumeAction !== 'never' && currentSecond % 5 === 0 && currentSecond !== lastSavedSecond) {
            localStorage.setItem(`resume_${fileKey}`, video.currentTime);
            lastSavedSecond = currentSecond;
        }
    });

    let isScrubbing = false;
    function scrub(e) {
        if (!progressContainer || !video.duration) return;
        const rect = progressContainer.getBoundingClientRect();
        const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        let pos = (clientX - rect.left) / rect.width;
        pos = Math.max(0, Math.min(1, pos));
        video.currentTime = pos * video.duration;
        dismissResumeToast();
    }

    function updateThumbnail(e) {
        if (!video.duration || !thumbnailPreview) return;
        thumbnailPreview.classList.remove('hidden');
        const rect = progressContainer.getBoundingClientRect();
        const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        let pos = (clientX - rect.left) / rect.width;
        pos = Math.max(0, Math.min(1, pos));
        const previewWidth = thumbnailPreview.offsetWidth || 174;
        let leftPos = pos * rect.width;
        if (leftPos < previewWidth / 2) leftPos = previewWidth / 2;
        if (leftPos > rect.width - previewWidth / 2) leftPos = rect.width - previewWidth / 2;
        thumbnailPreview.style.left = `${leftPos}px`;
        const hoverTime = pos * video.duration;
        if (previewTime) previewTime.textContent = formatTime(hoverTime);

        if (previewVideo) {
            if (isAudioPlaying) {
                previewVideo.style.display = 'none';
            } else {
                previewVideo.style.display = 'block';
                clearTimeout(hoverTimeout);
                hoverTimeout = setTimeout(() => {
                    if (previewVideo.readyState >= 1) previewVideo.currentTime = hoverTime;
                }, 30);
            }
        }
    }

    if (progressContainer) {
        progressContainer.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            progressContainer.setPointerCapture(e.pointerId);
            isScrubbing = true;
            scrub(e);
        });
        progressContainer.addEventListener('pointerenter', () => { if (video.duration) thumbnailPreview.classList.remove('hidden'); });
        progressContainer.addEventListener('pointerleave', () => { if (!isScrubbing) thumbnailPreview.classList.add('hidden'); });
        progressContainer.addEventListener('pointermove', (e) => {
            if (isScrubbing) scrub(e);
            updateThumbnail(e);
        });
        progressContainer.addEventListener('pointerup', (e) => {
            if (isScrubbing) {
                isScrubbing = false;
                progressContainer.releasePointerCapture(e.pointerId);
                if (thumbnailPreview) thumbnailPreview.classList.add('hidden');
            }
        });
        progressContainer.addEventListener('pointercancel', (e) => {
            isScrubbing = false;
            progressContainer.releasePointerCapture(e.pointerId);
            if (thumbnailPreview) thumbnailPreview.classList.add('hidden');
        });
    }

    // --- Smart Gestures ---
    let holdTimeout, clickTimeout, seekSessionTimeout;
    let isHolding = false, isDragging = false, isPanning = false, isSeekSessionActive = false;
    let startX, startY, panX = 0, panY = 0;
    let lastTapTime = 0, lastTapRegion = null;
    let accumulatedSeek = 0, activeSeekSide = null;
    let currentSpeed = 1;

    function triggerYtRipple(side, seconds) {
        const el = side === 'left' ? dtLeft : dtRight;
        if (!el) return;
        const secLabel = el.querySelector('.dt-seconds');
        if (secLabel) secLabel.textContent = `${seconds} seconds`;
        el.classList.remove('animate'); void el.offsetWidth; el.classList.add('animate');
    }

    function handleContinuousSeek(direction, amount) {
        if (isSeekSessionActive && activeSeekSide === direction) {
            clearTimeout(seekSessionTimeout); accumulatedSeek += amount;
        } else {
            isSeekSessionActive = true; activeSeekSide = direction; accumulatedSeek = amount;
        }
        if (direction === 'left') {
            video.currentTime = Math.max(0, video.currentTime - amount);
            triggerYtRipple('left', accumulatedSeek);
        } else {
            video.currentTime = Math.min(video.duration, video.currentTime + amount);
            triggerYtRipple('right', accumulatedSeek);
        }
        seekSessionTimeout = setTimeout(() => { isSeekSessionActive = false; accumulatedSeek = 0; activeSeekSide = null; }, 1000);
        dismissResumeToast();
    }

    if (videoWrapper) {
        videoWrapper.addEventListener('wheel', (e) => {
            if (e.target.closest('.stop-propagation')) return;
            e.preventDefault();
            const step = 0.05;
            setVolumeLevel(e.deltaY < 0 ? Math.min(1, getVolumeLevel() + step) : Math.max(0, getVolumeLevel() - step));
        });

        videoWrapper.addEventListener('pointerdown', (e) => {
            if (e.button !== 0 && e.pointerType === 'mouse') return;
            if (e.target.closest('.stop-propagation')) return;

            const isPanelOpen = (!cropPanel.classList.contains('hidden') || !settingsPanel.classList.contains('hidden'));
            if (isPanelOpen) return;

            startX = e.clientX - panX; startY = e.clientY - panY;
            isDragging = false;

            if (zoomSlider && zoomSlider.value > 1 && !isAudioPlaying) { isPanning = true; return; }

            holdTimeout = setTimeout(() => {
                isHolding = true; video.playbackRate = appSettings.spaceSpeed || 2.0;
                if (speedIndicatorText) speedIndicatorText.textContent = `${appSettings.spaceSpeed || 2.0}x Speed`;
                if (speedIndicator) speedIndicator.classList.remove('hidden');
            }, 300);
        });
    }

    window.addEventListener('pointermove', (e) => {
        if (isPanning && !isAudioPlaying) {
            isDragging = true; panX = e.clientX - startX; panY = e.clientY - startY; updateCrop();
        } else if (holdTimeout) {
            if (Math.abs(e.clientX - (startX + panX)) > 10 || Math.abs(e.clientY - (startY + panY)) > 10) {
                clearTimeout(holdTimeout); holdTimeout = null;
            }
        }
    });

    window.addEventListener('pointerup', (e) => {
        const isPanelOpen = (!cropPanel.classList.contains('hidden') || !settingsPanel.classList.contains('hidden'));
        if (isPanelOpen) { if (videoWrapper && videoWrapper.contains(e.target) && !e.target.closest('.side-panel')) { closeAllPanels(); } return; }

        if (isPanning) { setTimeout(() => { isPanning = false; isDragging = false; }, 50); return; }
        if (isDragging) return;

        clearTimeout(holdTimeout); holdTimeout = null;

        if (isHolding) {
            isHolding = false; video.playbackRate = currentSpeed;
            if (speedIndicator) speedIndicator.classList.add('hidden');
            return;
        }

        if (!videoWrapper || !videoWrapper.contains(e.target)) return;
        if (e.target.closest('.stop-propagation')) return;

        const dtSeek = appSettings.doubleTapSeek !== undefined ? appSettings.doubleTapSeek : 10;
        const now = Date.now();
        const rect = videoWrapper.getBoundingClientRect();
        const clickX = e.clientX - rect.left;

        let tapRegion;
        if (clickX >= rect.width * 0.4 && clickX <= rect.width * 0.6) tapRegion = 'center';
        else if (clickX < rect.width * 0.4) tapRegion = 'left';
        else tapRegion = 'right';

        if (isSeekSessionActive && activeSeekSide === tapRegion && tapRegion !== 'center' && dtSeek > 0) {
            clearTimeout(clickTimeout); handleContinuousSeek(tapRegion, dtSeek);
            lastTapTime = now; lastTapRegion = tapRegion;
            return;
        }

        if (now - lastTapTime < 300 && lastTapRegion === tapRegion) {
            clearTimeout(clickTimeout);
            if (tapRegion === 'center') { toggleFullscreen(); }
            else if (dtSeek > 0) { handleContinuousSeek(tapRegion, dtSeek); }
            else { toggleFullscreen(); }
            lastTapTime = now; lastTapRegion = tapRegion;
        } else {
            lastTapTime = now; lastTapRegion = tapRegion;
            clickTimeout = setTimeout(() => { togglePlay(); showCenterPlayPause(); lastTapTime = 0; }, 300);
        }
    });

    // Volume
    function applyVolumeCurve(linear) { return Math.pow(Math.max(0, Math.min(1, linear)), 2); }
    function getVolumeLevel() { return volumeSlider ? parseFloat(volumeSlider.value) : video.volume; }
    function setVolumeLevel(level) {
        level = Math.max(0, Math.min(1, level));
        if (volumeSlider) volumeSlider.value = level;
        video.volume = applyVolumeCurve(level);
        video.muted = level === 0;
        updateVolumeIcon(level); showCenterVolume(level);
    }
    function updateVolumeIcon(level) {
        if (!muteIcon) return;
        const lvl = level !== undefined ? level : getVolumeLevel();
        if (video.muted || lvl === 0) muteIcon.textContent = 'volume_off';
        else if (lvl < 0.5) muteIcon.textContent = 'volume_down';
        else muteIcon.textContent = 'volume_up';
    }
    function showCenterVolume(level) {
        if (!centerVol) return;
        if (centerPPIndicator) { clearTimeout(ppAnimTimeout); centerPPIndicator.classList.add('hidden'); centerPPIndicator.classList.remove('animate'); }
        const lvl = level !== undefined ? level : getVolumeLevel();
        clearTimeout(centerVolTimeout);
        centerVol.classList.remove('hidden', 'fade-out');
        const pct = Math.round(lvl * 100);
        if (centerVolFill) centerVolFill.style.height = `${pct}%`;
        if (centerVolText) centerVolText.textContent = `${pct}%`;
        if (centerVolIcon) {
            if (pct === 0) centerVolIcon.textContent = 'volume_off';
            else if (pct < 50) centerVolIcon.textContent = 'volume_down';
            else centerVolIcon.textContent = 'volume_up';
        }
        centerVolTimeout = setTimeout(() => { centerVol.classList.add('fade-out'); setTimeout(() => centerVol.classList.add('hidden'), 300); }, 1000);
    }

    if (btnMute) btnMute.addEventListener('click', () => { video.muted = !video.muted; updateVolumeIcon(); showCenterVolume(); });
    if (volumeSlider) volumeSlider.addEventListener('input', (e) => { setVolumeLevel(parseFloat(e.target.value)); });

    let isVolumeScrubbing = false;
    function scrubVolume(e) {
        if (!volumeSlider) return;
        const rect = volumeSlider.getBoundingClientRect();
        const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        let pos = (clientX - rect.left) / rect.width;
        pos = Math.max(0, Math.min(1, pos));
        setVolumeLevel(pos);
    }
    if (volumeSlider) {
        volumeSlider.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            isVolumeScrubbing = true;
            volumeSlider.setPointerCapture(e.pointerId);
            scrubVolume(e);
        });
        volumeSlider.addEventListener('pointermove', (e) => { if (isVolumeScrubbing) scrubVolume(e); });
        volumeSlider.addEventListener('pointerup', (e) => {
            isVolumeScrubbing = false;
            volumeSlider.releasePointerCapture(e.pointerId);
        });
    }

    function toggleFullscreen() {
        if (!document.fullscreenElement) { playerContainer.requestFullscreen().catch(() => { }); if (fullscreenIcon) fullscreenIcon.textContent = 'fullscreen_exit'; }
        else { document.exitFullscreen(); if (fullscreenIcon) fullscreenIcon.textContent = 'fullscreen'; }
    }
    if (btnFullscreen) btnFullscreen.addEventListener('click', toggleFullscreen);
    if (btnPip) {
        if (!document.pictureInPictureEnabled) btnPip.style.display = 'none';
        btnPip.addEventListener('click', async () => { try { document.pictureInPictureElement ? await document.exitPictureInPicture() : await video.requestPictureInPicture(); } catch (e) { } });
    }

    // Crop Panel Logic
    const cropTop = document.getElementById('crop-top');
    const cropBottom = document.getElementById('crop-bottom');
    const cropLeft = document.getElementById('crop-left');
    const cropRight = document.getElementById('crop-right');
    const zoomSlider = document.getElementById('zoom-slider');
    const stretchSlider = document.getElementById('stretch-slider');

    function updateCrop() {
        if (!cropTop || !cropBottom || !cropLeft || !cropRight || !zoomSlider) return;
        video.style.clipPath = `inset(${cropTop.value}% ${cropRight.value}% ${cropBottom.value}% ${cropLeft.value}%)`;
        const stretchPct = stretchSlider ? Math.max(0, Math.min(40, parseFloat(stretchSlider.value) || 0)) : 0;
        const stretchFactor = 1 + (stretchPct / 100);
        video.style.transform = `translate(${panX}px, ${panY}px) scale(${zoomSlider.value}) scaleY(${stretchFactor})`;

        document.getElementById('crop-top-val').textContent = cropTop.value;
        document.getElementById('crop-bottom-val').textContent = cropBottom.value;
        document.getElementById('crop-left-val').textContent = cropLeft.value;
        document.getElementById('crop-right-val').textContent = cropRight.value;
        document.getElementById('zoom-slider-val').textContent = parseFloat(zoomSlider.value).toFixed(2);
        document.getElementById('stretch-slider-val').textContent = stretchPct;
    }
    [cropTop, cropBottom, cropLeft, cropRight, zoomSlider, stretchSlider].forEach(el => el && el.addEventListener('input', updateCrop));

    document.querySelectorAll('.preset-buttons button').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const p = e.target.dataset.preset;
            resetCrop();
            if (p === 'fill') video.style.objectFit = 'cover';
            else if (p === 'stretch') video.style.objectFit = 'fill';
            else if (p === '21:9') { if (cropTop) cropTop.value = 12; if (cropBottom) cropBottom.value = 12; updateCrop(); }
        });
    });

    function resetCrop() {
        if (cropTop) cropTop.value = 0; if (cropBottom) cropBottom.value = 0; if (cropLeft) cropLeft.value = 0; if (cropRight) cropRight.value = 0;
        if (zoomSlider) zoomSlider.value = 1; panX = 0; panY = 0; if (stretchSlider) stretchSlider.value = 0;
        video.style.objectFit = 'contain'; updateCrop();
    }
    const btnResetCrop = document.getElementById('btn-reset-crop');
    if (btnResetCrop) btnResetCrop.addEventListener('click', resetCrop);

    // Keybinds
    const TURBO_SPEED = 3; let isSpaceHeld = false, isFHeld = false;
    function engageHoldSpeed(rate) { isHolding = true; video.playbackRate = rate; if (speedIndicatorText) speedIndicatorText.textContent = `${rate}x Speed`; if (speedIndicator) speedIndicator.classList.remove('hidden'); }
    window.addEventListener('keydown', (e) => {
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
        if (e.code === 'Space') {
            e.preventDefault(); if (e.repeat) return;
            isSpaceHeld = true;
            if (video.readyState >= 2 && !video.paused) {
                if (isFHeld) { clearTimeout(holdTimeout); holdTimeout = null; engageHoldSpeed(TURBO_SPEED); }
                else { holdTimeout = setTimeout(() => { engageHoldSpeed(appSettings.spaceSpeed || 2.0); }, 300); }
            }
        } else if (e.code === 'KeyF') {
            if (e.repeat) return;
            isFHeld = true;
            if (isSpaceHeld && video.readyState >= 2 && !video.paused) { clearTimeout(holdTimeout); holdTimeout = null; engageHoldSpeed(TURBO_SPEED); }
            else { toggleFullscreen(); }
        } else if (e.code === 'ArrowRight') { handleContinuousSeek('right', appSettings.doubleTapSeek !== undefined ? appSettings.doubleTapSeek : 10); }
        else if (e.code === 'ArrowLeft') { handleContinuousSeek('left', appSettings.doubleTapSeek !== undefined ? appSettings.doubleTapSeek : 10); }
        else if (e.code === 'ArrowUp') { e.preventDefault(); setVolumeLevel(Math.min(1, getVolumeLevel() + 0.05)); }
        else if (e.code === 'ArrowDown') { e.preventDefault(); setVolumeLevel(Math.max(0, getVolumeLevel() - 0.05)); }
    });
    window.addEventListener('keyup', (e) => {
        if (e.code === 'Space') {
            isSpaceHeld = false; clearTimeout(holdTimeout); holdTimeout = null;
            if (isHolding) { isHolding = false; video.playbackRate = currentSpeed; if (speedIndicator) speedIndicator.classList.add('hidden'); }
            else { togglePlay(); showCenterPlayPause(); }
        } else if (e.code === 'KeyF') {
            isFHeld = false;
            if (isHolding && isSpaceHeld) { engageHoldSpeed(appSettings.spaceSpeed || 2.0); }
        }
    });

    if (btnSpeed) {
        btnSpeed.addEventListener('click', () => {
            const speeds = [1, 1.25, 1.5, 2, 3];
            currentSpeed = speeds[(speeds.indexOf(currentSpeed) + 1) % speeds.length];
            video.playbackRate = currentSpeed; btnSpeed.textContent = currentSpeed + 'x';
        });
    }

    // Auto-hide UI
    function resetHideControlsTimer() {
        controls.forEach(c => c.classList.remove('hide'));
        if (playerContainer) playerContainer.style.cursor = 'default';
        clearTimeout(hideControlsTimeout);
        hideControlsTimeout = setTimeout(() => {
            const lyricsOpen = !lyricsContainer.classList.contains('hidden');
            if (!video.paused && cropPanel.classList.contains('hidden') && settingsPanel.classList.contains('hidden') && lyricsEditor.classList.contains('hidden')) {
                controls.forEach(c => c.classList.add('hide'));
                if (playerContainer) playerContainer.style.cursor = 'none';

                if (lyricsOpen) {
                    const lh = document.querySelector('.lyrics-header');
                    if (lh) lh.style.opacity = '0';
                }
            }
        }, 3000);

        const lh = document.querySelector('.lyrics-header');
        if (lh) lh.style.opacity = '1';
    }

    if (playerContainer) { playerContainer.addEventListener('pointermove', resetHideControlsTimer); playerContainer.addEventListener('click', resetHideControlsTimer); }

    function closeAllPanels() {
        if (cropPanel) cropPanel.classList.add('hidden');
        if (settingsPanel) settingsPanel.classList.add('hidden');
        resetHideControlsTimer();
    }
    if (btnCropMenu) { btnCropMenu.addEventListener('click', (e) => { e.stopPropagation(); const h = cropPanel.classList.contains('hidden'); closeAllPanels(); if (h) cropPanel.classList.remove('hidden'); }); }
    closePanels.forEach(btn => btn.addEventListener('click', closeAllPanels));

    function formatTime(seconds) {
        if (isNaN(seconds)) return "00:00";
        const h = Math.floor(seconds / 3600), m = Math.floor((seconds % 3600) / 60), s = Math.floor(seconds % 60);
        return h > 0 ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}` : `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
});