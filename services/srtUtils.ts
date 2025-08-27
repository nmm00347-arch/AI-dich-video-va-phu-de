
import { SubtitleBlock } from '../types';

export const parseSrt = (srtContent: string): SubtitleBlock[] => {
    const blocks = srtContent.trim().split(/\n\n/);
    return blocks.map(block => {
        const lines = block.split(/\n/);
        const id = parseInt(lines[0], 10);
        const [startTime, endTime] = lines[1].split(' --> ');
        const text = lines.slice(2).join('\n');
        return { id, startTime, endTime, text };
    }).filter(b => !isNaN(b.id)); // Filter out any invalid blocks
};

export const stringifySrt = (blocks: SubtitleBlock[]): string => {
    return blocks.map(block => {
        return `${block.id}\n${block.startTime} --> ${block.endTime}\n${block.text}`;
    }).join('\n\n');
};
