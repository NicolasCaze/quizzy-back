import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../../firebase/firebase.service';
import { QuizzRepository } from '../repository/quizz.repository';

@Injectable()
export class QuizzService {
  private db;

  constructor(private firebaseService: FirebaseService, private quizzRepository: QuizzRepository) {
    this.db = this.firebaseService['db'];
  }

  // Création d'un questionnaire
  async createQuiz(title: string, description: string, userId: string) {
   return this.quizzRepository.createQuiz(title, description, userId);
  }

  //Récuperer des questionnaires liés à un utilisateur
  async getQuizzes(userId: string) {
    return this.quizzRepository.getQuizzes(userId);
  }

  async getQuizById(quizId: string, userId: string): Promise<any> {
    const quiz = await this.quizzRepository.getQuizById(quizId, userId);
    return quiz;
  }
}