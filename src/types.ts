export interface TraitAnalysis {
  trait: string;
  value: number;
  explanation: string;
}

export interface ProfileAnalysis {
  traits: TraitAnalysis[];
  communicationStyle: string;
  interests: string[];
  strengths: string[];
  vibe: string;
  funFacts: string[];
  metrics: {
    socialEnergy: number;
    humor: number;
    charisma: number;
    mystery: number;
  };
}

export interface ProfileData {
  id: string;
  name: string;
  instagram: string;
  tiktok?: string;
  twitter?: string;
  description: string;
  imageUrl: string; // url or base64
  createdAt: string | any; // Timestamp or ISO string
  userId: string;
  likesCount: number;
  metrics: {
    socialEnergy: number;
    humor: number;
    charisma: number;
    mystery: number;
  };
  analysis: ProfileAnalysis;
  reactions?: {
    haha: number;
    spotOn: number;
    fire: number;
  };
}

export interface UserStats {
  totalAnalyzed: number;
  totalLikes: number;
  vibeDistribution: Record<string, number>;
}
