import { 
  Controller, Post, Body, Request, Get, Req, BadRequestException, HttpCode 
} from '@nestjs/common';
import { UserService } from '../service/user.service';
import { Auth } from '../../auth/middleware/auth.decorator';
import { RequestWithUser } from '../../auth/model';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@Controller('users')
@ApiTags('Users') // Ajoute un tag pour Swagger
export class UsersController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @Auth()
  @HttpCode(201)
  @ApiOperation({ summary: 'Créer un nouvel utilisateur' })
  @ApiResponse({ status: 201, description: 'Utilisateur ajouté avec succès' })
  @ApiResponse({ status: 400, description: 'Nom d’utilisateur invalide' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        username: { type: 'string', example: 'JohnDoe' }
      }
    }
  })
  async addUser(@Request() req: RequestWithUser, @Body() body: { username: string }) {
    if (!body.username || body.username.trim() === '') {
      throw new BadRequestException('Username cannot be empty');
    }

    const uid = req.user.uid;
    return this.userService.addUser(uid, body.username);
  }

  @Get('me')
  @Auth()
  @ApiOperation({ summary: 'Récupérer les informations de l’utilisateur connecté' })
  @ApiResponse({ status: 200, description: 'Informations utilisateur récupérées avec succès' })
  async getUser(@Req() req: RequestWithUser) {
    const uid = req.user.uid; 
    return this.userService.getUser(uid);
  }
}
