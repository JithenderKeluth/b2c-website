import { CurrencyCodePipe } from './currency-code.pipe';

describe('CurrencyCodePipe', () => {
  it('create an instance', () => {
    const pipe = new CurrencyCodePipe();
    expect(pipe).toBeTruthy();
  });
});
