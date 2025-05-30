import type React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface ScoreboardProps {
  score: number;
  questionNumber: number;
  totalQuestions: number;
  currentDifficulty: number;
}

const Scoreboard: React.FC<ScoreboardProps> = ({ score, questionNumber, totalQuestions, currentDifficulty }) => {
  return (
    <Card className="mb-4 shadow-md">
      <CardContent className="p-4 flex justify-between items-center">
        <div>
          <p className="text-lg font-semibold text-primary">Score: {score}</p>
          <p className="text-sm text-muted-foreground">Difficulty: {currentDifficulty}</p>
        </div>
        <p className="text-lg font-semibold text-primary">
          Question: {Math.min(questionNumber, totalQuestions)} / {totalQuestions}
        </p>
      </CardContent>
    </Card>
  );
};

export default Scoreboard;