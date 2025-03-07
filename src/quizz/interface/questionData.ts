export default interface QuestionData {
    title: string;
    answers: { title: string; isCorrect: boolean }[];
  }