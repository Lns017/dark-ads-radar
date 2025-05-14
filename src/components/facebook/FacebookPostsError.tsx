
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface FacebookPostsErrorProps {
  error: string;
}

const FacebookPostsError = ({ error }: FacebookPostsErrorProps) => {
  return (
    <Card className="border-red-200">
      <CardHeader>
        <CardTitle className="text-lg">Posts Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-red-500">{error}</p>
      </CardContent>
    </Card>
  );
};

export default FacebookPostsError;
