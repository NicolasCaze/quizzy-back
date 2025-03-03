import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../../firebase/firebase.service';
import { Firestore } from '@google-cloud/firestore';

@Injectable()
export class QuizzRepository {
  private db;

  constructor(private firebaseService: FirebaseService) {
    this.db = this.firebaseService['db'];
  }

  async createQuiz(data: { title: string; description: string; uid: string }) {
    /*const quizRef = await addDoc(collection(this.db, 'quizzes'), {
      ...data,
      createdAt: new Date(),
      isActive: false,
    });
    return { id: quizRef.id, ...data };*/
  }

  async getQuizzes(userId: string) {
    const quizRef = this.db.collection(this.db, 'quizzes');
    const query = await this.db.getDoc(this.db.doc(quizRef, userId));
    return query.data();
  }

}