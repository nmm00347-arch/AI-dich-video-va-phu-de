
// A global AudioContext for performance
let audioContext: AudioContext;
const getAudioContext = (): AudioContext => {
    if (!audioContext) {
        audioContext = new window.AudioContext();
    }
    return audioContext;
};

/**
 * Extracts the audio from a video file into an AudioBuffer.
 * @param videoFile The video file.
 * @returns A promise that resolves with the AudioBuffer.
 */
export const extractAudioFromVideo = (videoFile: File): Promise<AudioBuffer> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const videoFileData = event.target?.result as ArrayBuffer;
            if (!videoFileData) {
                return reject(new Error('Could not read video file data.'));
            }
            const context = getAudioContext();
            context.decodeAudioData(videoFileData, 
                (buffer) => resolve(buffer),
                (error) => reject(new Error(`Error decoding audio data: ${error.message}`))
            );
        };
        reader.onerror = (error) => reject(new Error(`FileReader error: ${error}`));
        reader.readAsArrayBuffer(videoFile);
    });
};

/**
 * Encodes an AudioBuffer into a base64 encoded WAV file string.
 * This is a client-side implementation of WAV encoding.
 * @param buffer The AudioBuffer to encode.
 * @returns A base64 encoded string representing the WAV file.
 */
// FIX: The function is asynchronous because it uses FileReader, so it should return a Promise<string>.
export const audioBufferToWavBase64 = (buffer: AudioBuffer): Promise<string> => {
    const numOfChan = buffer.numberOfChannels;
    const length = buffer.length * numOfChan * 2 + 44;
    const bufferArray = new ArrayBuffer(length);
    const view = new DataView(bufferArray);
    const channels = [];
    let i, sample;
    let offset = 0;
    let pos = 0;

    // Helper function to write strings
    const writeString = (view: DataView, offset: number, string: string) => {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    };
    
    // RIFF header
    writeString(view, pos, 'RIFF'); pos += 4;
    view.setUint32(pos, length - 8, true); pos += 4;
    writeString(view, pos, 'WAVE'); pos += 4;

    // FMT sub-chunk
    writeString(view, pos, 'fmt '); pos += 4;
    view.setUint32(pos, 16, true); pos += 4; // Sub-chunk size
    view.setUint16(pos, 1, true); pos += 2;  // Audio format 1=PCM
    view.setUint16(pos, numOfChan, true); pos += 2;
    view.setUint32(pos, buffer.sampleRate, true); pos += 4;
    view.setUint32(pos, buffer.sampleRate * 2 * numOfChan, true); pos += 4; // Byte rate
    view.setUint16(pos, numOfChan * 2, true); pos += 2; // Block align
    view.setUint16(pos, 16, true); pos += 2; // Bits per sample

    // Data sub-chunk
    writeString(view, pos, 'data'); pos += 4;
    view.setUint32(pos, length - pos - 4, true); pos += 4;

    // Write the PCM samples
    for (i = 0; i < buffer.numberOfChannels; i++) {
        channels.push(buffer.getChannelData(i));
    }

    offset = pos;

    for (i = 0; i < buffer.length; i++) {
        for (let chan = 0; chan < numOfChan; chan++) {
            sample = Math.max(-1, Math.min(1, channels[chan][i]));
            sample = (sample < 0 ? sample * 0x8000 : sample * 0x7FFF) | 0;
            view.setInt16(offset, sample, true);
            offset += 2;
        }
    }

    // Convert ArrayBuffer to Base64
    const blob = new Blob([view], { type: 'audio/wav' });
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = (reader.result as string).split(',')[1];
            resolve(base64String);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};