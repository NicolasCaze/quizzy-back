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
  
  async getQuizByIdForTitle(id: string) {
    const quizDocRef = this.db.collection('quiz').doc(id);
    const docSnap = await quizDocRef.get();

    if (!docSnap.exists) {
      throw new Error('Quiz not found');
    }

    return { id: docSnap.id, ...docSnap.data() };
  }
  
  async getQuizById(quizId: string, userId: string): Promise<any> {
  const quizRef = this.db.collection('quiz').doc(quizId);
  const quizSnap = await quizRef.get();

  if (!quizSnap.exists) {
    return null; // Quiz n'existe pas
  }
  const quizData = quizSnap.data();
  if (quizData.userId !== userId) {
    return null; // L'utilisateur n'est pas propriétaire
  }
  return {
    title: quizData.title,
    description: quizData.description,
    questions: quizData.questions || [], // Par défaut, un tableau vide si aucune question
  };
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
  

}