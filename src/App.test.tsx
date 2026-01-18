import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App', () => {
  it('renders the Keel title', () => {
    render(<App />);
    expect(screen.getByText('Keel')).toBeInTheDocument();
  });

  it('renders the tagline', () => {
    render(<App />);
    expect(screen.getByText('Daily warship guessing game')).toBeInTheDocument();
  });
});
