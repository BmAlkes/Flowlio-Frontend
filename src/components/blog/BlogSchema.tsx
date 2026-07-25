import { Helmet } from "react-helmet-async";
import { BlogPost, getAuthorName } from "@/hooks/useBlog";

const SITE_URL = "https://flowlioapp.com";

const PUBLISHER = {
  "@type": "Organization",
  name: "Flowlio",
  logo: {
    "@type": "ImageObject",
    url: `${SITE_URL}/logo.png`,
  },
};

/** Injects Article + (optional) FAQPage + Breadcrumb JSON-LD for a single post.
 * If the post already carries its own schemaMarkup from the CMS, that is used
 * as the Article schema instead of the generated one — the author is the
 * source of truth once they've filled it in. */
export const BlogPostSchema = ({ post }: { post: BlogPost }) => {
  const url = `${SITE_URL}/blog/${post.slug}`;

  let articleSchema: Record<string, any>;
  if (post.schemaMarkup) {
    try {
      articleSchema =
        typeof post.schemaMarkup === "string"
          ? JSON.parse(post.schemaMarkup)
          : post.schemaMarkup;
    } catch {
      articleSchema = buildDefaultArticleSchema(post, url);
    }
  } else {
    articleSchema = buildDefaultArticleSchema(post, url);
  }

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
      ...(post.category
        ? [{ "@type": "ListItem", position: 3, name: post.category, item: `${SITE_URL}/blog/category/${post.category}` }]
        : []),
      { "@type": "ListItem", position: post.category ? 4 : 3, name: post.title, item: url },
    ],
  };

  const faqSchema =
    post.faq && post.faq.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: post.faq.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: item.answer,
            },
          })),
        }
      : null;

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(articleSchema)}</script>
      <script type="application/ld+json">{JSON.stringify(breadcrumb)}</script>
      {faqSchema && (
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      )}
    </Helmet>
  );
};

function buildDefaultArticleSchema(post: BlogPost, url: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.metaDescription || post.excerpt,
    image: post.ogImage || post.coverImage,
    author: {
      "@type": "Person",
      name: getAuthorName(post.authorName),
    },
    publisher: PUBLISHER,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
  };
}

/** JSON-LD for the /blog listing page (ItemList of posts + Blog type). */
export const BlogListSchema = ({ posts }: { posts: BlogPost[] }) => {
  const itemList = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Flowlio Blog",
    url: `${SITE_URL}/blog`,
    publisher: PUBLISHER,
    blogPost: posts.slice(0, 10).map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      url: `${SITE_URL}/blog/${post.slug}`,
      datePublished: post.publishedAt,
    })),
  };

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(itemList)}</script>
    </Helmet>
  );
};
