import { useState } from 'react';
import { ClueCard } from './ClueCard';
import './PhotoReveal.css';

export interface PhotoRevealProps {
  /** URL of the ship photo */
  photoUrl: string;
  /** Ship name for alt text */
  shipName: string;
  /** Whether the photo is revealed */
  revealed: boolean;
  /** Additional CSS class name */
  className?: string;
}

/**
 * PhotoReveal displays the original ship photograph (Turn 5).
 * Loads from Wikimedia Commons URL with loading state handling.
 */
export function PhotoReveal({
  photoUrl,
  shipName,
  revealed,
  className = '',
}: PhotoRevealProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <ClueCard
      title="Historical Photo"
      variant="photo"
      revealed={revealed}
      className={className}
    >
      <div className="photo-reveal">
        {hasError ? (
          <div className="photo-reveal__error">
            <p>Failed to load photo</p>
            <a
              href={photoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="photo-reveal__link"
            >
              View on Wikimedia Commons
            </a>
          </div>
        ) : (
          <>
            {isLoading && (
              <div className="photo-reveal__loading" aria-label="Loading photo">
                <div className="photo-reveal__spinner" />
              </div>
            )}
            <img
              src={photoUrl}
              alt={`Historical photograph of ${shipName}`}
              className={`photo-reveal__image ${isLoading ? 'photo-reveal__image--loading' : ''}`}
              onLoad={handleLoad}
              onError={handleError}
            />
          </>
        )}
        <p className="photo-reveal__caption">{shipName}</p>
      </div>
    </ClueCard>
  );
}
