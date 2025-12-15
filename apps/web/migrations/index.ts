import * as migration_20251215_232750_initial from './20251215_232750_initial';

export const migrations = [
  {
    up: migration_20251215_232750_initial.up,
    down: migration_20251215_232750_initial.down,
    name: '20251215_232750_initial'
  },
];
