import { Injectable, OnModuleInit } from '@nestjs/common';
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  getDoc,
  doc,
} from 'firebase/firestore';
import { firebaseConfig } from '../config/firebase_const';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private app;
  private db;

  onModuleInit() {
    this.app = initializeApp(firebaseConfig);

    this.db = getFirestore(this.app);
  }

  async addUser(data: { name: string; email: string; password: string }) {
    try {
      const docRef = await addDoc(collection(this.db, 'users'), data);
      return { id: docRef.id, ...data };
    } catch (error) {
      throw new Error(`Erreur lors de l'ajout : ${error.message}`);
    }
  }

  async getUser(userId: string) {
    try {
      const docRef = doc(this.db, 'users', userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        throw new Error('Utilisateur non trouvé');
      }
    } catch (error) {
      throw new Error(`Erreur lors de la récupération : ${error.message}`);
    }
  }
}
