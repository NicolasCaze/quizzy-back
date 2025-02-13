import { Injectable } from '@nestjs/common';
import {
  getFirestore,
  collection,
  addDoc,
  getDoc,
  doc,
  updateDoc
} from 'firebase/firestore';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class QuizzService {
  private db;

  constructor(private readonly firebaseService: FirebaseService) {
    this.db = getFirestore();
  }

  // Création d'un questionnaire
  async createQuiz(title: string, userId: string) {
    const quizRef = await addDoc(collection(this.db, 'quizzes'), {
      title,
      userId,
      createdAt: new Date(),
      isActive: false,
    });
    return { id: quizRef.id, title, userId };
  }

  // Ajout d'une question à un questionnaire
  async addQuestion(quizId: string, questionText: string, options: string[], correctOption: number) {
    const questionRef = await addDoc(collection(this.db, `quizzes/${quizId}/questions`), {
      questionText,
      options,
      correctOption,
    });
    return { id: questionRef.id, questionText };
  }

  // Lancer un questionnaire
  async launchQuiz(quizId: string) {
    const quizRef = doc(this.db, `quizzes/${quizId}`);
    await updateDoc(quizRef, { isActive: true });
    return { quizId, status: 'Launched' };
  }

  // Rejoindre un questionnaire
  async joinQuiz(quizId: string, userId: string) {
    const quizSnapshot = await getDoc(doc(this.db, `quizzes/${quizId}`));
    if (!quizSnapshot.exists()) {
      throw new Error('Quiz not found');
    }
    await addDoc(collection(this.db, `quizzes/${quizId}/participants`), { userId });
    return { quizId, userId, status: 'Joined' };
  }
}