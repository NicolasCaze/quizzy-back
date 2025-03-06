import { Inject, Injectable } from '@nestjs/common';
import { FirebaseAdmin, FirebaseConstants } from 'nestjs-firebase';

export interface UserData {
  username: string;
}


@Injectable()
export class UserService {
  constructor(@Inject(FirebaseConstants.FIREBASE_TOKEN) private readonly fa: FirebaseAdmin) {}

  private getUserRef(uid: string) {
    return this.fa.firestore.collection('users').doc(uid);
  }

  async addUser(uid: string, username: string): Promise<{ message: string }> {
    try {
      await this.getUserRef(uid).set({ username }, { merge: true });
      return { message: 'User created successfully' };
    } catch (error) {
      throw new Error(`Erreur lors de l'ajout de l'utilisateur : ${error.message}`);
    }
  }

  async getUser(uid: string): Promise<UserData & { uid: string }> {
    try {
      const docSnap = await this.getUserRef(uid).get();
      if (!docSnap.exists) {
        throw new Error('Utilisateur non trouvé');
      }
      return { uid, ...docSnap.data() as UserData };
    } catch (error) {
      throw new Error(`Erreur lors de la récupération de l'utilisateur : ${error.message}`);
    }
  }
}
