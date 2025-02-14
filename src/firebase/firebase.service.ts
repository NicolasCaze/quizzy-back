import { Injectable, OnModuleInit } from '@nestjs/common';
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  getDoc,
  doc,
} from 'firebase/firestore';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private app;
  private db;

  onModuleInit() {
    this.app = initializeApp({
      apiKey: 'AIzaSyCMH0ikwHKgS9wxQF2H7P82vGg11R2vSsA',
      authDomain: 'quizzy-ekip4.firebaseapp.com',
      projectId: 'quizzy-ekip4',
      storageBucket: 'quizzy-ekip4.firebasestorage.app',
      messagingSenderId: '986228852993',
      appId: '1:986228852993:web:de548460c79864ff85f300',
    });

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
