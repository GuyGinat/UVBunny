export interface Bunny {
  id?: string;
  name: string;
  avatarUrl?: string;
  happiness?: number; // 0-100 for now
}

export interface BunnyEvent {
  id?: string;
  type: 'eating' | 'playing';
  timestamp: number;
  details: {
    foodType?: 'lettuce' | 'carrot';
    playmateId?: string;
  };
  happinessDelta: number;
  bunnyId: string;
} 