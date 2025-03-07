import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { UserService } from '../../users/service/user.service';

import { QuizzRepository } from '../../quizz/repository/quizz.repository';
import QuizData from '../interface/QuizData';
import QuestionData from '../interface/questionData';



interface Question {
  title: string;
  answers: { title: string; isCorrect: boolean }[];
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  userId: string;
  questions?: Question[];
}

@Injectable()
export class QuizzService {
  private db;

  constructor(
    private readonly userService: UserService,
    private readonly quizzRepository: QuizzRepository,
  ) {
    this.db = this.userService['db'];
  }

  async createQuiz(title: string, description: string, userId: string): Promise<{ id: string; message: string }> {
    return this.quizzRepository.createQuiz(title, description, userId);
  }

  async getQuizzes(userId: string, baseUrl: string) {
    const quizzes = await this.quizzRepository.getQuizzes(userId);
    
    const quizzesWithLinks = await Promise.all(
      quizzes.data.map(async (quiz) => ({
        ...quiz,
        _links: (await this.isQuizStartable(quiz.id, userId))
          ? { start: `${baseUrl}/api/quiz/${quiz.id}/start` }
          : {},
      })),
    );

    return {
      data: quizzesWithLinks,
      _links: { create: `${baseUrl}/api/quiz` },
    };
  }

  private async isQuizStartable(quizId: string, userId: string): Promise<boolean> {
    const quiz = await this.quizzRepository.getQuizById(quizId, userId);
    
    if (!quiz || !quiz.title || !quiz.questions?.length) return false;
    
    return quiz.questions.every(
      (q) => q.title && q.answers.length >= 2 && q.answers.filter((a) => a.isCorrect).length === 1,
    );
  }


  async getQuizById(quizId: string, userId: string): Promise<Omit<QuizData, 'userId'>> {

    const quiz = await this.quizzRepository.getQuizById(quizId, userId);
    if (!quiz) throw new NotFoundException('Quiz not found');
    if (quiz.userId !== userId) throw new ForbiddenException("You don't have permission to access this quiz");
    
    const { userId: _, ...quizData } = quiz;
    return quizData;
  }

  async updateQuizTitle(quizId: string, newTitle: string, userId: string): Promise<void> {
    const quiz = await this.getQuizById(quizId, userId);
    await this.quizzRepository.updateQuizTitle(quizId, newTitle);
  }


  async addQuestionToQuiz(quizId: string, questionData: QuestionData, userId: string): Promise<string> {

    await this.getQuizById(quizId, userId);
    return this.quizzRepository.addQuestionToQuiz(quizId, questionData);
  }

  async updateQuestion(
    quizId: string,
    questionId: string,
    userId: string,

    body: QuestionData,

  ): Promise<boolean> {
    const success = await this.quizzRepository.updateQuestion(quizId, questionId, userId, body);
    if (!success) throw new NotFoundException('Quiz does not exist or does not belong to user');
    return success;
  }

  async startQuizExecution(quizId: string, userId: string): Promise<string> {
    const executionId = await this.quizzRepository.startQuizExecution(quizId, userId);
    if (!executionId) throw new NotFoundException("Quiz not found or you don't have permission");
    return executionId;
  }
}
