import { Inject, Injectable } from '@nestjs/common';
import { FirebaseService } from '../../firebase/firebase.service';
import { FirebaseAdmin, FirebaseConstants } from 'nestjs-firebase';


@Injectable()
export class QuizzRepository {
  private db;

  constructor(@Inject( FirebaseConstants.FIREBASE_TOKEN) private readonly fa: FirebaseAdmin) {
    this.db = this.fa.firestore;
  }

  async createQuiz(title: string, description: string, userId: string) {
    try {
      const quizDocRef = this.fa.firestore.collection('quiz').doc();
      const uid = quizDocRef.id;
      await quizDocRef.set({ title, description, userId }, { merge: true });
      console.log("Created");
  
      return { id: uid, message: 'Quiz created successfully' };
    } catch (error) {
      throw new Error(`Erreur lors de la création du quiz : ${error.message}`);
    }
  }

  async getQuizzes(userId: string) {
    const quizRef = this.db.collection('quizzes').where('uid', '==', userId);
    const query = await quizRef.get();
    const quizzes = query.docs.map((doc) => ({ id: doc.id, title: doc.data().title }));
    return { data: quizzes };
  }

}