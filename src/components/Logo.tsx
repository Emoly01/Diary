import { Link } from 'react-router-dom';
import Sparkle from './stickers/Sparkle';

export default function Logo({ size = 'lg' }: { size?: 'lg' | 'sm' }) {
  return (
    <Link to="/" className={`logo logo-${size}`}>
      <span className="logo-badge" aria-hidden="true">
        <Sparkle size={size === 'lg' ? 20 : 16} />
      </span>
      <span className="logo-word">Daybook</span>
    </Link>
  );
}
