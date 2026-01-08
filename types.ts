
export enum VideoTone {
  PROVOCATIVE = 'provocativo',
  INFORMATIVE = 'informativo',
  EMOTIONAL = 'emocional',
  POLEMIC = 'polêmico',
  MOTIVATIONAL = 'motivacional'
}

export enum VideoGoal {
  ENGAGE = 'engajar',
  BIO_LINK = 'levar para link da bio',
  SELL = 'vender',
  LEADS = 'captar leads'
}

export enum AudienceType {
  BEGINNER = 'iniciante',
  FAN = 'fã de futebol',
  BETTOR = 'apostador',
  SPECIFIC_FAN = 'torcedor específico'
}

export interface ScriptRequest {
  topic: string;
  goal: VideoGoal;
  audience: AudienceType;
  tone: VideoTone;
}

export interface GeneratedScript {
  fullScript: string;
  hook: string;
  body: string;
  cta: string;
  sources: { title: string; uri: string }[];
}

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
}
