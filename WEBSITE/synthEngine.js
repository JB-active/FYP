
// 1. CORE SYNTH ENGINE

const SynthEngine = {
    synth: null,
    activeNumber: null,

    chords: {
        "C": {
            1: ["C4", "E4", "G4"],
            2: ["D4", "F4", "A4"],
            3: ["E4", "G4", "B4"],
            4: ["F4", "A4", "C5"],
            5: ["G4", "B4", "D5"],
            6: ["A4", "C5", "E5"],
            7: ["B4", "D5", "F5"]
        },
        "G": {
            1: ["G3", "B3", "D4"], 
            2: ["A3", "C4", "E4"], 
            3: ["B3", "D4", "F#4"],
            4: ["C4", "E4", "G4"], 
            5: ["D4", "F#4", "A4"],
            6: ["E4", "G4", "B4"], 
            7: ["F#4", "A4", "C5"] 
        },
        "D": {
            1: ["D4", "F#4", "A4"],
            2: ["E4", "G4", "B4"],
            3: ["F#4", "A4", "C#5"],
            4: ["G4", "B4", "D5"],
            5: ["A4", "C#5", "E5"],
            6: ["B4", "D5", "F#5"],
            7: ["C#5", "E5", "G5"]
        }
    },

    async init() {
        // Force Tone.js to resume AudioContext on user gesture if suspended
        if (Tone.context.state !== 'running') {
            await Tone.start();
        }
        
        // Create synthesizer if it doesn't exist yet
        if (!this.synth) {
            this.synth = new Tone.PolySynth(Tone.Synth).toDestination();
            this.synth.set({
                oscillator: { type: "triangle" },
                envelope: { attack: 0.1, decay: 0.2, sustain: 0.8, release: 1 }
            });
            console.log("Tone.js Audio Engine Initialized");
        }
    },

    playNashvilleNumber(number, musicalKey) {
        if (this.activeNumber === number) return;

        if (number === 0 || !this.chords[musicalKey][number]) {
            this.stopAudio();
            return;
        }

        this.stopAudio();
        const notesToPlay = this.chords[musicalKey][number];
        this.synth.triggerAttack(notesToPlay);
        this.activeNumber = number;
    },

    stopAudio() {
        if (this.activeNumber !== null && this.synth) {
            this.synth.releaseAll();
            this.activeNumber = null;
        }
    }
};


// 2. PROGRESSION SEQUENCER

const ProgressionSequencer = {
    sequence: null,
    isPlaying: false,

    parseProgression(inputString) {
        return inputString
            .replace(/[^1-7]/g, ' ')
            .trim()
            .split(/\s+/)
            .map(Number)
            .filter(n => n >= 1 && n <= 7);
    },

    start(progressionString, musicalKey, bpm, timeSignature) {
        this.stop();

        const degrees = this.parseProgression(progressionString);
        if (degrees.length === 0) {
            alert("Please enter a valid progression using numbers 1 to 7 (e.g. 1 4 5 6).");
            return;
        }

        Tone.Transport.bpm.value = parseInt(bpm, 10);
        const [beats, beatValue] = timeSignature.split('/').map(Number);
        Tone.Transport.timeSignature = [beats, beatValue];

        this.sequence = new Tone.Sequence(
            (time, degree) => {
                const notes = SynthEngine.chords[musicalKey][degree];
                if (notes && SynthEngine.synth) {
                    SynthEngine.synth.triggerAttackRelease(notes, "1m", time);
                    
                    const countEl = document.getElementById('fingerCount');
                    const chordEl = document.getElementById('chordOutput');
                    if (countEl) countEl.innerText = degree;
                    if (chordEl) chordEl.innerText = `${degree} Chord (${notes.join(', ')})`;
                }
            },
            degrees,
            "1m"
        );

        this.sequence.start(0);
        Tone.Transport.start();
        this.isPlaying = true;
    },

    stop() {
        if (this.sequence) {
            this.sequence.dispose();
            this.sequence = null;
        }
        Tone.Transport.stop();
        Tone.Transport.cancel();
        SynthEngine.stopAudio();
        this.isPlaying = false;

        const chordEl = document.getElementById('chordOutput');
        if (chordEl) chordEl.innerText = "Stopped";
    }
};


// 3. UI EVENT LISTENERS

document.addEventListener("DOMContentLoaded", () => {
    // Start Audio Engine Button
    const startBtn = document.getElementById('startBtn');
    if (startBtn) {
        startBtn.addEventListener('click', async () => {
            await SynthEngine.init();
            alert("Audio Engine Ready!");
        });
    }

    // Play Progression Button
    const playProgBtn = document.getElementById('playProgressionBtn');
    if (playProgBtn) {
        playProgBtn.addEventListener('click', async () => {
            await SynthEngine.init(); // Unlocks audio before playback starts

            const progressionText = document.getElementById('progressionInput')?.value || "1 4 5 6";
            const selectedKey = document.getElementById('keySelect')?.value || "C";
            const bpm = document.getElementById('bpmInput')?.value || 120;
            const timeSig = document.getElementById('timeSigSelect')?.value || "4/4";

            ProgressionSequencer.start(progressionText, selectedKey, bpm, timeSig);
        });
    }

    // Stop Progression Button
    const stopProgBtn = document.getElementById('stopProgressionBtn');
    if (stopProgBtn) {
        stopProgBtn.addEventListener('click', () => {
            ProgressionSequencer.stop();
        });
    }

    // Live Tempo adjustment
    const bpmInput = document.getElementById('bpmInput');
    if (bpmInput) {
        bpmInput.addEventListener('input', (e) => {
            const newBpm = parseInt(e.target.value, 10);
            if (newBpm >= 40 && newBpm <= 240) {
                Tone.Transport.bpm.value = newBpm;
            }
        });
    }
});