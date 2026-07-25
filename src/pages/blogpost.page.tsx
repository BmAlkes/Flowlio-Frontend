import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useParams } from "react-router";
import { format } from "date-fns";
import { Loader2, Clock, Eye, ChevronRight } from "lucide-react";
import { Navbar } from "@/components/user section/navbar/navbar";
import { Footer } from "@/components/footer/footer";
import { BlogCard } from "@/components/blog/BlogCard";
import { BlogFaqSection } from "@/components/blog/BlogFaqSection";
import { BlogShareButtons } from "@/components/blog/BlogShareButtons";
import { BlogPostSchema } from "@/components/blog/BlogSchema";
import { useBlogPost, getAuthorName } from "@/hooks/useBlog";
import { sanitizeHTML } from "@/utils/sanitize";

const SITE_URL = "https://flowlioapp.com";

export const BlogPostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading, isError } = useBlogPost(slug);
  const post = data?.data;

  useEffect(() => {
    scrollTo(0, 0);
  }, [slug]);

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center py-32">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
        <Footer />
      </>
    );
  }

  if (isError || !post) {
    return (
      <>
        <Navbar />
        <div className="text-center py-32">
          <h1 className="text-2xl font-bold text-foreground">Post not found</h1>
          <Link to="/blog" className="text-indigo-600 font-medium mt-3 inline-block">
            Back to blog
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  const url = `${SITE_URL}/blog/${post.slug}`;
  const pageTitle = post.metaTitle || post.title;
  const pageDescription = post.metaDescription || post.excerpt || "";
  const ogImage = post.ogImage || post.coverImage;
  const dateLabel = post.publishedAt ? format(new Date(post.publishedAt), "MMMM d, yyyy") : "";

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        {post.metaKeywords && <meta name="keywords" content={post.metaKeywords} />}
        <link rel="canonical" href={post.canonicalUrl || url} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        {ogImage && <meta property="og:image" content={ogImage} />}
        <meta property="og:url" content={url} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        {ogImage && <meta name="twitter:image" content={ogImage} />}
      </Helmet>

      <BlogPostSchema post={post} />

      <Navbar />

      <main className="bg-background min-h-screen">
        {/* Breadcrumb */}
        <div className="max-w-3xl mx-auto px-4 pt-8">
          <nav className="flex items-center gap-1.5 text-sm text-muted-foreground flex-wrap">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link to="/blog" className="hover:text-foreground transition-colors">Blog</Link>
            {post.category && (
              <>
                <ChevronRight className="h-3.5 w-3.5" />
                <Link to={`/blog/category/${post.category}`} className="hover:text-foreground transition-colors capitalize">
                  {post.category}
                </Link>
              </>
            )}
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground font-medium truncate max-w-[240px]">{post.title}</span>
          </nav>
        </div>

        {/* Header */}
        <header className="max-w-3xl mx-auto px-4 pt-6 pb-8">
          {post.category && (
            <span className="text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700">
              {post.category}
            </span>
          )}
          <h1 className="text-3xl md:text-4xl font-black text-foreground mt-4 leading-tight">
            {post.title}
          </h1>
          <div className="flex flex-wrap items-center gap-3 mt-5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{getAuthorName(post.authorName)}</span>
              <span>·</span>
              <span>{dateLabel}</span>
              {post.readingTimeMin && (
                <>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {post.readingTimeMin} min read
                  </span>
                </>
              )}
              {typeof post.viewCount === "number" && (
                <>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5" />
                    {post.viewCount.toLocaleString()} views
                  </span>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Cover image */}
        {post.coverImage && (
          <div className="max-w-5xl mx-auto px-4">
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full aspect-[21/9] object-cover rounded-2xl"
            />
          </div>
        )}

        {/* Content */}
        <article className="max-w-3xl mx-auto px-4 py-10">
          <div
            className="prose prose-lg max-w-none text-foreground prose-headings:text-foreground prose-a:text-indigo-600"
            dangerouslySetInnerHTML={{ __html: sanitizeHTML(post.content) }}
          />

          <div className="mt-10 pt-6 border-t border-border">
            <BlogShareButtons url={url} title={post.title} />
          </div>

          <BlogFaqSection faq={post.faq || []} />
        </article>

        {/* Related posts */}
        {data?.related && data.related.length > 0 && (
          <section className="max-w-6xl mx-auto px-4 pb-16">
            <h2 className="text-2xl font-bold text-foreground mb-6">Related articles</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.related.slice(0, 3).map((related) => (
                <BlogCard key={related.id} post={related} />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </>
  );
};

export default BlogPostPage;
