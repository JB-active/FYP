// 1. CORE SYNTH ENGNINE

const SynthEngine = {
    synth: null,
    activeNumber: null, // Tracks what is currently playing to prevent audio flickering

    // A dictionary mapping the Nashville Number System to absolute pitches
    // mapped to 1 through 7
    // Each key has its own set of chords
    chords: {
        "C": { 
            1: ["C4", "E4", "G4"], // 1 Chord (C Major)
            2: ["D4", "F4", "A4"], // 2 Chord (D minor)
            3: ["E4", "G4", "B4"], // 3 Chord (E minor)
            4: ["F4", "A4", "C5"], // 4 Chord (F Major)
            5: ["G4", "B4", "D5"], // 5 Chord (G Major)
            6: ["A4", "C5", "E5"], // 6 Chord (A minor)
            7: ["B4", "D5", "F5"]  // 7 Chord (B diminished)
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

    // Initialize the engine (Must be called by a button click due to browser auto-play policies)
    async init() {
        await Tone.start(); // Wakes up the browser's AudioContext
        
        // Create a PolySynth to handle multiple simultaneous notes (chords)
        this.synth = new Tone.PolySynth(Tone.Synth).toDestination();
        
        // Soften the sound so it sounds like an electric piano, not a harsh alarm
        this.synth.set({
            oscillator: { type: "triangle" },
            envelope: { attack: 0.1, decay: 0.2, sustain: 0.8, release: 1 }
        });
        
        console.log("Tone.js Audio Engine Initialized");
    },


    playNashvilleNumber(number, musicalKey) {
        // Debounce: If the camera sees the same number already playing, do nothing
        if (this.activeNumber === number) return;

        // If the user shows 0 fingers or an invalid number, stop the audio
        if (number === 0 || !this.chords[musicalKey][number]) {
            this.stopAudio();
            return;
        }

        // Stop the previous chord before playing the new one
        this.stopAudio();

        // Get the array of notes (e.g., ["C4", "E4", "G4"])
        const notesToPlay = this.chords[musicalKey][number];
        
        // Play the chord indefinitely until stopAudio() is called
        this.synth.triggerAttack(notesToPlay);
        this.activeNumber = number;
        
        console.log(`Playing NNS: ${number} in Key of ${musicalKey}`);
    },

    // Releases the synth's keys to fade out the audio
    stopAudio() {
        if (this.activeNumber !== null) {
            this.synth.releaseAll();
            this.activeNumber = null;
        }
    }
};


// 2. PROGRESSION PLAYBACK SEQUENCER

const ProgressionSequencer = {
    sequence: null,
    isPlaying: false,

    parseProgression(inputString) {
        return inputString
        .replace(/\s+/g, '')
        .trim()
        .split(/\s+/)
        .map(Number)
        .filter(n => n >= 1 && n <= 7);
    },

    start(progressionString, musicalKey, bpm, timeSignature) {
        this.stop(); // Stops any existing sequence before starting a new one

        const progression = this.parseProgression(progressionString);
        if (progression.length === 0) {
            console.error("Please enter a valid progression (e.g. 6 4 1 5)");
            return;
        }
    }
}