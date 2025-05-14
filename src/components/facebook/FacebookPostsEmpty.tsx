
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const FacebookPostsEmpty = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Posts Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">Nenhum post recente encontrado.</p>
      </CardContent>
    </Card>
  );
};

export default FacebookPostsEmpty;
