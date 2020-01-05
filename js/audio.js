function pitchedNote(note) {
    return function(pitch) {
        return note * Math.pow(2, pitch);
    };
}

var zero = 1e-5;

var C0 = 16.35;
var CSharp0 = 17.32;
var D0 = 18.35;
var DSharp0 = 19.45;
var E0 = 20.60;
var F0 = 21.83;
var FSharp0 = 23.12;
var G0 = 24.50;
var GSharp0 = 25.96;
var A0 = 27.50;
var ASharp0 = 29.14;
var B0 = 30.87;

var Note = {
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
}

var audioCtx = new(window.AudioContext || window.webkitAudioContext);

function signal(f, dest) {
    var sine = audioCtx.createOscillator();
    sine.frequency.value = f;
    sine.type = "square";
    sine.connect(dest);
    sine.start();
    //  sine.stop(audioCtx.currentTime + 5);
    return sine;
}

function createVolume(gain, dest) {
    var volume = audioCtx.createGain();
    volume.connect(dest);
    volume.gain.value = gain;
    return volume;
}

var master = createVolume(1.0, audioCtx.destination);
var tremolo = audioCtx.createOscillator();
tremolo.frequency.value = 6;
tremolo.start();
var tremoloGain = createVolume(0.5, master.gain);
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

var chordCMaj7 = new Chord([Note.C(4), Note.E(4), Note.G(4), Note.B(4)], master);
var chordDm7 = new Chord([Note.D(4), Note.F(4), Note.A(4), Note.C(5)], master);
var chordEm7 = new Chord([Note.E(4), Note.G(4), Note.B(4), Note.D(5)], master);
var chordFMaj7 = new Chord([Note.F(4), Note.A(4), Note.C(5), Note.E(5)], master);
var chordG7 = new Chord([Note.G(4), Note.B(4), Note.D(5), Note.F(5)], master);
var chordAm7 = new Chord([Note.A(4), Note.C(5), Note.E(5), Note.G(5)], master);
var chordBm7b5 = new Chord([Note.B(4), Note.D(5), Note.F(5), Note.A(5)], master);

function play(chord) {
    chord.volume.gain.exponentialRampToValueAtTime(1.0, audioCtx.currentTime + 0.1);
}

function stop(chord) {
    chord.volume.gain.setValueAtTime(zero, audioCtx.currentTime);
}