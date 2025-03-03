import { Controller, Post, Body, Req, Get, HttpCode, Request, Res, Param } from '@nestjs/common';
import { QuizzService } from '../service/quizz.service';
import { RequestWithUser } from '../../auth/model';
import { Auth } from '../../auth/middleware/auth.decorator';
import { Response } from 'express';

@Controller('quiz')
export class QuizzController {
  constructor(private readonly quizService: QuizzService) {}

  @Post()
  @Auth()
  @HttpCode(201)
  async createQuiz(
    @Request() req: RequestWithUser, 
    @Body() body: { title: string, description: string },
    @Res() res: Response
  ) {
    const userId = req.user.uid;
    const result = await this.quizService.createQuiz(body.title, body.description, userId);
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const location = `${baseUrl}/api/quiz/${result.id}`;
    res.setHeader('Location', location);
    res.status(201).send();
  }

  @Get()
  @Auth()
  async getQuizzes(@Req() request: RequestWithUser) {
    const uid = request.user.uid;
    return this.quizService.getQuizzes(uid);
  }

  @Get(':id')
  @Auth()
  async getQuizById(@Req() request: RequestWithUser, @Param('id') quizId: string): Promise<any> {
    const uid = request.user.uid;
    const quiz= await this.quizService.getQuizById(quizId, uid);
    if (!quiz) {
      throw new Error('Quiz not found or does not belong to the user');
    }
    return quiz;
  }
}