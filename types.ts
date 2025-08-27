
export interface SubtitleBlock {
  id: number;
  startTime: string;
  endTime: string;
  text: string;
}

export enum TranslationStyle {
  Formal = 'Formal',
  Informal = 'Informal',
  Neutral = 'Neutral',
  Technical = 'Technical',
}

export enum AppMode {
  Translate = 'Translate SRT',
  Transcribe = 'Transcribe Video',
}
