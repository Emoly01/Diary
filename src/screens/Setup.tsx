import Cover from '../components/Cover';
import './Gate.css';

/** Shown when the VITE_FIREBASE_* env vars are missing from the build. */
export default function Setup() {
  return (
    <main className="gate">
      <Cover />
      <div className="gate-copy">
        <h1>Almost there.</h1>
        <p>
          The Firebase settings are missing from this build. Add the VITE_FIREBASE_* variables
          (see .env.example) and deploy again.
        </p>
      </div>
    </main>
  );
}
