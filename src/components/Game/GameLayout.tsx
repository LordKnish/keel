import type { ReactNode } from 'react';
import './GameLayout.css';

export interface GameLayoutProps {
  /** Content for the header area */
  header?: ReactNode;
  /** Content for the silhouette area */
  silhouette: ReactNode;
  /** Content for the turn indicator */
  turnIndicator: ReactNode;
  /** Content for the clues area */
  clues: ReactNode;
  /** Content for the footer/search area */
  footer?: ReactNode;
  /** Additional CSS class name */
  className?: string;
}

/**
 * GameLayout provides the main structure for the game UI.
 * Mobile-first responsive layout with:
 * - Header (title)
 * - Silhouette display
 * - Turn indicator
 * - Clues stack
 * - Footer (search input placeholder)
 */
export function GameLayout({
  header,
  silhouette,
  turnIndicator,
  clues,
  footer,
  className = '',
}: GameLayoutProps) {
  return (
    <div className={`game-layout ${className}`.trim()}>
      {header && <header className="game-layout__header">{header}</header>}

      <main className="game-layout__main">
        <section className="game-layout__silhouette" aria-label="Ship silhouette">
          {silhouette}
        </section>

        <div className="game-layout__turn-indicator">{turnIndicator}</div>

        <section className="game-layout__clues" aria-label="Clues">
          {clues}
        </section>
      </main>

      {footer && <footer className="game-layout__footer">{footer}</footer>}
    </div>
  );
}
