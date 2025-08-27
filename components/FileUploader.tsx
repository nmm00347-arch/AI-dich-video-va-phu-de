
import React, { useCallback, useState } from 'react';
import { AppMode } from '../types';
import { UploadIcon } from './icons';

interface FileUploaderProps {
    file: File | null;
    onFileChange: (file: File | null) => void;
    mode: AppMode;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ file, onFileChange, mode }) => {
    const [isDragging, setIsDragging] = useState(false);
    const acceptedFileTypes = mode === AppMode.Translate ? '.srt' : 'video/*';
    const dropzoneText = mode === AppMode.Translate ? 'Drop your .srt file here' : 'Drop your video file here';
    
    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };
    
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            onFileChange(e.dataTransfer.files[0]);
        }
    }, [onFileChange]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            onFileChange(e.target.files[0]);
        }
    };

    return (
        <div className="space-y-2">
            <h2 className="text-lg font-semibold text-white">1. Upload File</h2>
            <div
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors duration-300 ${
                    isDragging ? 'border-cyan-400 bg-gray-700/50' : 'border-gray-600 hover:border-gray-500'
                }`}
            >
                <input
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleFileSelect}
                    accept={acceptedFileTypes}
                />
                <div className="flex flex-col items-center justify-center space-y-2 text-gray-400">
                    <UploadIcon className="w-8 h-8"/>
                    {file ? (
                        <p className="font-semibold text-cyan-300">{file.name}</p>
                    ) : (
                        <div>
                            <p className="font-semibold">{dropzoneText}</p>
                            <p className="text-sm">or click to browse</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
