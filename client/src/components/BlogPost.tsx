import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
//import ReactMarkdown from "react-markdown"; //Removed as not needed

interface BlogPostProps {
  post: {
    title: string;
    date: string;
    content: string;
  };
}

export function BlogPost({ post }: BlogPostProps) {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>{post.title}</CardTitle>
        <time className="text-sm text-muted-foreground">
          {format(new Date(post.date), "MMMM d, yyyy")}
        </time>
      </CardHeader>
      <CardContent>
        <div 
          className="prose dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </CardContent>
    </Card>
  );
}