import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../../firebase/firebase.service';
import {
  collection,
  addDoc,
  getDoc,
  doc,
} from 'firebase/firestore';

@Injectable()
export class QuizzRepository {
  private db;

  constructor(private firebaseService: FirebaseService) {
    this.db = this.firebaseService['db'];
  }

  async createQuiz(data: { title: string; description: string; uid: string }) {
    const quizRef = await addDoc(collection(this.db, 'quizzes'), {
      ...data,
      createdAt: new Date(),
      isActive: false,
    });
    return { id: quizRef.id, ...data };
  }

  async getQuizzes(userId: string) {
    const quizRef = collection(this.db, 'quizzes');
    const query = await getDoc(doc(quizRef, userId));
    return query.data();
  }

}