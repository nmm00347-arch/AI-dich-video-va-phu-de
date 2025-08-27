
import React from 'react';
import { SubtitleBlock, AppMode } from '../types';

interface ResultDisplayProps {
    original: SubtitleBlock[];
    translated: SubtitleBlock[];
    mode: AppMode;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ original, translated, mode }) => {
    const isTranslateMode = mode === AppMode.Translate;

    return (
        <div className="w-full h-96 overflow-y-auto bg-gray-900 rounded-md p-1">
            <div className="grid grid-cols-12 gap-x-4 sticky top-0 bg-gray-800 p-2 rounded-t-md z-10">
                <div className="col-span-1 font-bold text-sm text-gray-400">#</div>
                <div className="col-span-3 font-bold text-sm text-gray-400">Timestamp</div>
                <div className={`font-bold text-sm text-gray-400 ${isTranslateMode ? 'col-span-4' : 'col-span-8'}`}>
                    {isTranslateMode ? 'Original Text' : 'Transcribed Text'}
                </div>
                {isTranslateMode && <div className="col-span-4 font-bold text-sm text-gray-400">Translated Text</div>}
            </div>
            <div className="p-2 space-y-3">
                {original.map((block, index) => (
                    <div key={block.id} className="grid grid-cols-12 gap-x-4 text-sm items-start border-b border-gray-800 pb-2 last:border-b-0">
                        <div className="col-span-1 text-gray-500">{block.id}</div>
                        <div className="col-span-3 text-cyan-400 font-mono text-xs">
                            {block.startTime} --&gt; {block.endTime}
                        </div>
                        <div className={`text-gray-200 ${isTranslateMode ? 'col-span-4' : 'col-span-8'}`}>
                            {block.text}
                        </div>
                        {isTranslateMode && (
                            <div className="col-span-4 text-green-300">
                                {translated[index]?.text || '...'}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
