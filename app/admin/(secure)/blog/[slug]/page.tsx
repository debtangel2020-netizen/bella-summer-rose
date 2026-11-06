import Link from "next/link";
import { notFound } from "next/navigation";
import { getPost } from "@/lib/blog";
import { PostForm } from "../PostForm";

export default async function EditPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug, { fresh: true });
  if (!post) notFound();
  return (
    <>
      <h1>Edit post</h1>
      {!post.hidden && (
        <p style={{ marginBottom: 20 }}><Link href={`/blog/${post.slug}`} target="_blank">View it on the website ↗</Link></p>
      )}
      <PostForm post={post} />
    </>
  );
}
