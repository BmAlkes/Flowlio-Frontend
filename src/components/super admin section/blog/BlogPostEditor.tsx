import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Loader2, X, Plus, Image as ImageIcon, ExternalLink } from "lucide-react";
import { Box } from "@/components/ui/box";
import { Flex } from "@/components/ui/flex";
import { Stack } from "@/components/ui/stack";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RichTextEditor from "@/components/common/RichTextEditor";
import { axios } from "@/configs/axios.config";
import { useBlogAdminPost, useCreateBlogPost, useUpdateBlogPost, BlogPostPayload } from "@/hooks/useBlogAdmin";
import { BlogFaqItem, BlogPostStatus } from "@/hooks/useBlog";

interface BlogPostEditorProps {
  postId?: string;
}

const emptyForm: BlogPostPayload = {
  title: "",
  content: "",
  excerpt: "",
  coverImage: "",
  category: "",
  tags: [],
  featured: false,
  status: "draft",
  metaTitle: "",
  metaDescription: "",
  metaKeywords: "",
  canonicalUrl: "",
  ogImage: "",
  schemaMarkup: "",
  faq: [],
};

export const BlogPostEditor = ({ postId }: BlogPostEditorProps) => {
  const navigate = useNavigate();
  const isEditMode = !!postId;
  const { data, isLoading } = useBlogAdminPost(postId);
  const createPost = useCreateBlogPost();
  const updatePost = useUpdateBlogPost();
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<BlogPostPayload>(emptyForm);
  const [tagInput, setTagInput] = useState("");
  const [uploadingCover, setUploadingCover] = useState(false);

  useEffect(() => {
    if (data?.data) {
      const post = data.data;
      setForm({
        title: post.title,
        content: post.content,
        excerpt: post.excerpt || "",
        coverImage: post.coverImage || "",
        category: post.category || "",
        tags: post.tags || [],
        featured: !!post.featured,
        status: post.status,
        metaTitle: post.metaTitle || "",
        metaDescription: post.metaDescription || "",
        metaKeywords: post.metaKeywords || "",
        canonicalUrl: post.canonicalUrl || "",
        ogImage: post.ogImage || "",
        schemaMarkup:
          typeof post.schemaMarkup === "string"
            ? post.schemaMarkup
            : post.schemaMarkup
            ? JSON.stringify(post.schemaMarkup, null, 2)
            : "",
        faq: post.faq || [],
      });
    }
  }, [data]);

  const update = <K extends keyof BlogPostPayload>(key: K, value: BlogPostPayload[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleAddTag = () => {
    const value = tagInput.trim();
    if (!value || form.tags?.includes(value)) return;
    update("tags", [...(form.tags || []), value]);
    setTagInput("");
  };

  const handleRemoveTag = (tag: string) => {
    update("tags", (form.tags || []).filter((t) => t !== tag));
  };

  const handleCoverUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);
    setUploadingCover(true);
    try {
      const response = await axios.post("/editor/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (response.data.success && response.data.url) {
        update("coverImage", response.data.url);
        toast.success("Cover image uploaded");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to upload image");
    } finally {
      setUploadingCover(false);
      if (coverInputRef.current) coverInputRef.current.value = "";
    }
  };

  const handleAddFaq = () => {
    update("faq", [...(form.faq || []), { question: "", answer: "" } as BlogFaqItem]);
  };

  const handleFaqChange = (index: number, field: "question" | "answer", value: string) => {
    const next = [...(form.faq || [])];
    next[index] = { ...next[index], [field]: value };
    update("faq", next);
  };

  const handleRemoveFaq = (index: number) => {
    update("faq", (form.faq || []).filter((_, i) => i !== index));
  };

  const save = (status: BlogPostStatus) => {
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!form.content.trim()) {
      toast.error("Content is required");
      return;
    }

    const payload: BlogPostPayload = { ...form, status };

    if (isEditMode && postId) {
      updatePost.mutate(
        { id: postId, payload },
        { onSuccess: () => navigate("/superadmin/blog") }
      );
    } else {
      createPost.mutate(payload, { onSuccess: () => navigate("/superadmin/blog") });
    }
  };

  if (isEditMode && isLoading) {
    return (
      <Box className="flex justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </Box>
    );
  }

  const isSaving = createPost.isPending || updatePost.isPending;
  const currentStatus = isEditMode ? data?.data.status : undefined;

  return (
    <Box className="px-2 pb-24">
      <Box className="px-4 py-6">
        <h1 className="text-3xl max-sm:text-xl font-medium text-foreground">
          {isEditMode ? "Edit Post" : "New Post"}
        </h1>
      </Box>

      <Box className="px-4">
        <Tabs defaultValue="content" className="space-y-6">
          <TabsList className="bg-background border border-border shadow-sm p-1 h-auto">
            <TabsTrigger value="content" className="py-1.5 px-3">Content</TabsTrigger>
            <TabsTrigger value="seo" className="py-1.5 px-3">SEO & Distribution</TabsTrigger>
            <TabsTrigger value="faq" className="py-1.5 px-3">FAQ (AEO)</TabsTrigger>
          </TabsList>

          {/* ── Content tab ─────────────────────────────────────────── */}
          <TabsContent value="content" className="space-y-6">
            <Box>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
                placeholder="What is Flowlio and how does it help agencies grow?"
                className="mt-1.5"
              />
            </Box>

            <Box>
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea
                id="excerpt"
                value={form.excerpt}
                onChange={(e) => update("excerpt", e.target.value)}
                placeholder="Short summary shown on post cards and search results"
                rows={2}
                className="mt-1.5"
              />
            </Box>

            <Flex className="gap-6 max-md:flex-col">
              <Box className="flex-1">
                <Label>Cover Image</Label>
                <Flex className="gap-2 mt-1.5">
                  <Input
                    value={form.coverImage}
                    onChange={(e) => update("coverImage", e.target.value)}
                    placeholder="https://... or upload"
                  />
                  <input type="file" ref={coverInputRef} accept="image/*" className="hidden" onChange={handleCoverUpload} />
                  <Button type="button" variant="outline" disabled={uploadingCover} onClick={() => coverInputRef.current?.click()}>
                    {uploadingCover ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
                  </Button>
                </Flex>
                {form.coverImage && (
                  <img src={form.coverImage} alt="" className="mt-2 h-32 w-full object-cover rounded-lg border border-border" />
                )}
              </Box>

              <Box className="flex-1 space-y-4">
                <Box>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={form.category}
                    onChange={(e) => update("category", e.target.value)}
                    placeholder="e.g. project-management"
                    className="mt-1.5"
                  />
                </Box>

                <Box>
                  <Label>Tags</Label>
                  <Flex className="gap-2 mt-1.5">
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                      placeholder="Type a tag and press Enter"
                    />
                    <Button type="button" variant="outline" onClick={handleAddTag}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </Flex>
                  {form.tags && form.tags.length > 0 && (
                    <Flex className="flex-wrap gap-1.5 mt-2">
                      {form.tags.map((tag) => (
                        <span key={tag} className="flex items-center gap-1 text-xs font-medium bg-muted px-2 py-1 rounded-full">
                          {tag}
                          <button type="button" onClick={() => handleRemoveTag(tag)}>
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </Flex>
                  )}
                </Box>

                <Flex className="items-center gap-2">
                  <Switch checked={!!form.featured} onCheckedChange={(v) => update("featured", v)} />
                  <Label>Featured post</Label>
                </Flex>
              </Box>
            </Flex>

            <Box>
              <Label>Content *</Label>
              <Box className="mt-1.5">
                <RichTextEditor content={form.content} onChange={(html) => update("content", html)} />
              </Box>
            </Box>
          </TabsContent>

          {/* ── SEO tab ──────────────────────────────────────────────── */}
          <TabsContent value="seo" className="space-y-6 max-w-2xl">
            <Box>
              <Flex className="justify-between items-center">
                <Label htmlFor="metaTitle">Meta Title</Label>
                <span className={`text-xs ${(form.metaTitle?.length || 0) > 60 ? "text-rose-500" : "text-muted-foreground"}`}>
                  {form.metaTitle?.length || 0}/60
                </span>
              </Flex>
              <Input
                id="metaTitle"
                value={form.metaTitle}
                onChange={(e) => update("metaTitle", e.target.value)}
                className="mt-1.5"
              />
            </Box>

            <Box>
              <Flex className="justify-between items-center">
                <Label htmlFor="metaDescription">Meta Description</Label>
                <span className={`text-xs ${(form.metaDescription?.length || 0) > 160 ? "text-rose-500" : "text-muted-foreground"}`}>
                  {form.metaDescription?.length || 0}/160
                </span>
              </Flex>
              <Textarea
                id="metaDescription"
                value={form.metaDescription}
                onChange={(e) => update("metaDescription", e.target.value)}
                rows={3}
                className="mt-1.5"
              />
            </Box>

            <Box>
              <Label htmlFor="metaKeywords">Meta Keywords</Label>
              <Input
                id="metaKeywords"
                value={form.metaKeywords}
                onChange={(e) => update("metaKeywords", e.target.value)}
                placeholder="comma, separated, keywords"
                className="mt-1.5"
              />
            </Box>

            <Box>
              <Label htmlFor="canonicalUrl">Canonical URL</Label>
              <Input
                id="canonicalUrl"
                value={form.canonicalUrl}
                onChange={(e) => update("canonicalUrl", e.target.value)}
                placeholder="https://flowlioapp.com/blog/..."
                className="mt-1.5"
              />
            </Box>

            <Box>
              <Label htmlFor="ogImage">OG Image</Label>
              <Input
                id="ogImage"
                value={form.ogImage}
                onChange={(e) => update("ogImage", e.target.value)}
                placeholder="https://..."
                className="mt-1.5"
              />
              {(form.ogImage || form.coverImage) && (
                <Box className="mt-3 border border-border rounded-xl overflow-hidden max-w-sm">
                  <img
                    src={form.ogImage || form.coverImage}
                    alt=""
                    className="w-full aspect-[1.91/1] object-cover"
                  />
                  <Box className="p-3 bg-muted/40">
                    <p className="text-xs text-muted-foreground uppercase">flowlioapp.com</p>
                    <p className="text-sm font-semibold text-foreground truncate">
                      {form.metaTitle || form.title || "Post title"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {form.metaDescription || form.excerpt}
                    </p>
                  </Box>
                </Box>
              )}
              <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
                <ExternalLink className="h-3 w-3" />
                Preview of how the card looks when shared on LinkedIn/Twitter
              </p>
            </Box>

            <Box>
              <Label htmlFor="schemaMarkup">Schema Markup (JSON-LD)</Label>
              <Textarea
                id="schemaMarkup"
                value={form.schemaMarkup as string}
                onChange={(e) => update("schemaMarkup", e.target.value)}
                rows={8}
                placeholder='{"@context": "https://schema.org", "@type": "Article", ...}'
                className="mt-1.5 font-mono text-xs"
              />
              <p className="text-xs text-muted-foreground mt-1.5">
                Optional — leave empty to auto-generate a default Article schema from this post's fields.
              </p>
            </Box>
          </TabsContent>

          {/* ── FAQ tab ──────────────────────────────────────────────── */}
          <TabsContent value="faq" className="space-y-4 max-w-2xl">
            <Box className="bg-indigo-50 dark:bg-indigo-900/15 border border-indigo-200 dark:border-indigo-500/30 rounded-xl px-4 py-3">
              <p className="text-sm text-indigo-800 dark:text-indigo-300">
                FAQs aparecem em resultados de busca e respostas de IA (Answer Engine Optimization).
              </p>
            </Box>

            {(form.faq || []).map((item, index) => (
              <Box key={index} className="border border-border rounded-xl p-4 space-y-3 relative">
                <button
                  type="button"
                  onClick={() => handleRemoveFaq(index)}
                  className="absolute top-3 end-3 text-muted-foreground hover:text-rose-500 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
                <Box>
                  <Label>Question</Label>
                  <Input
                    value={item.question}
                    onChange={(e) => handleFaqChange(index, "question", e.target.value)}
                    className="mt-1.5"
                  />
                </Box>
                <Box>
                  <Label>Answer</Label>
                  <Textarea
                    value={item.answer}
                    onChange={(e) => handleFaqChange(index, "answer", e.target.value)}
                    rows={3}
                    className="mt-1.5"
                  />
                </Box>
              </Box>
            ))}

            <Button type="button" variant="outline" onClick={handleAddFaq}>
              <Plus className="h-4 w-4 me-2" />
              Add FAQ
            </Button>
          </TabsContent>
        </Tabs>
      </Box>

      {/* Footer actions */}
      <Box className="fixed bottom-0 inset-x-0 md:ps-[14.6rem] bg-card border-t border-border px-6 py-4 z-20">
        <Stack className="flex-row gap-2 justify-end max-w-6xl mx-auto">
          <Button variant="outline" onClick={() => navigate("/superadmin/blog")} disabled={isSaving}>
            Cancel
          </Button>
          <Button variant="outline" onClick={() => save("draft")} disabled={isSaving}>
            {isSaving && <Loader2 className="h-4 w-4 me-2 animate-spin" />}
            Save Draft
          </Button>
          {currentStatus === "published" && (
            <Button
              variant="outline"
              className="border-amber-300 text-amber-700 hover:bg-amber-50"
              onClick={() => save("archived")}
              disabled={isSaving}
            >
              Archive
            </Button>
          )}
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => save("published")} disabled={isSaving}>
            {isSaving && <Loader2 className="h-4 w-4 me-2 animate-spin" />}
            Publish
          </Button>
        </Stack>
      </Box>
    </Box>
  );
};
