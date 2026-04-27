import { suite, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Home from '@/app/page';

suite('Home', () => {
  test('見出しを表示する', () => {
    render(<Home />);
    expect(screen.getByRole('heading', { name: 'CBT 思考記録' })).toBeInTheDocument();
  });
});
