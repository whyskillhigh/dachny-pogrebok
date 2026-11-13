/**
 * Дачный Погребок: Закатки на зиму
 * Модуль процедурного звука по стандарту casual-game-audio
 * Никаких примитивных пищалок: ASMR Vacuum Cork Pop, пентатоника калимбы, 
 * мягкий деревянный стук (The Soft Woody Thump), хрустальный перезвон банок.
 */

// Гармоническая мажорная пентатоника для 8 уровней плодов (C5, D5, E5, G5, A5, C6, D6, E6)
const PENTATONIC_SCALE = [
    523.25, // Tier 0: Клубничка (C5)
    587.33, // Tier 1: Огурчик (D5)
    659.25, // Tier 2: Помидорка (E5)
    783.99, // Tier 3: Наливное яблочко (G5)
    880.00, // Tier 4: Дачный кабачок (A5)
    1046.50,// Tier 5: Спелая тыква (C6)
    1174.66,// Tier 6: Банка с огурцами (D6)
    1318.51 // Tier 7: Золотая банка варенья (E6)
];

class SoundEffects {
    constructor() {
        this.ctx = null;
        this.muted = localStorage.getItem('dacha_muted') === 'true';
        this.musicMuted = localStorage.getItem('dacha_music_muted') === 'true';
        this.masterVolume = 0.75;
        this.lastThumpTime = 0;
        this.lastSoundTime = {};
        this.musicPlaying = false;
        this.musicInterval = null;
        this._adPaused = false;
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.ctx = new AudioContext();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended' && !this._adPaused) {
            this.ctx.resume().catch(() => {});
        }
    }

    pauseForAd() {
        this._adPaused = true;
        if (this.ctx && this.ctx.state === 'running' && typeof this.ctx.suspend === 'function') {
            this.ctx.suspend().catch(() => {});
        }
    }

    resumeAfterAd() {
        this._adPaused = false;
        if (this.ctx && this.ctx.state === 'suspended' && typeof this.ctx.resume === 'function') {
            this.ctx.resume().catch(() => {});
        }
    }

    toggleMute() {
        this.muted = !this.muted;
        localStorage.setItem('dacha_muted', this.muted);
        if (!this.muted) {
            this.playClick();
        }
        return this.muted;
    }

    toggleMusic() {
        this.musicMuted = !this.musicMuted;
        localStorage.setItem('dacha_music_muted', this.musicMuted);
        if (this.musicMuted) {
            this.stopAmbientMusic();
        } else {
            this.startAmbientMusic();
        }
        return this.musicMuted;
    }

    isMuted() {
        return this.muted;
    }

    isMusicMuted() {
        return this.musicMuted;
    }

    stopAmbientMusic() {
        this.musicPlaying = false;
        if (this.musicInterval) {
            clearInterval(this.musicInterval);
            this.musicInterval = null;
        }
        if (this.musicMasterGain && this.ctx) {
            const cleanup = this.musicCleanup;
            try {
                const now = this.ctx.currentTime;
                this.musicMasterGain.gain.cancelScheduledValues(now);
                this.musicMasterGain.gain.setValueAtTime(Math.max(0.0001, this.musicMasterGain.gain.value || 0.001), now);
                this.musicMasterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
            } catch (_) {}
            if (cleanup) setTimeout(cleanup, 220);
            this.musicCleanup = null;
            this.musicMasterGain = null;
            this.musicBus = null;
        }
    }

    /**
     * ДАЧНЫЙ ОРКЕСТР: «Дачный Праздник» (D major, 4/4, солнечная фолк-аниме тема урожая)
     * Голоса: звонкая мандолина/балалайка, тёплая гармоника-струнные, весёлая свирель/флейта и бодрый бас.
     */
    startAmbientMusic() {
        if (this.musicPlaying || this.musicMuted || this._adPaused) return;
        this.init();
        if (!this.ctx) return;
        this.musicPlaying = true;

        const m2f = (m) => 440 * Math.pow(2, (m - 69) / 12);

        const master = this.ctx.createGain();
        master.gain.setValueAtTime(0.56 * this.masterVolume, this.ctx.currentTime);
        const comp = this.ctx.createDynamicsCompressor();
        comp.threshold.value = -16;
        comp.ratio.value = 3;

        const dry = this.ctx.createGain();
        dry.gain.value = 0.86;

        const delay = this.ctx.createDelay(1.0);
        delay.delayTime.value = 0.24;
        const feedback = this.ctx.createGain();
        feedback.gain.value = 0.22;
        const wetFilter = this.ctx.createBiquadFilter();
        wetFilter.type = 'lowpass';
        wetFilter.frequency.value = 1650;
        const wetGain = this.ctx.createGain();
        wetGain.gain.value = 0.24;

        const bus = this.ctx.createBiquadFilter();
        bus.type = 'lowpass';
        bus.frequency.value = 2650;

        bus.connect(dry);
        dry.connect(comp);
        bus.connect(delay);
        delay.connect(wetFilter);
        wetFilter.connect(feedback);
        feedback.connect(delay);
        wetFilter.connect(wetGain);
        wetGain.connect(comp);
        comp.connect(master);
        master.connect(this.ctx.destination);

        this.musicMasterGain = master;
        this.musicBus = bus;
        this.musicCleanup = () => {
            try {
                bus.disconnect();
                delay.disconnect();
                feedback.disconnect();
                comp.disconnect();
                master.disconnect();
            } catch (_) {}
        };

        const bars = [
            // Bars 0-3: Куплет A — бодрая мандолина и солнечная флейта
            { bass: 38, chord: [57, 62, 66, 69], mel: [74, 76, 78, 0, 81, 0, 78, 74], section: 'A' },
            { bass: 37, chord: [57, 61, 64, 69], mel: [76, 0, 73, 69, 0, 73, 76, 0], section: 'A' },
            { bass: 35, chord: [59, 62, 66, 69], mel: [74, 0, 71, 69, 71, 74, 0, 78], section: 'A' },
            { bass: 30, chord: [57, 61, 64, 66], mel: [76, 0, 73, 0, 69, 0, 0, 0], section: 'A' },
            // Bars 4-7: Куплет A' — добавляется тёплая дачная гармоника
            { bass: 43, chord: [55, 59, 62, 67], mel: [79, 0, 78, 74, 0, 71, 74, 0], section: 'Ap' },
            { bass: 42, chord: [57, 62, 66, 69], mel: [78, 0, 74, 69, 0, 74, 78, 0], section: 'Ap' },
            { bass: 40, chord: [55, 59, 62, 64], mel: [76, 0, 74, 76, 79, 0, 78, 0], section: 'Ap' },
            { bass: 45, chord: [57, 61, 64, 67], mel: [76, 0, 73, 76, 81, 0, 79, 78], section: 'Ap' },
            // Bars 8-11: Припев B — весёлый праздник урожая!
            { bass: 43, chord: [59, 62, 66, 67], mel: [83, 0, 81, 79, 0, 78, 74, 0], section: 'B' },
            { bass: 45, chord: [57, 61, 64, 67], mel: [81, 0, 79, 76, 0, 73, 76, 0], section: 'B' },
            { bass: 42, chord: [57, 61, 64, 66], mel: [78, 81, 83, 0, 86, 0, 83, 81], section: 'B' },
            { bass: 47, chord: [59, 62, 66, 69], mel: [78, 0, 74, 71, 0, 74, 78, 0], section: 'B' },
            // Bars 12-15: Финал припева и задорная развязка
            { bass: 40, chord: [59, 62, 64, 67], mel: [79, 0, 78, 76, 0, 74, 76, 0], section: 'C' },
            { bass: 45, chord: [57, 61, 64, 67], mel: [76, 78, 79, 0, 81, 0, 78, 0], section: 'C' },
            { bass: 50, chord: [57, 62, 66, 69], mel: [74, 0, 0, 78, 81, 0, 78, 0], section: 'C' },
            { bass: 45, chord: [57, 62, 64, 67], mel: [76, 0, 73, 0, 69, 0, 73, 0], section: 'C' }
        ];

        const playMandolin = (midi, now, vol, dur = 0.35) => {
            const osc = this.ctx.createOscillator();
            const filt = this.ctx.createBiquadFilter();
            const g = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(m2f(midi), now);
            filt.type = 'lowpass';
            filt.frequency.setValueAtTime(2400, now);
            filt.frequency.exponentialRampToValueAtTime(800, now + dur);

            g.gain.setValueAtTime(0.0005, now);
            g.gain.linearRampToValueAtTime(vol, now + 0.008);
            g.gain.exponentialRampToValueAtTime(0.0005, now + dur);

            osc.connect(filt);
            filt.connect(g);
            g.connect(bus);
            osc.start(now);
            osc.stop(now + dur + 0.04);
        };

        const playAccordion = (notes, now, dur, peakVol) => {
            notes.forEach((m) => {
                [-3, 3].forEach(detune => {
                    const osc = this.ctx.createOscillator();
                    const filt = this.ctx.createBiquadFilter();
                    const g = this.ctx.createGain();
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(m2f(m), now);
                    osc.detune.setValueAtTime(detune, now);
                    filt.type = 'lowpass';
                    filt.frequency.setValueAtTime(680, now);

                    g.gain.setValueAtTime(0.0005, now);
                    g.gain.linearRampToValueAtTime(peakVol, now + 0.14);
                    g.gain.exponentialRampToValueAtTime(0.0005, now + dur);

                    osc.connect(filt);
                    filt.connect(g);
                    g.connect(bus);
                    osc.start(now);
                    osc.stop(now + dur + 0.05);
                });
            });
        };

        const playCountryFlute = (midi, now, dur, vol) => {
            const osc = this.ctx.createOscillator();
            const vib = this.ctx.createOscillator();
            const vibG = this.ctx.createGain();
            const g = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(m2f(midi), now);
            vib.type = 'sine';
            vib.frequency.setValueAtTime(5.6, now);
            vibG.gain.setValueAtTime(0, now);
            vibG.gain.linearRampToValueAtTime(7, now + 0.12);

            g.gain.setValueAtTime(0.0005, now);
            g.gain.linearRampToValueAtTime(vol, now + 0.04);
            g.gain.setValueAtTime(vol * 0.85, now + dur * 0.65);
            g.gain.exponentialRampToValueAtTime(0.0005, now + dur);

            vib.connect(vibG);
            vibG.connect(osc.detune);
            osc.connect(g);
            g.connect(bus);
            osc.start(now);
            vib.start(now);
            osc.stop(now + dur + 0.04);
            vib.stop(now + dur + 0.04);
        };

        const playBounceBass = (midi, now, dur, vol) => {
            const osc = this.ctx.createOscillator();
            const filt = this.ctx.createBiquadFilter();
            const g = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(m2f(midi), now);
            filt.type = 'lowpass';
            filt.frequency.setValueAtTime(360, now);

            g.gain.setValueAtTime(0.0005, now);
            g.gain.linearRampToValueAtTime(vol, now + 0.02);
            g.gain.exponentialRampToValueAtTime(0.0005, now + dur);

            osc.connect(filt);
            filt.connect(g);
            g.connect(bus);
            osc.start(now);
            osc.stop(now + dur + 0.04);
        };

        let step = 0;
        const stepSec = 0.210;

        this.musicInterval = setInterval(() => {
            if (this.musicMuted || !this.musicPlaying || document.hidden || this._adPaused) return;
            if (!this.ctx || this.ctx.state === 'suspended' || !this.musicBus) return;

            const now = this.ctx.currentTime;
            const barIdx = Math.floor(step / 8) % bars.length;
            const beatStep = step % 8;
            const bar = bars[barIdx];

            // Задорный прыгающий бас (раз-и-два-и)
            if (beatStep === 0 || beatStep === 4) {
                playBounceBass(beatStep === 0 ? bar.bass : bar.bass + 7, now, 0.55, bar.section === 'B' ? 0.13 : 0.10);
            }

            // Бой балалайки / мандолины на слабые восьмые (даёт танцевальный фолк-импульс!)
            if (beatStep % 2 === 1) {
                const pick = bar.chord[beatStep % bar.chord.length];
                playMandolin(pick, now, bar.section === 'B' ? 0.055 : 0.044, 0.36);
                if (bar.section === 'B') {
                    playMandolin(bar.chord[2], now + 0.015, 0.038, 0.30);
                }
            } else {
                playMandolin(bar.chord[beatStep === 0 ? 0 : 1], now, 0.036, 0.42);
            }

            // Тёплый аккордеон/струнные с 5-го такта
            if (beatStep === 0 && bar.section !== 'A') {
                playAccordion(bar.chord.slice(0, 3), now, 1.65, bar.section === 'B' ? 0.018 : 0.012);
            }

            // Ведущая свирель/флейта (+ терция на припеве)
            const melMidi = bar.mel[beatStep];
            if (melMidi > 0) {
                const isNextRest = (bar.mel[(beatStep + 1) % 8] === 0);
                const melDur = isNextRest ? stepSec * 1.85 : stepSec * 0.92;
                playCountryFlute(melMidi, now, melDur, bar.section === 'B' ? 0.085 : 0.068);
                if (bar.section === 'B') {
                    playMandolin(melMidi + 12, now, 0.042, 0.45);
                }
            }

            step++;
        }, 210);
    }

    /**
     * 1. THE ASMR VACUUM CORK POP (Сочный вакуумный чпок крышки при слиянии)
     * Рецепт: шум вакуумного щелчка (полоса 1800Hz -> 320Hz, Q=5.0) +
     * басовый резонанс банки (120-150Hz) + пентатонический тон калимбы с обертоном 2.76x.
     */
    playMerge(tier = 0) {
        if (this.muted || this._adPaused) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const noteFreq = PENTATONIC_SCALE[Math.min(tier, PENTATONIC_SCALE.length - 1)];

        // --- Шаг А: Резкий вакуумный щелчок (Noise Burst через Biquad Bandpass) ---
        const bufferSize = Math.floor(this.ctx.sampleRate * 0.045); // 45ms
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.28));
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const noiseFilter = this.ctx.createBiquadFilter();
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.setValueAtTime(1800, now);
        noiseFilter.frequency.exponentialRampToValueAtTime(320, now + 0.04);
        noiseFilter.Q.value = 5.0;

        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.65 * this.masterVolume, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.042);

        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(this.ctx.destination);
        noise.start(now);

        // --- Шаг Б: Полостной резонанс банки (Helmholtz Low Resonance) ---
        const cavityOsc = this.ctx.createOscillator();
        const cavityGain = this.ctx.createGain();
        cavityOsc.type = 'sine';
        // Басовый резонанс стеклянного сосуда (130-150 Гц)
        cavityOsc.frequency.setValueAtTime(145, now);
        cavityOsc.frequency.exponentialRampToValueAtTime(95, now + 0.07);

        cavityGain.gain.setValueAtTime(0.55 * this.masterVolume, now);
        cavityGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        cavityOsc.connect(cavityGain);
        cavityGain.connect(this.ctx.destination);
        cavityOsc.start(now);
        cavityOsc.stop(now + 0.09);

        // --- Шаг В: Теплый тон калимбы/маримбы (Пентатоника + обертон 2.76x) ---
        this.playKalimba(now + 0.015, noteFreq, tier);

        // Для старших уровней (банка и джекпот) добавляем хрустальный отзвук
        if (tier >= 6) {
            this.playGlassChime(now + 0.05);
        }
    }

    /**
     * 2. KALIMBA / MARIMBA NOTE
     * Теплый деревянный пластинчатый тембр с физическим обертоном 2.76x.
     */
    playKalimba(startTime, freq, tier) {
        // Основной фундаментальный тон
        const fundOsc = this.ctx.createOscillator();
        const fundGain = this.ctx.createGain();
        fundOsc.type = 'sine';
        fundOsc.frequency.setValueAtTime(freq, startTime);

        fundGain.gain.setValueAtTime(0.001, startTime);
        fundGain.gain.linearRampToValueAtTime(0.5 * this.masterVolume, startTime + 0.003); // 3ms атака
        fundGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.42);             // мягкое затухание

        fundOsc.connect(fundGain);
        fundGain.connect(this.ctx.destination);
        fundOsc.start(startTime);
        fundOsc.stop(startTime + 0.45);

        // Деревянный акустический обертон язычка калимбы (2.76x)
        const overOsc = this.ctx.createOscillator();
        const overGain = this.ctx.createGain();
        overOsc.type = 'sine';
        overOsc.frequency.setValueAtTime(freq * 2.76, startTime);

        overGain.gain.setValueAtTime(0.22 * this.masterVolume, startTime);
        overGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.08); // быстро угасает, давая щелчок

        overOsc.connect(overGain);
        overGain.connect(this.ctx.destination);
        overOsc.start(startTime);
        overOsc.stop(startTime + 0.09);
    }

    /**
     * 3. THE SOFT WOODY THUMP (Мягкий глухой стук падения плодов)
     * Деревянный удар с троттлингом (не чаще 1 раза в 60мс) и динамической силой от скорости.
     */
    playDrop(speed = 1.0) {
        if (this.muted || this._adPaused) return;
        const nowMs = performance.now();
        if (nowMs - this.lastThumpTime < 60) return;
        this.lastThumpTime = nowMs;

        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const strength = Math.min(Math.max(speed / 4.5, 0.2), 1.0);

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        // Мягкий треугольный тембр с фильтрацией высоких частот
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(130 * strength, now);
        osc.frequency.exponentialRampToValueAtTime(42, now + 0.065);

        gain.gain.setValueAtTime(0.35 * strength * this.masterVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.075);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.085);
    }

    /**
     * 4. GLASS / CRYSTAL CHIME (Хрустальный перезвон банок)
     * Созвучие чистых квинт со стеклянным мерцанием для банок и джекпота.
     */
    playGlassChime(startTime = null) {
        if (this.muted || this._adPaused) return;
        this.init();
        if (!this.ctx) return;

        const now = startTime !== null ? startTime : this.ctx.currentTime;
        const tones = [2093.00, 3135.96]; // До7 и Соль7 (чистая квинта)

        tones.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now);

            gain.gain.setValueAtTime(0.001, now + idx * 0.02);
            gain.gain.linearRampToValueAtTime(0.28 * this.masterVolume, now + idx * 0.02 + 0.005);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now + idx * 0.02);
            osc.stop(now + 0.7);
        });
    }

    // Торжественный звон при закатке полной банки огурцов (Тир 6)
    playJarSuccess() {
        if (this.muted || this._adPaused) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        // Каскад нот калимбы с хрусталем
        const notes = [659.25, 783.99, 987.77, 1318.51];
        notes.forEach((freq, i) => {
            this.playKalimba(now + i * 0.08, freq, 6);
        });
        this.playGlassChime(now + 0.15);
    }

    // ДЖЕКПОТ! Праздничная победная трель (Тир 7)
    playJackpot() {
        if (this.muted || this._adPaused) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const fanfare = [
            { f: 523.25, t: 0.00 },
            { f: 659.25, t: 0.10 },
            { f: 783.99, t: 0.20 },
            { f: 1046.50, t: 0.32 },
            { f: 880.00, t: 0.44 },
            { f: 1318.51, t: 0.58 }
        ];

        fanfare.forEach(item => {
            this.playKalimba(now + item.t, item.f, 7);
        });
        this.playGlassChime(now + 0.25);
        this.playGlassChime(now + 0.45);
    }

    // Деликатный глухой стук при опасности (тиканье счетов)
    playDangerTick() {
        if (this.muted || this._adPaused) return;
        const now = performance.now();
        if (this.lastSoundTime['danger'] && (now - this.lastSoundTime['danger'] < 380)) return;
        this.lastSoundTime['danger'] = now;

        this.init();
        if (!this.ctx) return;

        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(360, t);
        osc.frequency.exponentialRampToValueAtTime(140, t + 0.05);

        gain.gain.setValueAtTime(0.18 * this.masterVolume, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + 0.07);
    }

    // Клик по деревянной кнопке UI
    playClick() {
        if (this.muted || this._adPaused) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(260, now);
        osc.frequency.exponentialRampToValueAtTime(110, now + 0.04);

        gain.gain.setValueAtTime(0.25 * this.masterVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.06);
    }

    // Завершение игры
    playGameOver() {
        if (this.muted || this._adPaused) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const notes = [440, 392, 349, 293];
        notes.forEach((freq, idx) => {
            this.playKalimba(now + idx * 0.16, freq, 2);
        });
    }

    /**
     * 5. ПОВАРЁШКА (Мягкое деревянное зачерпывание + воздушный хлопок)
     */
    playScoop() {
        if (this.muted || this._adPaused) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;

        // Воздушный шуршащий вдох поварёшки (Filtered Noise)
        const bufferSize = Math.floor(this.ctx.sampleRate * 0.09);
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.42));
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(920, now);
        filter.frequency.exponentialRampToValueAtTime(340, now + 0.085);
        filter.Q.value = 3.2;

        const nGain = this.ctx.createGain();
        nGain.gain.setValueAtTime(0.38 * this.masterVolume, now);
        nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.088);

        noise.connect(filter);
        filter.connect(nGain);
        nGain.connect(this.ctx.destination);
        noise.start(now);

        // Тёплый деревянный щелчок ручки + нота калимбы вверх
        const woodOsc = this.ctx.createOscillator();
        const woodGain = this.ctx.createGain();
        woodOsc.type = 'triangle';
        woodOsc.frequency.setValueAtTime(195, now);
        woodOsc.frequency.exponentialRampToValueAtTime(92, now + 0.07);
        woodGain.gain.setValueAtTime(0.34 * this.masterVolume, now);
        woodGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        woodOsc.connect(woodGain);
        woodGain.connect(this.ctx.destination);
        woodOsc.start(now);
        woodOsc.stop(now + 0.09);

        this.playKalimba(now + 0.025, 783.99, 3);
    }

    /**
     * 6. ПОТРЯСТИ БАНКУ (Перекат плодов в стекле: каскад глухих стуков + лёгкий звон стекла)
     */
    playJarShake() {
        if (this.muted || this._adPaused) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const thumps = [
            { t: 0.00, fStart: 150, fEnd: 55, vol: 0.36 },
            { t: 0.065, fStart: 125, fEnd: 46, vol: 0.30 },
            { t: 0.135, fStart: 165, fEnd: 58, vol: 0.34 },
            { t: 0.21, fStart: 135, fEnd: 48, vol: 0.24 }
        ];

        thumps.forEach(item => {
            const osc = this.ctx.createOscillator();
            const g = this.ctx.createGain();
            const t0 = now + item.t;
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(item.fStart, t0);
            osc.frequency.exponentialRampToValueAtTime(item.fEnd, t0 + 0.065);
            g.gain.setValueAtTime(item.vol * this.masterVolume, t0);
            g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.075);
            osc.connect(g);
            g.connect(this.ctx.destination);
            osc.start(t0);
            osc.stop(t0 + 0.085);
        });

        // Короткое стеклянное позвякивание крышки
        this.playGlassChime(now + 0.08);
    }
}

window.soundEffects = new SoundEffects();
