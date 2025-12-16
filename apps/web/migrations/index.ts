import * as migration_20251215_232750_initial from './20251215_232750_initial';
import * as migration_20251216_214900 from './20251216_214900';

export const migrations = [
  {
    up: migration_20251215_232750_initial.up,
    down: migration_20251215_232750_initial.down,
    name: '20251215_232750_initial',
  },
  {
    up: migration_20251216_214900.up,
    down: migration_20251216_214900.down,
    name: '20251216_214900'
  },
];
