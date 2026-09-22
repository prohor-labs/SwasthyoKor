"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import {
  BookOpen,
  Clock,
  Edit,
  Export2 as ExternalLink,
  Add as Plus,
  SearchNormal,
  Trash2,
} from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  createBlogAction,
  deleteBlogAction,
  updateBlogAction,
} from "@/lib/actions/admin";
import type { BlogPost } from "@/lib/db/queries";

export function AdminBlogManager({
  initialPosts,
}: {
  initialPosts: BlogPost[];
}) {
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts);
  const [query, setQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isPending, startTransition] = useTransition();

  // Form states
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("মধু ও পুষ্টি");
  const [readTime, setReadTime] = useState("৫ মিনিট");
  const [author, setAuthor] = useState("স্বাস্থ্যকর নিউট্রিশন টিম");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [content, setContent] = useState("");

  const resetForm = () => {
    setTitle("");
    setSlug("");
    setCategory("মধু ও পুষ্টি");
    setReadTime("৫ মিনিট");
    setAuthor("স্বাস্থ্যকর নিউট্রিশন টিম");
    setDescription("");
    setCoverImage("");
    setContent("");
    setEditingPost(null);
  };

  const handleEditClick = (post: BlogPost) => {
    setEditingPost(post);
    setTitle(post.title);
    setSlug(post.slug);
    setCategory(post.category);
    setReadTime(post.readTime);
    setAuthor(post.author);
    setDescription(post.description);
    setCoverImage(post.coverImage);
    setContent(post.content);
    setIsCreateOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", title);
    formData.append("slug", slug);
    formData.append("category", category);
    formData.append("readTime", readTime);
    formData.append("author", author);
    formData.append("description", description);
    formData.append("coverImage", coverImage);
    formData.append("content", content);

    if (editingPost?.id) {
      formData.append("id", editingPost.id);
    }

    startTransition(async () => {
      if (editingPost) {
        const res = await updateBlogAction(formData);
        if (res.success) {
          setPosts((prev) =>
            prev.map((p) =>
              p.id === editingPost.id
                ? {
                    ...p,
                    title,
                    slug,
                    category,
                    readTime,
                    author,
                    description,
                    coverImage: coverImage || p.coverImage,
                    content,
                  }
                : p,
            ),
          );
        }
      } else {
        const res = await createBlogAction(formData);
        if (res.success) {
          const newPost: BlogPost = {
            id: `blog_${Date.now()}`,
            title,
            slug,
            category,
            readTime,
            author,
            description,
            coverImage:
              coverImage ||
              "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&auto=format&fit=crop&q=85",
            content,
            tags: [],
            faqs: [],
            relatedProductHandles: [],
            publishedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          setPosts((prev) => [newPost, ...prev]);
        }
      }
      setIsCreateOpen(false);
      resetForm();
    });
  };

  const handleDelete = (id: string, slug: string) => {
    if (!confirm("আপনি কি নিশ্চিতভাবে এই ব্লগটি মুছে ফেলতে চান?")) return;
    startTransition(async () => {
      if (id) {
        await deleteBlogAction(id);
      }
      setPosts((prev) => prev.filter((p) => p.slug !== slug));
    });
  };

  const filteredPosts = useMemo(() => {
    return posts.filter(
      (p) =>
        p.title.toLowerCase().includes(query.toLowerCase()) ||
        p.category.toLowerCase().includes(query.toLowerCase()) ||
        p.slug.toLowerCase().includes(query.toLowerCase()),
    );
  }, [posts, query]);

  return (
    <div className="flex flex-col gap-6">
      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-md">
          <SearchNormal className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ব্লগ খুঁজুন (শিরোনাম বা ক্যাটাগরি)..."
            className="pl-10 rounded-xl bg-card"
          />
        </div>

        <Dialog
          open={isCreateOpen}
          onOpenChange={(open) => {
            setIsCreateOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger
            type="button"
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow hover:bg-emerald-700 transition cursor-pointer shrink-0"
          >
            <Plus className="size-4" />
            নতুন ব্লগ লিখুন
          </DialogTrigger>

          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-6">
            <DialogHeader className="pb-2">
              <DialogTitle className="text-xl font-bold flex items-center gap-2 text-foreground">
                <BookOpen className="size-5 text-emerald-600" />
                {editingPost ? "ব্লগ আর্টিকেল সম্পাদনা" : "নতুন ব্লগ আর্টিকেল প্রকাশ"}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSave} className="space-y-4 pt-2">
              <FieldGroup className="gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="blog-title">
                      আর্টিকেল শিরোনাম *
                    </FieldLabel>
                    <Input
                      id="blog-title"
                      required
                      value={title}
                      onChange={(e) => {
                        setTitle(e.target.value);
                        if (!editingPost) {
                          setSlug(
                            e.target.value
                              .toLowerCase()
                              .replace(/[^a-z0-9]+/g, "-"),
                          );
                        }
                      }}
                      placeholder="যেমন: খাঁটি সরিষার তেলের স্বাস্থ্য উপকারিতা"
                      className="rounded-xl"
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="blog-slug">
                      ইউআরএল স্ল্যাগ (Slug) *
                    </FieldLabel>
                    <Input
                      id="blog-slug"
                      required
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="pure-mustard-oil-benefits"
                      className="rounded-xl font-mono text-xs"
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Field>
                    <FieldLabel htmlFor="blog-category">ক্যাটাগরি</FieldLabel>
                    <Input
                      id="blog-category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      placeholder="মধু ও পুষ্টি"
                      className="rounded-xl"
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="blog-read-time">পড়ার সময়</FieldLabel>
                    <Input
                      id="blog-read-time"
                      value={readTime}
                      onChange={(e) => setReadTime(e.target.value)}
                      placeholder="৫ মিনিট"
                      className="rounded-xl"
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="blog-author">লেখক / দল</FieldLabel>
                    <Input
                      id="blog-author"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      placeholder="স্বাস্থ্যকর নিউট্রিশন টিম"
                      className="rounded-xl"
                    />
                  </Field>
                </div>

                <Field>
                  <FieldLabel htmlFor="blog-cover-image">
                    কভার ইমেজ ইউআরএল (Unsplash বা CDN)
                  </FieldLabel>
                  <Input
                    id="blog-cover-image"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="rounded-xl font-mono text-xs"
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="blog-description">
                    সংক্ষিপ্ত বিবরণ (SEO Meta Description) *
                  </FieldLabel>
                  <Textarea
                    id="blog-description"
                    required
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="আর্টিকেলের মূল বক্তব্য ও সারসংক্ষেপ..."
                    className="rounded-xl bg-card p-3 text-sm text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="blog-content">
                    সম্পূর্ণ কনটেন্ট (Markdown সমর্থিত) *
                  </FieldLabel>
                  <Textarea
                    id="blog-content"
                    required
                    rows={8}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="## মূল পয়েন্ট লিখুন...&#10;&#10;### বৈজ্ঞানিক উপকারিতা:&#10;1. প্রাকৃতিক অ্যান্টিঅক্সিডেন্ট..."
                    className="rounded-xl bg-card p-3 text-sm text-foreground font-mono focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </Field>
              </FieldGroup>

              <div className="flex justify-end gap-3 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isPending}
                  onClick={() => {
                    setIsCreateOpen(false);
                    resetForm();
                  }}
                >
                  বাতিল
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {isPending
                    ? "সংরক্ষণ হচ্ছে..."
                    : editingPost
                      ? "পরিবর্তন সংরক্ষণ করুন"
                      : "প্রকাশ করুন"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Post Listing */}
      <div className="flex flex-col gap-3">
        {filteredPosts.length === 0 ? (
          <Card className="p-8 text-center text-sm text-muted-foreground border-dashed">
            কোনো ব্লগ আর্টিকেল পাওয়া যায়নি।
          </Card>
        ) : (
          filteredPosts.map((post) => (
            <Card
              key={post.slug}
              className="p-0 py-0 overflow-hidden border-border/80 hover:border-emerald-500/40 transition"
            >
              <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="relative size-16 sm:size-20 rounded-2xl overflow-hidden bg-muted shrink-0 shadow-2xs border border-border">
                    <Image
                      src={post.coverImage}
                      alt={post.title}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary" className="text-[10px]">
                        {post.category}
                      </Badge>
                      <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Clock className="size-3" />
                        {post.readTime}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm sm:text-base text-foreground truncate">
                      {post.title}
                    </h3>
                    <p className="text-xs text-muted-foreground font-mono truncate mt-0.5">
                      /blog/{post.slug}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-border/40">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="size-8 p-0"
                    render={
                      <Link
                        href={`/blog/${post.slug}`}
                        target="_blank"
                        title="লাইভ প্রিভিউ দেখুন"
                      >
                        <ExternalLink className="size-4 text-muted-foreground" />
                      </Link>
                    }
                  />

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditClick(post)}
                    className="size-8 p-0 text-foreground hover:bg-muted"
                    title="সম্পাদনা করুন"
                  >
                    <Edit className="size-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={isPending}
                    onClick={() => handleDelete(post.id, post.slug)}
                    className="size-8 p-0 text-destructive hover:bg-destructive/10"
                    title="মুছে ফেলুন"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
