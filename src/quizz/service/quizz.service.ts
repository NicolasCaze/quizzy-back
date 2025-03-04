import { ForbiddenException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
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

  async getQuizzes(userId: string, baseUrl: string) {
    const quizzes = await this.quizzRepository.getQuizzes(userId);

    const quizzesWithLinks = await Promise.all(quizzes.data.map(async quiz => {
        const isStartable = await this.isQuizStartable(quiz.id, userId);
        return {
            ...quiz,
            _links: {
                ...(isStartable ? { start: `${baseUrl}/api/quiz/${quiz.id}/start` } : {})
            }
        };
    }));

    return {
        data: quizzesWithLinks,
        _links: {
            create: `${baseUrl}/api/quiz`
        }
    };
}


// Fonction pour vérifier si un quiz peut être démarré
private async isQuizStartable(quizId: string, userId: string): Promise<boolean> {
  const quiz = await this.quizzRepository.getQuizById(quizId, userId);

  console.log(`Checking quiz startability: ${quizId}`);
  if (!quiz) {
      console.log("Quiz not found");
      return false;
  }
  if (!quiz.title) {
      console.log("Quiz title is empty");
      return false;
  }
  if (!quiz.questions || quiz.questions.length === 0) {
      console.log("No questions in the quiz");
      return false;
  }

  for (const question of quiz.questions) {
      if (!question.title) {
          console.log("A question has an empty title");
          return false;
      }
      if (question.answers.length < 2) {
          console.log("A question has less than 2 answers");
          return false;
      }
      const correctAnswers = question.answers.filter(a => a.isCorrect).length;
      if (correctAnswers !== 1) {
          console.log("A question does not have exactly one correct answer");
          return false;
      }
  }

  console.log(`Quiz ${quizId} is startable`);
  return true;
}


  async getQuizById(quizId: string, userId: string): Promise<any> {
    const quiz = await this.quizzRepository.getQuizById(quizId, userId);
    if (!quiz) {
      throw new NotFoundException("Quiz not found");
    }
    if (quiz.userId !== userId) {
      throw new ForbiddenException("You don't have permission to update this quiz");
    }
      return  {
        title: quiz.title,
        description: quiz.description,
        questions: quiz.questions || [],
      };
  }

  //Mettre à jour le titre d'un questionnaire
  async updateQuizTitle(quizId: string, newTitle: string, userId: string) {
    // Récupérer le quiz
    const quiz = await this.quizzRepository.getQuizById(quizId, userId);
  
    // Vérifier si le quiz existe et appartient bien à l'utilisateur
    if (!quiz) {
      throw new NotFoundException("Quiz not found");
    }
    if (quiz.userId !== userId) {
      throw new ForbiddenException("You don't have permission to update this quiz");
    }
  
    // Mettre à jour le titre du quiz
    await this.quizzRepository.updateQuizTitle(quizId, newTitle);
  }
  
  async addQuestionToQuiz(quizId: string, questionData: { title: string; answers: { title: string; isCorrect: boolean }[] }, userId: string) {
    // Vérifier si le quiz existe et appartient bien à l'utilisateur
    const quiz = await this.quizzRepository.getQuizById(quizId, userId);
  
    if (!quiz) {
      throw new NotFoundException("Quiz not found");
    }
    if (quiz.userId !== userId) {
      throw new ForbiddenException("You don't have permission to add questions to this quiz");
    }
  
    return this.quizzRepository.addQuestionToQuiz(quizId, questionData);
  }

  async updateQuestion(quizId: string, questionId: string, userId: string, body: { title: string; answers: any[]; }) {
    const success = await this.quizzRepository.updateQuestion(quizId, questionId, userId, body);

  if (!success) {
    throw new NotFoundException("quiz does not exist or does not belong to user");
  }
  return success;
  }
}