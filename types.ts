export interface Step {
  step_id: string;
  command: string;
  analogy: string;
  explanation: string;
  task: string;
  input_code: string;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  commands_covered: string[];
  steps: Step[];
}

export interface PlaygroundData {
  playground_meta: {
    title: string;
    description: string;
    difficulty: string;
    total_levels: number;
  };
  modules: Module[];
}

export type RedisValueType = 'string' | 'list' | 'set' | 'hash';

export interface RedisEntry {
  type: RedisValueType;
  value: any;
  ttl?: number; // Time to live in seconds (static snapshot)
  expiresAt?: number; // Timestamp when entry should expire
  createdAt: number;
}

export type RedisStore = Record<string, RedisEntry>;

export interface CommandResult {
  success: boolean;
  output: string;
  newStore?: RedisStore;
}