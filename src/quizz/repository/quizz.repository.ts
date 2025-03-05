import { ForbiddenException, Inject, Injectable, Logger } from '@nestjs/common';
import { FirebaseAdmin, FirebaseConstants } from 'nestjs-firebase';

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

  async createQuiz(title: string, description: string, userId: string) {
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

  async getQuizzes(userId: string) {
    const query = await this.db
      .collection('quiz')
      .where('userId', '==', userId)
      .get();
    if (query.empty) {
      return { data: [] }; // Aucun quiz trouvé
    }
    return {
      data: query.docs.map((doc) => ({ id: doc.id, title: doc.data().title })),
    };
  }

  async getQuizById(quizId: string, userId: string){
    const quizRef = this.getQuizRef(quizId);
    const quizSnap = await quizRef.get();

    if (!quizSnap.exists) {
      return false; // Quiz n'existe pas
    }

    if (quizSnap.data().userId !== userId) {
      return false; // L'utilisateur n'est pas propriétaire
    }
    // Récupérer les questions du quiz
    const questionsRef = quizRef.collection('questions');
    const questionsSnap = await questionsRef.get();

    const questions = questionsSnap.docs.map((doc) => ({
      id: doc.id,
      title: doc.data().title,
      answers: doc.data().answers || [], // Si pas de réponses, on renvoie un tableau vide
    }));
    return { id: quizSnap.id, ...quizSnap.data(), questions };
  }

  async updateQuizTitle(id: string, newTitle: string) {
    const quizDocRef = this.getQuizRef(id);

    await quizDocRef.update({ title: newTitle });
  }

  async addQuestionToQuiz(
    quizId: string,
    questionData: {
      title: string;
      answers: { title: string; isCorrect: boolean }[];
    },
  ) {
    const quizDocRef = this.getQuizRef(quizId);
    const questionDocRef = quizDocRef.collection('questions').doc(); // Crée un nouvel ID pour la question

    await questionDocRef.set(questionData);

    return questionDocRef.id;
  }

  async updateQuestion(
    quizId: string,
    questionId: string,
    userId: string,
    questionData: {
      title: string;
      answers: { title: string; isCorrect: boolean }[];
    },
  ) {
    const quizRef = this.getQuizRef(quizId);
    const quizSnap = await quizRef.get();

    if (!quizSnap.exists) {
      return false; // Quiz n'existe pas
    }

    if (quizSnap.data().userId !== userId) {
      return false; // L'utilisateur n'est pas propriétaire
    }

    // Référence à la question dans la sous-collection
    const questionRef = quizRef.collection('questions').doc(questionId);
    const questionSnap = await questionRef.get();

    if (!questionSnap.exists) {
      return false; // Question n'existe pas
    }

    // Mise à jour de la question
    await questionRef.update({
      title: questionData.title,
      answers: questionData.answers,
    });

    return true;
  }

  async startQuizExecution(
    quizId: string,
    userId: string,
  ){
    const quizSnap = await this.getQuizById(quizId, userId);

    if (!quizSnap.questions || quizSnap.questions.length === 0) {
      throw new Error('Quiz is not ready to be started');
    }

    const executionId = this.generateExecutionId();

    // Création de l'exécution du quiz
    const executionRef = this.db.collection('executions').doc(executionId);
    await executionRef.set({
      quizId,
      startedAt: new Date(),
      status: 'active', // Peut être "active", "finished", etc.
    });

    return executionId;
  }

  private generateExecutionId(): string {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from({ length: 6 }, () =>
      chars.charAt(Math.floor(Math.random() * chars.length)),
    ).join('');
  }

  //  Méthodes Helpers pour éviter la répétition
  private getQuizRef(quizId: string) {
    return this.db.collection('quiz').doc(quizId);
  }
}