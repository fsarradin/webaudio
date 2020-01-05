function pitchedNote(note) {
    return function(pitch) {
        return note * Math.pow(2, pitch);
    };
}

let zero = 1e-5;

let C0 = 16.35;
let CSharp0 = 17.32;
let D0 = 18.35;
let DSharp0 = 19.45;
let E0 = 20.60;
let F0 = 21.83;
let FSharp0 = 23.12;
let G0 = 24.50;
let GSharp0 = 25.96;
let A0 = 27.50;
let ASharp0 = 29.14;
let B0 = 30.87;

let Note = {
    C: pitchedNote(C0),
    CSharp: pitchedNote(CSharp0),
    DFlat: pitchedNote(CSharp0),
    D: pitchedNote(D0),
    DSharp: pitchedNote(DSharp0),
    EFlat: pitchedNote(DSharp0),
    E: pitchedNote(E0),
    F: pitchedNote(F0),
    FSharp: pitchedNote(FSharp0),
    GFlat: pitchedNote(FSharp0),
    G: pitchedNote(G0),
    GSharp: pitchedNote(GSharp0),
    AFlat: pitchedNote(GSharp0),
    A: pitchedNote(A0),
    ASharp: pitchedNote(ASharp0),
    BFlat: pitchedNote(ASharp0),
    B: pitchedNote(B0)
};

let audioCtx = new(window.AudioContext || window.webkitAudioContext);

function signal(f, dest) {
    let sine = audioCtx.createOscillator();
    sine.frequency.value = f;
    sine.type = "square";
    sine.connect(dest);
    sine.start();
    //  sine.stop(audioCtx.currentTime + 5);
    return sine;
}

function createVolume(gain, dest) {
    let volume = audioCtx.createGain();
    volume.connect(dest);
    volume.gain.value = gain;
    return volume;
}

let master = createVolume(1.0, audioCtx.destination);
let tremolo = audioCtx.createOscillator();
tremolo.frequency.value = 6;
tremolo.start();
let tremoloGain = createVolume(0.5, master.gain);
tremolo.connect(tremoloGain);

function Tone(note, dest) {
    this.volume = createVolume(1.0, dest);
    this.h1 = createVolume(1.0, this.volume);
    this.h2 = createVolume(0.5, this.volume);
    this.h3 = createVolume(0.25, this.volume);
    this.notes = [
        signal(note, this.h1),
        signal(note / 2, this.h2),
        signal(note * 2, this.h3)
    ];
    // this.notes.forEach(n => n.start());
}

// Tone.prototype.start = function() { this.notes.forEach(n => n.start()); };
Tone.prototype.stop = function() {
    this.notes.forEach(n => n.stop());
    this.notes.forEach(n => n.disconnect());
    this.h1.disconnect();
    this.h2.disconnect();
    this.h3.disconnect();
    this.volume.gain.exponentialRampToValueAtTime(1.0, audioCtx.currentTime + 0.1);;
    this.volume.disconnect();
};

function Chord(notes, dest) {
    this.volume = createVolume(zero, dest);
    this.chord = notes.map(n => new Tone(n, this.volume));
}

// Chord.prototype.start = function() { this.chord.forEach(n => n.start()); };
Chord.prototype.stop = function() {
    this.chord.forEach(n => n.stop());
    this.volume.gain.exponentialRampToValueAtTime(1.0, audioCtx.currentTime + 0.1);;
    this.volume.disconnect();
};

let chordCMaj7 = new Chord([Note.C(4), Note.E(4), Note.G(4), Note.B(4)], master);
let chordDm7 = new Chord([Note.D(4), Note.F(4), Note.A(4), Note.C(5)], master);
let chordEm7 = new Chord([Note.E(4), Note.G(4), Note.B(4), Note.D(5)], master);
let chordFMaj7 = new Chord([Note.F(4), Note.A(4), Note.C(5), Note.E(5)], master);
let chordG7 = new Chord([Note.G(4), Note.B(4), Note.D(5), Note.F(5)], master);
let chordAm7 = new Chord([Note.A(4), Note.C(5), Note.E(5), Note.G(5)], master);
let chordBm7b5 = new Chord([Note.B(4), Note.D(5), Note.F(5), Note.A(5)], master);

function play(chord) {
    chord.volume.gain.exponentialRampToValueAtTime(1.0, audioCtx.currentTime + 0.1);
}

function stop(chord) {
    chord.volume.gain.setValueAtTime(zero, audioCtx.currentTime);
}