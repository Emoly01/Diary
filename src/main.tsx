import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// Self-hosted: no requests to Google Fonts. Only the weights REDESIGN.md names,
// and only the Latin subsets, so the offline cache stays small.
import '@fontsource/cormorant-garamond/latin-500.css';
import '@fontsource/cormorant-garamond/latin-ext-500.css';
import '@fontsource/cormorant-garamond/latin-500-italic.css';
import '@fontsource/cormorant-garamond/latin-ext-500-italic.css';
import '@fontsource/cormorant-garamond/latin-600.css';
import '@fontsource/cormorant-garamond/latin-ext-600.css';
import '@fontsource/cormorant-garamond/latin-600-italic.css';
import '@fontsource/cormorant-garamond/latin-ext-600-italic.css';
import '@fontsource/cormorant-garamond/latin-700.css';
import '@fontsource/cormorant-garamond/latin-ext-700.css';
import '@fontsource/cormorant-garamond/latin-700-italic.css';
import '@fontsource/cormorant-garamond/latin-ext-700-italic.css';
import '@fontsource/newsreader/latin-400.css';
import '@fontsource/newsreader/latin-ext-400.css';
import '@fontsource/newsreader/latin-400-italic.css';
import '@fontsource/newsreader/latin-ext-400-italic.css';
import '@fontsource/newsreader/latin-500.css';
import '@fontsource/newsreader/latin-ext-500.css';
import '@fontsource/newsreader/latin-500-italic.css';
import '@fontsource/newsreader/latin-ext-500-italic.css';
import '@fontsource/newsreader/latin-600.css';
import '@fontsource/newsreader/latin-ext-600.css';
import '@fontsource/newsreader/latin-600-italic.css';
import '@fontsource/newsreader/latin-ext-600-italic.css';
import '@fontsource/ibm-plex-mono/latin-400.css';
import '@fontsource/ibm-plex-mono/latin-ext-400.css';
import '@fontsource/ibm-plex-mono/latin-500.css';
import '@fontsource/ibm-plex-mono/latin-ext-500.css';
import './styles/tokens.css';
import './styles/global.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
