import { CardFormatterPipe } from './card-formatter.pipe';

describe('CardFormatterPipe', () => {
  it('create an instance', () => {
    const pipe = new CardFormatterPipe();
    expect(pipe).toBeTruthy();
  });
});
