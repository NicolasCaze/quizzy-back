import { Inject, Injectable } from '@nestjs/common';
import { FirebaseService } from '../../firebase/firebase.service';
import { FirebaseAdmin, FirebaseConstants } from 'nestjs-firebase';


@Injectable()
export class QuizzRepository {
  private db;

  constructor(@Inject( FirebaseConstants.FIREBASE_TOKEN) private readonly fa: FirebaseAdmin) {
    this.db = this.fa.firestore;
  }

  async createQuiz(data: { title: string; description: string; uid: string }) {
    // const quizRef = await this.fa.firestore.addDoc(this.fa.firestore.collection('quizzes'), {
    //   ...data,
    //   createdAt: new Date(),
    //   isActive: false,
    // });
    // return { id: quizRef.id, ...data };
  }

  async getQuizzes(userId: string) {
    const quizRef = this.db.collection('quizzes').where('uid', '==', userId);
    const query = await quizRef.get();
    const quizzes = query.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return quizzes;
  }

}