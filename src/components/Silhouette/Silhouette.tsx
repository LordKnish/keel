import { useState } from 'react';
import './Silhouette.css';

export interface SilhouetteProps {
  /** Base64-encoded image source (data:image/png;base64,...) */
  src: string;
  /** Alt text for accessibility */
  alt?: string;
  /** URL of historical photo to reveal */
  photoUrl?: string;
  /** Ship name for photo alt text */
  shipName?: string;
  /** Whether to reveal the photo */
  showPhoto?: boolean;
  /** Additional CSS class name */
  className?: string;
}

/**
 * Silhouette component displays the ship line art on a dark background.
 * This is the core visual shown on Turn 1.
 * When showPhoto is true, the historical photo fades in to replace the line art.
 */
export function Silhouette({
  src,
  alt = 'Ship silhouette',
  photoUrl,
  shipName,
  showPhoto = false,
  className = '',
}: SilhouetteProps) {
  const [photoLoaded, setPhotoLoaded] = useState(false);

  return (
    <div className={`silhouette ${className}`.trim()}>
      <img
        src={src}
        alt={alt}
        className={`silhouette__image ${showPhoto && photoLoaded ? 'silhouette__image--hidden' : ''}`}
        draggable={false}
      />
      {photoUrl && showPhoto && (
        <img
          src={photoUrl}
          alt={shipName ? `Historical photograph of ${shipName}` : 'Historical photograph'}
          className={`silhouette__photo ${photoLoaded ? 'silhouette__photo--visible' : ''}`}
          onLoad={() => setPhotoLoaded(true)}
          draggable={false}
        />
      )}
    </div>
  );
}
