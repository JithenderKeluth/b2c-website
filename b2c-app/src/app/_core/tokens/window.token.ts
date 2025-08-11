import { InjectionToken } from '@angular/core';

export const WINDOW = new InjectionToken<Window>('WindowToken', {
  factory: () => (typeof window !== 'undefined' ? window : {} as any),
});
