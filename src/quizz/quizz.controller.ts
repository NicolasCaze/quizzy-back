import { Controller, Post, Body, Param } from '@nestjs/common';
import { QuizzService } from './quizz.service';

@Controller('quiz')
export class QuizzController {
  constructor(private readonly quizService: QuizzService) {}

  @Post('create')
  async createQuiz(@Body('title') title: string, @Body('userId') userId: string) {
    return this.quizService.createQuiz(title, userId);
  }

  @Post(':quizId/add-question')
  async addQuestion(
    @Param('quizId') quizId: string,
    @Body('questionText') questionText: string,
    @Body('options') options: string[],
    @Body('correctOption') correctOption: number,
  ) {
    return this.quizService.addQuestion(quizId, questionText, options, correctOption);
  }

  @Post(':quizId/launch')
  async launchQuiz(@Param('quizId') quizId: string) {
    return this.quizService.launchQuiz(quizId);
  }

  @Post(':quizId/join')
  async joinQuiz(@Param('quizId') quizId: string, @Body('userId') userId: string) {
    return this.quizService.joinQuiz(quizId, userId);
  }
}