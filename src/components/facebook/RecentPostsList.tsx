
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import FacebookPostCard from './FacebookPostCard';
import FacebookPostsLoading from './FacebookPostsLoading';
import FacebookPostsError from './FacebookPostsError';
import FacebookPostsEmpty from './FacebookPostsEmpty';
import { useFacebookPosts } from '@/hooks/use-facebook-posts';

const RecentPostsList = () => {
  const { posts, isLoading, error } = useFacebookPosts();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Posts Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <FacebookPostsLoading />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return <FacebookPostsError error={error} />;
  }

  if (!posts || posts.length === 0) {
    return <FacebookPostsEmpty />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Posts Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {posts.map((post) => (
            <FacebookPostCard key={post.id} post={post} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentPostsList;
