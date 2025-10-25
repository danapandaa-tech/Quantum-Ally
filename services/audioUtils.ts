// A mapping from base64 char to value
const b64 =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

// A function to decode a base64 string
function decode(base64: string) {
    //
    let E = '',
        r,
        b,
        i = 0,
        x = 0;
    //
    base64 = base64.replace(/[^A-Za-z0-9\+\/\=]/g, '');
    //
    for (i; i < base64.length; ) {
        r = (b64.indexOf(base64.charAt(i++)) << 2) | ((b = b64.indexOf(base64.charAt(i++))) >> 4);
        b = ((b & 15) << 4) | ((x = b64.indexOf(base64.charAt(i++))) >> 2);
        x = ((x & 3) << 6) | b64.indexOf(base64.charAt(i++));

        E += String.fromCharCode(r);
        if (64 !== b) {
            E += String.fromCharCode(b);
        }
        if (64 !== x) {
            E += String.fromCharCode(x);
        }
    }
    return E;
}

// A function to decode the audio data
async function decodeAudioData(
    data: string,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(
        new Uint8Array(data.split('').map((c) => c.charCodeAt(0))).buffer,
    );
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
            channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
        }
    }
    return buffer;
}


export const playAudio = async (
  base64Audio: string,
  audioContext: AudioContext,
  onEnded: () => void
): Promise<AudioBufferSourceNode> => {
    const decoded = decode(base64Audio);
    const audioBuffer = await decodeAudioData(decoded, audioContext, 24000, 1);
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    source.onended = onEnded;
    source.start();
    return source;
};

export const playInteractionSound = (
    type: 'save' | 'ritual',
    audioContext: AudioContext
) => {
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }

    const playNote = (frequency: number, startTime: number, duration: number) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.type = 'sine';
        oscillator.frequency.value = frequency;

        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.01);
        gainNode.gain.linearRampToValueAtTime(0, startTime + duration);

        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
    };

    const now = audioContext.currentTime;
    if (type === 'save') {
        // A simple, high-pitched "ping" for saving
        playNote(880, now, 0.15);
    } else if (type === 'ritual') {
        // A slightly more melodic "chime" for the ritual
        playNote(523.25, now, 0.2); // C5
        playNote(783.99, now + 0.1, 0.2); // G5
    }
};