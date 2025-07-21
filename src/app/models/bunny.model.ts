export interface Bunny {
  id?: string;
  name: string;
  avatarUrl?: string;
}

export interface BunnyEvent {
  id?: string;
  type: 'eating' | 'playing';
  timestamp: number;
  details: {
    foodType?: 'lettuce' | 'carrot';
    playmateId?: string;
  };
} 