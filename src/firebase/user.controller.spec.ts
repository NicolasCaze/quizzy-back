import { Test,TestingModule } from "@nestjs/testing";
import { UsersController } from "./users.controller";
import { FirebaseService } from "./firebase.service";

describe('UserController', () => {
    let controller: UsersController;
    let service: FirebaseService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UsersController],
            providers: [FirebaseService],
        }).compile();

        controller = module.get<UsersController>(UsersController);
        service = module.get<FirebaseService>(FirebaseService);

        
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('getUserById', () => {
        it('Il doit retoruner un utilisateur ', async () => {
            const user = { id: '1', name: 'tesst',email:'test@test.com'};
            jest.spyOn(service, 'getUser').mockResolvedValueOnce(user);
          expect(await controller.getUser('1')).toEqual(user);
        });

        // it ('doit retourner une erreur si l\'utilisateur n\'existe pas', async () => {
        //     jest.spyOn(service, 'getUser').mockRejectedValueOnce(new Error('Utilisateur non trouvé'));
        //     try {
        //         await controller.getUser('2');
        //     }
        //     catch (error) {
        //         expect(error.response.status).toBe(500);
        //         expect(error.response.error).toBe('Internal Server Error');
        //     }
        // });
    });
});