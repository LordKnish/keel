import './Silhouette.css';

export interface SilhouetteProps {
  /** Base64-encoded image source (data:image/png;base64,...) */
  src: string;
  /** Alt text for accessibility */
  alt?: string;
  /** Additional CSS class name */
  className?: string;
}

/**
 * Silhouette component displays the ship line art on a dark background.
 * This is the core visual shown on Turn 1.
 */
export function Silhouette({
  src,
  alt = 'Ship silhouette',
  className = '',
}: SilhouetteProps) {
  return (
    <div className={`silhouette ${className}`.trim()}>
      <img
        src={src}
        alt={alt}
        className="silhouette__image"
        draggable={false}
      />
    </div>
  );
}
