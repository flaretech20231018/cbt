import { vi, suite, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Home from '@/app/page';

vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn().mockResolvedValue({ userId: null }),
}));

suite('Home', () => {
  test('見出しを表示する', async () => {
    render(await Home());
    expect(screen.getByRole('heading', { name: 'CBT 思考記録' })).toBeInTheDocument();
  });
});
