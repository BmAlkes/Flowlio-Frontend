import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useParams, useSearchParams } from "react-router";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Navbar } from "@/components/user section/navbar/navbar";
import { Footer } from "@/components/footer/footer";
import { BlogCard } from "@/components/blog/BlogCard";
import { BlogSidebar } from "@/components/blog/BlogSidebar";
import { BlogListSchema } from "@/components/blog/BlogSchema";
import { useBlogPosts } from "@/hooks/useBlog";

const SITE_URL = "https://flowlioapp.com";

export const BlogPage = () => {
  const { category } = useParams<{ category?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page") || 1);

  const { data, isLoading } = useBlogPosts({ category, page, limit: 9 });

  useEffect(() => {
    scrollTo(0, 0);
  }, [category, page]);

  const posts = data?.data ?? [];
  const featuredPost = !category && page === 1 ? posts.find((p) => p.featured) : undefined;
  const gridPosts = featuredPost ? posts.filter((p) => p.id !== featuredPost.id) : posts;

  const canonicalUrl = category ? `${SITE_URL}/blog/category/${category}` : `${SITE_URL}/blog`;
  const title = category
    ? `${category[0].toUpperCase()}${category.slice(1)} Articles — Flowlio Blog`
    : "Blog Flowlio — Project Management, CRM & Client Workflow Insights";
  const description =
    "Practical guides on project management, client relationships, invoicing and automation — from the team building Flowlio.";

  const handlePageChange = (newPage: number) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("page", String(newPage));
      return next;
    });
    scrollTo(0, 0);
  };

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      {posts.length > 0 && <BlogListSchema posts={posts} />}

      <Navbar />

      <main className="bg-background min-h-screen">
        {/* Hero */}
        <section className="bg-gradient-to-b from-indigo-50 to-background dark:from-indigo-950/20 dark:to-background py-16 px-4">
          <div className="max-w-5xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight">
              Blog Flowlio
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Guias práticos sobre gestão de projetos, clientes e automação — pra agências e
              times que usam o Flowlio pra crescer.
            </p>
          </div>
        </section>

        {/* Category pills */}
        {data?.categories && data.categories.length > 0 && (
          <div className="max-w-6xl mx-auto px-4 mt-8 flex flex-wrap gap-2 justify-center">
            <a
              href="/blog"
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                !category ? "bg-indigo-600 text-white" : "bg-muted text-muted-foreground hover:bg-muted/70"
              }`}
            >
              All
            </a>
            {data.categories.map(({ category: c, count }) => (
              <a
                key={c}
                href={`/blog/category/${c}`}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold capitalize transition-colors ${
                  category === c ? "bg-indigo-600 text-white" : "bg-muted text-muted-foreground hover:bg-muted/70"
                }`}
              >
                {c} <span className="opacity-70">({count})</span>
              </a>
            ))}
          </div>
        )}

        <div className="max-w-6xl mx-auto px-4 py-12 grid lg:grid-cols-[1fr_280px] gap-12">
          <div>
            {isLoading ? (
              <div className="flex justify-center py-24">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-24">
                <p className="text-muted-foreground">No posts published yet — check back soon.</p>
              </div>
            ) : (
              <>
                {featuredPost && (
                  <div className="mb-10">
                    <BlogCard post={featuredPost} featured />
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-6">
                  {gridPosts.map((post) => (
                    <BlogCard key={post.id} post={post} />
                  ))}
                </div>

                {data && data.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-3 mt-12">
                    <button
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page <= 1}
                      className="h-9 w-9 flex items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:pointer-events-none"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="text-sm text-muted-foreground font-medium">
                      Page {page} of {data.totalPages}
                    </span>
                    <button
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page >= data.totalPages}
                      className="h-9 w-9 flex items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-muted disabled:opacity-40 disabled:pointer-events-none"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          <BlogSidebar categories={data?.categories} mostViewed={data?.mostViewed} activeCategory={category} />
        </div>
      </main>

      <Footer />
    </>
  );
};

export default BlogPage;
