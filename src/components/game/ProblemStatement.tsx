import type React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface ProblemStatementProps {
  problemText: string | null;
  isLoading: boolean;
}

const ProblemStatement: React.FC<ProblemStatementProps> = ({ problemText, isLoading }) => {
  return (
    <Card className="mb-6 text-center shadow-md">
      <CardHeader>
        <CardTitle className="text-2xl md:text-3xl font-bold text-primary">Solve the Problem!</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-3/4 mx-auto" />
          </div>
        ) : (
          <p className="text-3xl md:text-4xl font-mono font-semibold text-foreground">
            {problemText || "Loading problem..."}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default ProblemStatement;