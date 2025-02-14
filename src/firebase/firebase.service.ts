import { Inject, Injectable} from '@nestjs/common';
import { FirebaseAdmin, FirebaseConstants } from 'nestjs-firebase';

@Injectable()
export class FirebaseService {
  constructor(@Inject( FirebaseConstants.FIREBASE_TOKEN) private readonly fa: FirebaseAdmin) {}

  async addUser(uid: string, username: string) {
    try {
      const userDocRef = this.fa.firestore.collection('users').doc(uid);
      await userDocRef.set({ username }, { merge: true });

      return { message: 'User created successfully' };
    } catch (error) {
      throw new Error(`Erreur lors de l'ajout de l'utilisateur : ${error.message}`);
    }
  }

  async getUser(uid: string) {
    try {
      const userDocRef = this.fa.firestore.collection('users').doc(uid);
      const docSnap = await userDocRef.get();

      if (!docSnap.exists) {
        throw new Error('Utilisateur non trouvé');
      }

      return { uid, ...docSnap.data() };
    } catch (error) {
      throw new Error(`Erreur lors de la récupération de l'utilisateur : ${error.message}`);
    }
  }
}
