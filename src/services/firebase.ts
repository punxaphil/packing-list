import { getFirestore } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  // This is the public key (used client side in browser), so it's safe to be here
  apiKey: 'AIzaSyBB37kGiEQ2NBhHf9voJ6ugGRkUIyaOYAE',
  authDomain: 'packing-list-448814.firebaseapp.com',
  projectId: 'packing-list-448814',
  storageBucket: 'packing-list-448814.firebasestorage.app',
  messagingSenderId: '831855277007',
  appId: '1:831855277007:web:a09c7bd0ed58b51ea8d8ba',
};

const app = initializeApp(firebaseConfig);
export const firestore = getFirestore(app);
