// worker.js - Background AI Engine (Anti-Hallucination & User-Text Alignment)
import { pipeline, env } from './CDN/transformers.min.js';

env.allowLocalModels = true;
env.allowRemoteModels = false;
env.localModelPath = './CDN/';

let transcriber = null;

self.onmessage = async (e) => {
    const { type, audioData, userLines } = e.data;

    if (type === 'align') {
        try {
            if (!transcriber) {
                self.postMessage({ status: 'loading', message: 'Loading AI Model...' });
                transcriber = await pipeline('automatic-speech-recognition', 'whisper-tiny', {
                    quantized: true,
                    device: 'wasm'
                });
            }

            self.postMessage({ status: 'processing', message: 'AI is Analyzing Audio...' });

            // CRITICAL FIX: condition_on_previous_text: false prevents the endless repetition loop
            const output = await transcriber(audioData, {
                chunk_length_s: 30,
                stride_length_s: 5,
                return_timestamps: true,
                condition_on_previous_text: false,
                compression_ratio_threshold: 2.4,
                temperature: 0,
                task: 'transcribe'
            });

            self.postMessage({ status: 'processing', message: 'Aligning User Lyrics to Beats...' });
            const alignedLRC = alignUserLyricsToAI(output, userLines);
            self.postMessage({ status: 'success_aligned', lrc: alignedLRC });
        } catch (err) {
            self.postMessage({ status: 'error', message: err.message });
        }
    }
};

// Align manual lyrics to recognized words inside timestamped speech segments.
function alignUserLyricsToAI(aiOutput, userLines) {
    const result = Array.isArray(aiOutput) ? aiOutput[0] : aiOutput;
    const rawSegments = Array.isArray(result?.segments) ? result.segments : (Array.isArray(result?.chunks) ? result.chunks : []);
    const chunks = rawSegments
        .filter(segment => Array.isArray(segment.timestamp) && Number.isFinite(segment.timestamp[0]) && Number.isFinite(segment.timestamp[1]))
        .map(segment => ({ ...segment, timestamp: [Number(segment.timestamp[0]), Number(segment.timestamp[1])] }));

    if (!chunks.length) {
        const fallbackSegments = Array.isArray(result?.chunks) ? result.chunks : [];
        const fallbackChunks = fallbackSegments
            .filter(segment => Array.isArray(segment.timestamp) && Number.isFinite(segment.timestamp[0]) && Number.isFinite(segment.timestamp[1]))
            .map(segment => ({ ...segment, timestamp: [Number(segment.timestamp[0]), Number(segment.timestamp[1])] }));
        if (!fallbackChunks.length) {
            throw new Error('The speech model returned no timestamped speech segments. Try a cleaner vocal track or add manual timestamps.');
        }
        chunks.push(...fallbackChunks);
    }

    const tokenize = text => (text.toLowerCase().normalize('NFKC').match(/[\p{L}\p{N}]+/gu) || []);
    const recognizedWords = [];
    chunks.forEach(chunk => {
        const words = tokenize(chunk.text || '');
        words.forEach((word, index) => {
            recognizedWords.push({
                text: word,
                time: chunk.timestamp[0] + ((chunk.timestamp[1] - chunk.timestamp[0]) * index / Math.max(1, words.length))
            });
        });
    });

    const lyricTokens = [];
    const lineTokenRanges = userLines.map((line, lineIndex) => {
        const start = lyricTokens.length;
        tokenize(line).forEach(text => lyricTokens.push({ text, lineIndex }));
        return { start, end: lyricTokens.length };
    });

    if (!recognizedWords.length || !lyricTokens.length) throw new Error('Could not find words to align.');

    const columns = recognizedWords.length + 1;
    const table = new Uint16Array((lyricTokens.length + 1) * columns);
    for (let lyricIndex = lyricTokens.length - 1; lyricIndex >= 0; lyricIndex--) {
        for (let wordIndex = recognizedWords.length - 1; wordIndex >= 0; wordIndex--) {
            const cell = lyricIndex * columns + wordIndex;
            table[cell] = lyricTokens[lyricIndex].text === recognizedWords[wordIndex].text
                ? table[(lyricIndex + 1) * columns + wordIndex + 1] + 1
                : Math.max(table[(lyricIndex + 1) * columns + wordIndex], table[cell + 1]);
        }
    }

    const matchedTimes = new Array(lyricTokens.length);
    let lyricIndex = 0;
    let wordIndex = 0;
    while (lyricIndex < lyricTokens.length && wordIndex < recognizedWords.length) {
        if (lyricTokens[lyricIndex].text === recognizedWords[wordIndex].text) {
            matchedTimes[lyricIndex] = recognizedWords[wordIndex].time;
            lyricIndex++;
            wordIndex++;
        } else if (table[(lyricIndex + 1) * columns + wordIndex] >= table[lyricIndex * columns + wordIndex + 1]) {
            lyricIndex++;
        } else {
            wordIndex++;
        }
    }

    const firstVoice = chunks[0].timestamp[0];
    const lastVoice = chunks[chunks.length - 1].timestamp[1];
    const lineTimes = lineTokenRanges.map(range => {
        for (let index = range.start; index < range.end; index++) {
            if (matchedTimes[index] !== undefined) return matchedTimes[index];
        }
        return null;
    });

    lineTimes.forEach((time, index) => {
        if (time !== null) return;
        let previous = index - 1;
        let next = index + 1;
        while (previous >= 0 && lineTimes[previous] === null) previous--;
        while (next < lineTimes.length && lineTimes[next] === null) next++;
        if (previous >= 0 && next < lineTimes.length) {
            lineTimes[index] = lineTimes[previous] + ((lineTimes[next] - lineTimes[previous]) * (index - previous) / (next - previous));
        } else if (previous >= 0) {
            lineTimes[index] = lineTimes[previous] + ((lastVoice - lineTimes[previous]) / Math.max(1, lineTimes.length - previous));
        } else if (next < lineTimes.length) {
            lineTimes[index] = Math.max(firstVoice, lineTimes[next] - ((lineTimes[next] - firstVoice) / Math.max(1, next + 1)));
        } else {
            lineTimes[index] = firstVoice + ((lastVoice - firstVoice) * index / Math.max(1, lineTimes.length));
        }
    });

    return userLines.map((line, index) => {
        const time = Math.max(0, lineTimes[index]);
        const minutes = Math.floor(time / 60).toString().padStart(2, '0');
        const seconds = Math.floor(time % 60).toString().padStart(2, '0');
        const hundredths = Math.floor((time % 1) * 100).toString().padStart(2, '0');
        return `[${minutes}:${seconds}.${hundredths}] ${line}`;
    }).join('\n');
}