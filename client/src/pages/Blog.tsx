import { BlogPost } from "@/components/BlogPost";
import { posts } from "../data/posts.json";

export default function Blog() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Blog</h1>
      <div className="max-w-3xl mx-auto">
        {posts.map((post) => (
          <BlogPost key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
