
import type React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useLocale } from '@/context/i18n';

interface ScoreboardProps {
  score: number;
  questionNumber: number;
  totalQuestions: number;
  currentDifficulty: number;
}

const Scoreboard: React.FC<ScoreboardProps> = ({ score, questionNumber, totalQuestions, currentDifficulty }) => {
  const { t } = useLocale();

  return (
    <Card className="mb-4 shadow-md">
      <CardContent className="p-4 flex justify-between items-center">
        <div>
          <p className="text-lg font-semibold text-primary">
            {t('scoreboard.score', { score })}
          </p>
          <p className="text-sm text-muted-foreground">
            {t('scoreboard.difficulty', { difficulty: currentDifficulty })}
          </p>
        </div>
        <p className="text-lg font-semibold text-primary">
          {t('scoreboard.question', { questionNumber: Math.min(questionNumber, totalQuestions), totalQuestions })}
        </p>
      </CardContent>
    </Card>
  );
};

export default Scoreboard;
