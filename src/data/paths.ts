import { collection, doc } from 'firebase/firestore';
import { db } from '../firebase';

// Everything lives under users/{uid}; the rules lock that tree to the owner.
export const settingsDoc = (uid: string) => doc(db, 'users', uid, 'settings', 'main');
export const scrapsCol = (uid: string) => collection(db, 'users', uid, 'scraps');
export const scrapDoc = (uid: string, id: string) => doc(db, 'users', uid, 'scraps', id);
export const photosCol = (uid: string) => collection(db, 'users', uid, 'photos');
export const photoDoc = (uid: string, id: string) => doc(db, 'users', uid, 'photos', id);
export const pageDoc = (uid: string, day: string) => doc(db, 'users', uid, 'pages', day);
