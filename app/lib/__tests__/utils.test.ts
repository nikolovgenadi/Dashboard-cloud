import { formatCurrency } from '../utils';

describe('formatCurrency', () => {
  it('should format currency correctly', () => {
    expect(formatCurrency(1000)).toBe('$10.00');
    expect(formatCurrency(500)).toBe('$5.00');
    expect(formatCurrency(0)).toBe('$0.00');
  });
});
