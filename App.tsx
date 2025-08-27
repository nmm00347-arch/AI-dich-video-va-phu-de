
import React, { useState, useCallback } from 'react';
import { AppMode, SubtitleBlock, TranslationStyle } from './types';
import { parseSrt, stringifySrt } from './services/srtUtils';
import { translateText, transcribeAndFormatToSrt } from './services/geminiService';
import { extractAudioFromVideo, audioBufferToWavBase64 } from './services/audioUtils';
import { FileUploader } from './components/FileUploader';
import { SettingsPanel } from './components/SettingsPanel';
import { ResultDisplay } from './components/ResultDisplay';
import { LogoIcon, TranslateIcon, TranscribeIcon } from './components/icons';
import { Spinner } from './components/Spinner';

const App: React.FC = () => {
    const [mode, setMode] = useState<AppMode>(AppMode.Translate);
    const [file, setFile] = useState<File | null>(null);
    const [targetLanguage, setTargetLanguage] = useState<string>('Vietnamese');
    const [translationStyle, setTranslationStyle] = useState<TranslationStyle>(TranslationStyle.Neutral);
    const [originalSubtitles, setOriginalSubtitles] = useState<SubtitleBlock[]>([]);
    const [translatedSubtitles, setTranslatedSubtitles] = useState<SubtitleBlock[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [progress, setProgress] = useState<number>(0);
    const [processingMessage, setProcessingMessage] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [resultSrt, setResultSrt] = useState<string>('');

    const resetState = () => {
        setFile(null);
        setOriginalSubtitles([]);
        setTranslatedSubtitles([]);
        setIsLoading(false);
        setProgress(0);
        setError(null);
        setResultSrt('');
        setProcessingMessage('');
    };

    const handleFileChange = (selectedFile: File | null) => {
        resetState();
        if (selectedFile) {
            if (mode === AppMode.Translate && !selectedFile.name.endsWith('.srt')) {
                setError('Please upload a valid .srt file for translation.');
                return;
            }
            if (mode === AppMode.Transcribe && !selectedFile.type.startsWith('video/')) {
                setError('Please upload a valid video file for transcription.');
                return;
            }
            setFile(selectedFile);
        }
    };

    const handleModeChange = (newMode: AppMode) => {
        setMode(newMode);
        resetState();
    };

    const handleTranslate = useCallback(async () => {
        if (!file) {
            setError('Please upload an SRT file first.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setProgress(0);
        setProcessingMessage('Translating subtitles...');

        try {
            const srtContent = await file.text();
            const parsedSubtitles = parseSrt(srtContent);
            setOriginalSubtitles(parsedSubtitles);

            const translated: SubtitleBlock[] = [];
            for (let i = 0; i < parsedSubtitles.length; i++) {
                const block = parsedSubtitles[i];
                const translatedText = await translateText(block.text, targetLanguage, translationStyle);
                translated.push({ ...block, text: translatedText });
                setProgress(((i + 1) / parsedSubtitles.length) * 100);
            }

            setTranslatedSubtitles(translated);
            setResultSrt(stringifySrt(translated));
        } catch (e) {
            console.error(e);
            setError('An error occurred during translation. Please check the console for details.');
        } finally {
            setIsLoading(false);
            setProcessingMessage('');
        }
    }, [file, targetLanguage, translationStyle]);
    
    const handleTranscribe = useCallback(async () => {
        if (!file) {
            setError('Please upload a video file first.');
            return;
        }
        setIsLoading(true);
        setError(null);
        setProgress(0);
        setResultSrt('');
        
        try {
            setProcessingMessage('Extracting audio from video...');
            setProgress(10);
            const audioBuffer = await extractAudioFromVideo(file);
            
            setProcessingMessage('Encoding audio...');
            setProgress(30);
            // FIX: Await the promise returned by audioBufferToWavBase64.
            const audioBase64 = await audioBufferToWavBase64(audioBuffer);

            setProcessingMessage('Transcribing and formatting SRT (this may take a while)...');
            setProgress(50);
            const generatedSrt = await transcribeAndFormatToSrt(audioBase64, targetLanguage);
            
            setResultSrt(generatedSrt);
            const parsedSrt = parseSrt(generatedSrt);
            setOriginalSubtitles(parsedSrt); // Show result in the "Original" column
            setTranslatedSubtitles([]); // No "translated" column for transcription
            setProgress(100);

        } catch (e) {
            console.error(e);
            setError('An error occurred during transcription. Please check the console for details.');
        } finally {
            setIsLoading(false);
            setProcessingMessage('');
        }
    }, [file, targetLanguage]);

    const handleProcess = () => {
        if (mode === AppMode.Translate) {
            handleTranslate();
        } else {
            handleTranscribe();
        }
    };
    
    const downloadSrt = () => {
        if (!resultSrt) return;
        const blob = new Blob([resultSrt], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const originalFilename = file?.name.split('.').slice(0, -1).join('.') || 'file';
        const suffix = mode === AppMode.Translate ? `_${targetLanguage}` : '_transcribed';
        a.href = url;
        a.download = `${originalFilename}${suffix}.srt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col items-center p-4 sm:p-6 lg:p-8">
            <header className="w-full max-w-5xl mb-8 text-center">
                <div className="flex items-center justify-center gap-4 mb-2">
                    <LogoIcon className="h-12 w-12 text-cyan-400" />
                    <h1 className="text-4xl font-bold text-white tracking-tight">SRT AI Suite</h1>
                </div>
                <p className="text-lg text-gray-400">Translate Subtitles & Transcribe Videos with AI</p>
            </header>

            <main className="w-full max-w-5xl bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl shadow-cyan-500/10 border border-gray-700">
                <div className="p-6">
                    <div className="flex border-b border-gray-700 mb-6">
                        <TabButton 
                            icon={<TranslateIcon/>} 
                            label={AppMode.Translate} 
                            isActive={mode === AppMode.Translate} 
                            onClick={() => handleModeChange(AppMode.Translate)}
                        />
                         <TabButton 
                            icon={<TranscribeIcon/>}
                            label={AppMode.Transcribe} 
                            isActive={mode === AppMode.Transcribe} 
                            onClick={() => handleModeChange(AppMode.Transcribe)}
                        />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-1 space-y-6">
                            <FileUploader file={file} onFileChange={handleFileChange} mode={mode} />
                            <SettingsPanel 
                                targetLanguage={targetLanguage}
                                setTargetLanguage={setTargetLanguage}
                                translationStyle={translationStyle}
                                setTranslationStyle={setTranslationStyle}
                                mode={mode}
                            />
                        </div>
                        <div className="md:col-span-2 flex flex-col">
                            <div className="flex-grow bg-gray-900/50 rounded-lg p-4 min-h-[200px] flex flex-col justify-center items-center">
                                {isLoading ? (
                                    <div className="text-center w-full">
                                        <Spinner />
                                        <p className="mt-4 text-cyan-400">{processingMessage}</p>
                                        <div className="w-full bg-gray-700 rounded-full h-2.5 mt-4">
                                            <div className="bg-cyan-500 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                                        </div>
                                    </div>
                                ) : error ? (
                                    <div className="text-red-400 text-center">{error}</div>
                                ) : resultSrt ? (
                                    <ResultDisplay original={originalSubtitles} translated={translatedSubtitles} mode={mode}/>
                                ) : (
                                    <div className="text-center text-gray-500">
                                        <p>Your results will appear here.</p>
                                    </div>
                                )}
                            </div>
                            <div className="mt-4 flex gap-4">
                                <button
                                    onClick={handleProcess}
                                    disabled={!file || isLoading}
                                    className="flex-1 bg-cyan-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-300 shadow-lg shadow-cyan-500/20"
                                >
                                    {isLoading ? 'Processing...' : (mode === AppMode.Translate ? 'Start Translation' : 'Start Transcription')}
                                </button>
                                {resultSrt && !isLoading && (
                                    <button
                                        onClick={downloadSrt}
                                        className="bg-gray-700 text-white font-bold py-3 px-4 rounded-lg hover:bg-gray-600 transition-colors duration-300"
                                    >
                                        Download .srt
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

interface TabButtonProps {
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
    onClick: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({ icon, label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors duration-300 ${
            isActive
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-gray-400 hover:text-white hover:border-gray-500'
        }`}
    >
        {icon}
        {label}
    </button>
);


export default App;