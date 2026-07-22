import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Unmount komponen setelah tiap test
afterEach(() => {
  cleanup();
});
