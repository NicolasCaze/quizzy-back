import { Injectable } from '@nestjs/common';
import {
  getFirestore,
  collection,
  addDoc,
  getDoc,
  doc,
  updateDoc
} from 'firebase/firestore';
import { FirebaseService } from '../../firebase/firebase.service';
import { QuizzRepository } from '../repository/quizz.repository';

@Injectable()
export class QuizzService {
  private db;

  constructor(private firebaseService: FirebaseService, private quizzRepository: QuizzRepository) {
    this.db = this.firebaseService['db'];
  }

  // Création d'un questionnaire
  async createQuiz(title: string, description: string, uid : string) {
    return this.quizzRepository.createQuiz({ title, description, uid });
  }

  //Récuperer des questionnaires liés à un utilisateur
  async getQuizzes(userId: string) {
    return this.quizzRepository.getQuizzes(userId);
  }
}