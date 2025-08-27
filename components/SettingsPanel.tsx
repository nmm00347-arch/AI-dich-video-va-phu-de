
import React from 'react';
import { TranslationStyle, AppMode } from '../types';

interface SettingsPanelProps {
    targetLanguage: string;
    setTargetLanguage: (lang: string) => void;
    translationStyle: TranslationStyle;
    setTranslationStyle: (style: TranslationStyle) => void;
    mode: AppMode;
}

const languages = [
  'English', 'Spanish', 'French', 'German', 'Chinese (Simplified)', 'Japanese', 'Korean', 'Russian', 'Arabic', 'Portuguese', 'Italian', 'Vietnamese'
];

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ 
    targetLanguage, setTargetLanguage, 
    translationStyle, setTranslationStyle,
    mode 
}) => {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h2 className="text-lg font-semibold text-white">2. Configure Settings</h2>
                <label htmlFor="language" className="block text-sm font-medium text-gray-300">
                    {mode === AppMode.Translate ? 'Target Language' : 'Video Language (for transcription)'}
                </label>
                <select
                    id="language"
                    value={targetLanguage}
                    onChange={(e) => setTargetLanguage(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                >
                    {languages.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                </select>
            </div>
            {mode === AppMode.Translate && (
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">Translation Style</label>
                    <div className="grid grid-cols-2 gap-2">
                        {Object.values(TranslationStyle).map(style => (
                            <button
                                key={style}
                                onClick={() => setTranslationStyle(style)}
                                className={`px-3 py-2 text-sm rounded-md transition-colors duration-200 ${
                                    translationStyle === style ? 'bg-cyan-600 text-white font-semibold' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                            >
                                {style}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
