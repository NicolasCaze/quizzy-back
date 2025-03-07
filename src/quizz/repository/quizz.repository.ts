import { Injectable, Inject, Logger } from '@nestjs/common';
import { FirebaseAdmin, FirebaseConstants } from 'nestjs-firebase';
import QuizData from '../interface/quizData';
import QuestionData from '../interface/questionData';

@Injectable()
export class QuizzRepository {
  private db;
  private readonly logger = new Logger(QuizzRepository.name);

  constructor(
    @Inject(FirebaseConstants.FIREBASE_TOKEN)
    private readonly fa: FirebaseAdmin,
  ) {
    this.db = this.fa.firestore;
  }

  async createQuiz(title: string, description: string, userId: string): Promise<{ id: string; message: string }> {
    try {
      const quizDocRef = this.db.collection('quiz').doc();
      const uid = quizDocRef.id;
      await quizDocRef.set({ title, description, userId }, { merge: true });

      this.logger.log('Quiz created successfully');
      return { id: uid, message: 'Quiz created successfully' };
    } catch (error) {
      throw new Error(`Erreur lors de la création du quiz : ${error.message}`);
    }
  }

  async getQuizzes(userId: string): Promise<{ data: { id: string; title: string }[] }> {
    const query = await this.db.collection('quiz').where('userId', '==', userId).get();
    return { data: query.docs.map(doc => ({ id: doc.id, title: doc.data().title })) };
  }

  async getQuizById(quizId: string, userId: string): Promise<false | (QuizData & { id: string; questions: QuestionData[] })> {
    const quizSnap = await this.getQuizSnap(quizId);

    if (!quizSnap?.exists || quizSnap.data().userId !== userId) {
      return false;
    }

    const questionsSnap = await this.getQuizRef(quizId).collection('questions').get();
    return {
      id: quizSnap.id,
      ...quizSnap.data(),
      questions: questionsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })),
    };
  }

  async updateQuizTitle(id: string, newTitle: string): Promise<void> {
    await this.getQuizRef(id).update({ title: newTitle });
  }

  async addQuestionToQuiz(quizId: string, questionData: QuestionData): Promise<string> {
    const questionDocRef = this.getQuizRef(quizId).collection('questions').doc();
    await questionDocRef.set(questionData);
    return questionDocRef.id;
  }

  async updateQuestion(quizId: string, questionId: string, userId: string, questionData: QuestionData): Promise<boolean> {
    const quizSnap = await this.getQuizSnap(quizId);

    if (!quizSnap?.exists || quizSnap.data().userId !== userId) {
      return false;
    }

    const questionRef = this.getQuizRef(quizId).collection('questions').doc(questionId);
    if (!(await questionRef.get()).exists) {
      return false;
    }

    await questionRef.update(questionData);
    return true;
  }

  async startQuizExecution(quizId: string, userId: string): Promise<string> {
    const quizSnap = await this.getQuizById(quizId, userId);
    if (!quizSnap || !quizSnap.questions.length) {
      throw new Error('Quiz is not ready to be started');
    }
    

    const executionId = this.generateExecutionId();
    await this.db.collection('executions').doc(executionId).set({
      quizId,
      startedAt: new Date(),
      status: 'active',
    });

    return executionId;
  }

  private generateExecutionId(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from({ length: 6 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
  }

  private getQuizRef(quizId: string) {
    return this.db.collection('quiz').doc(quizId);
  }

  private async getQuizSnap(quizId: string) {
    return this.getQuizRef(quizId).get();
  }
}
