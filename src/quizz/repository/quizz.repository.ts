import { Inject, Injectable } from '@nestjs/common';
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
    const quizRef = this.db.collection('quiz').where('userId', '==', userId);
    const query = await quizRef.get(); 
    if (query.empty) {
      console.log("No quizzes found for user:", userId);
      return { data: [] }; // Aucun quiz trouvé
    }
    const quizzes = query.docs.map((doc) => ({
      id: doc.id,
      title: doc.data().title,
    }));
  
    return { data: quizzes };
  }
  
  async getQuizById(quizId: string, userId: string): Promise<any> {
  const quizRef = this.db.collection('quiz').doc(quizId);
  const quizSnap = await quizRef.get();

  if (!quizSnap.exists) {
    return null; // Quiz n'existe pas
  }
  const quizData = quizSnap.data();
  if (quizData.userId !== userId) {
    return null; // Quiz n'appartient pas à l'utilisateur
  }
    // Récupérer les questions du quiz
    const questionsRef = quizRef.collection('questions');
    const questionsSnap = await questionsRef.get();
  
    const questions = questionsSnap.docs.map(doc => ({
      id: doc.id,
      title: doc.data().title,
      answers: doc.data().answers || [] // Si pas de réponses, on renvoie un tableau vide
    }));
  return { id: quizSnap.id, ...quizSnap.data(), questions };
  }


  async updateQuizTitle(id: string, newTitle: string) {
    const quizDocRef = this.db.collection('quiz').doc(id);
    
    await quizDocRef.update({ title: newTitle });
  }

  async addQuestionToQuiz(quizId: string, questionData: { title: string; answers: { title: string; isCorrect: boolean }[] }) {
    const quizDocRef = this.db.collection('quiz').doc(quizId);
    const questionDocRef = quizDocRef.collection('questions').doc(); // Crée un nouvel ID pour la question
  
    await questionDocRef.set(questionData);
    
    return questionDocRef.id;
  }

  async updateQuestion(quizId: string, questionId: string, userId: string, questionData: { title: string; answers: { title: string; isCorrect: boolean; }[]; }) {
    const quizRef = this.db.collection('quiz').doc(quizId);
    const quizSnap = await quizRef.get();

    if (!quizSnap.exists) {
      return false; // Quiz n'existe pas
    }

    const quizData = quizSnap.data();
    if (quizData.userId !== userId) {
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
      answers: questionData.answers
    });

    return true;
  }

  async startQuizExecution(quizId: string, userId: string): Promise<string | null> {
    const quizSnap =  await this.getQuizById(quizId, userId);
    console.log("quizSnap", quizSnap);

     if (!quizSnap.questions || quizSnap.questions.length === 0) {
       throw new Error("Quiz is not ready to be started");
     }

    const executionId = this.generateExecutionId();

    // Création de l'exécution du quiz
    const executionRef = this.db.collection('executions').doc(executionId);
    await executionRef.set({
      quizId,
      startedAt: new Date(),
      status: 'active' // Peut être "active", "finished", etc.
    });

    return executionId;
  }

  
  private generateExecutionId(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from({ length: 6 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
  }
}