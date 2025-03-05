import { QuizzDto } from '../dto/quizz.dto';

describe('QuizzDto', () => {
  it('doit créer un DTO avec tous les champs', () => {
    const dto = new QuizzDto();
    dto.title = 'Mon Quiz de Test';
    dto.description = 'Une description détaillée du quiz';

    expect(dto.title).toBe('Mon Quiz de Test');
    expect(dto.description).toBe('Une description détaillée du quiz');
  });

  it('doit permettre un titre vide', () => {
    const dto = new QuizzDto();
    dto.title = '';
    dto.description = 'Une description';

    expect(dto.title).toBe('');
  });

  it('doit permettre une description vide', () => {
    const dto = new QuizzDto();
    dto.title = 'Mon Quiz';
    dto.description = '';

    expect(dto.description).toBe('');
  });

  it('doit permettre des titres avec des caractères spéciaux', () => {
    const dto = new QuizzDto();
    dto.title = 'Quiz 2024 - Test & Validation !';
    dto.description = 'Description avec des caractères spéciaux';

    expect(dto.title).toBe('Quiz 2024 - Test & Validation !');
  });

  it('doit créer un DTO sans initialisation', () => {
    const dto = new QuizzDto();

    expect(dto.title).toBeUndefined();
    expect(dto.description).toBeUndefined();
  });

  it('doit permettre de modifier les champs après création', () => {
    const dto = new QuizzDto();
    dto.title = 'Premier titre';
    dto.description = 'Première description';

    dto.title = 'Nouveau titre';
    dto.description = 'Nouvelle description';

    expect(dto.title).toBe('Nouveau titre');
    expect(dto.description).toBe('Nouvelle description');
  });

  it('doit supporter des titres et descriptions de différentes longueurs', () => {
    const dto = new QuizzDto();
    dto.title = 'a'.repeat(1000); // Très long titre
    dto.description = 'b'.repeat(2000); // Très longue description

    expect(dto.title.length).toBe(1000);
    expect(dto.description.length).toBe(2000);
  });
});