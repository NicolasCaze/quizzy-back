import { Controller, Post, Body, Param, Req } from '@nestjs/common';
import { QuizzService } from '../service/quizz.service';
import { RequestWithUser } from '../../auth/model';
import { Auth } from '../../auth/middleware/auth.decorator';

@Controller('quiz')
export class QuizzController {
  constructor(private readonly quizService: QuizzService) {}

  @Post('create')
  @Auth()
  async createQuiz(@Req() request: RequestWithUser, @Body('title') title: string, @Body('description') description: string) {
    const uid = request.user.uid;
    return this.quizService.createQuiz(title, description, uid);
  }

  @Post('get')
  @Auth()
  async getQuizzes(@Req() request: RequestWithUser) {
    const uid = request.user.uid;
    return this.quizService.getQuizzes(uid);
  }
}