import { useCallback, useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router";
import { ArrowDown, ArrowRight, ArrowUpRight, Check, Play, Video } from "lucide-react";
import { Navbar } from "@/components/user section/navbar/navbar";
import { Footer } from "@/components/footer/footer";
import { VideoModal } from "@/components/showcase/VideoModal";
import { ShowcaseSchema } from "@/components/showcase/ShowcaseSchema";
import { CATEGORIES, features, type FeatureCategory } from "@/data/features";
import { useCases } from "@/data/useCases";
import "./showcase.css";

const hasVideo = (id: string) => /^[\w-]{11}$/.test(id) && !/VIDEO|USECASE/.test(id);
const availableFeatures = features.filter((feature) => hasVideo(feature.videoId));
const availableUseCases = useCases.filter((useCase) => hasVideo(useCase.videoId));
const chapters = [
  {
    id: "overview",
    title: "The Flowlio overview",
    description: "Get a feel for the workspace and see how clients, projects and everyday work fit together.",
    videoId: "tuhGvLdxhVw",
    category: "Product tour",
    duration: "Overview",
  },
  ...availableFeatures,
];

function VideoPoster({ videoId, title }: { videoId: string; title: string }) {
  const [quality, setQuality] = useState<"maxresdefault" | "hqdefault" | null>("maxresdefault");
  const handleImageFallback = () => setQuality((current) => current === "maxresdefault" ? "hqdefault" : null);
  return (
    <div className="showcase-poster">
      <div className="showcase-poster-fallback" aria-hidden="true">
        <img src="/logo/logo.png" alt="" />
        <span>Flowlio</span>
        <strong>{title}</strong>
      </div>
      {quality && (
        <img
          className="showcase-poster-image"
          src={`https://img.youtube.com/vi/${videoId}/${quality}.jpg`}
          alt=""
          loading="lazy"
          onError={handleImageFallback}
          onLoad={(event) => {
            if (event.currentTarget.naturalWidth <= 120) handleImageFallback();
          }}
        />
      )}
    </div>
  );
}

export default function ShowcasePage() {
  const [chapterIndex, setChapterIndex] = useState(0);
  const [category, setCategory] = useState<FeatureCategory>("All");
  const [audienceIndex, setAudienceIndex] = useState(0);
  const [video, setVideo] = useState<{ videoId: string; title: string } | null>(null);
  const closeVideo = useCallback(() => setVideo(null), []);
  const chapter = chapters[chapterIndex];
  const audience = useCases[audienceIndex];
  const filteredFeatures = category === "All" ? features : features.filter((feature) => feature.category === category);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="showcase-page">
      <Helmet>
        <title>Flowlio Showcase — Explore the Product</title>
        <meta name="description" content="Explore Flowlio through product walkthroughs. See how to manage clients, set up projects and organize your team's work in one workspace." />
        <link rel="canonical" href="https://flowlioapp.com/showcase" />
      </Helmet>
      <ShowcaseSchema features={availableFeatures} useCases={availableUseCases} />
      <Navbar />
      <main>
        <section className="showcase-intro showcase-container" aria-labelledby="showcase-title">
          <div>
            <p className="showcase-eyebrow"><span /> Inside Flowlio</p>
            <h1 id="showcase-title">Your work.<br />The whole picture.</h1>
          </div>
          <div className="showcase-intro-copy">
            <p>From the first client conversation to the final invoice. Take a closer look at the workspace that brings your team’s work together.</p>
            <a className="showcase-text-link" href="#product-tour">Watch the product tour <ArrowDown size={16} /></a>
          </div>
        </section>

        <section id="product-tour" className="showcase-container showcase-tour" aria-label="Product walkthroughs">
          <div className="showcase-tour-bar">
            <span><Video size={17} /> Product walkthroughs</span>
            <span>{chapters.length} videos to explore</span>
          </div>
          <div className="showcase-tour-layout">
            <div className="showcase-featured">
              <button className="showcase-player" onClick={() => setVideo(chapter)} aria-label={`Watch ${chapter.title}`}>
                <VideoPoster key={chapter.videoId} videoId={chapter.videoId} title={chapter.title} />
                <span className="showcase-play"><Play size={23} fill="currentColor" /><span>Watch video</span></span>
              </button>
              <div className="showcase-video-caption" aria-live="polite">
                <div><span className="showcase-caption-label">{chapter.category}</span><h2>{chapter.title}</h2></div>
                <p>{chapter.description}</p>
              </div>
            </div>
            <div className="showcase-chapters" aria-label="Choose a walkthrough">
              <p className="showcase-chapter-label">Explore the workspace</p>
              {chapters.map((item, index) => (
                <button key={item.id} className="showcase-chapter" aria-pressed={chapterIndex === index} onClick={() => setChapterIndex(index)}>
                  <span className="showcase-chapter-number" aria-hidden="true">{chapterIndex === index ? <Play size={14} fill="currentColor" /> : String(index + 1).padStart(2, "0")}</span>
                  <span><strong>{item.title}</strong><small>{item.duration}{index === 0 ? "" : ` · ${item.category}`}</small></span>
                </button>
              ))}
              <a className="showcase-chapter-footer" href="#videos">Browse all features <ArrowDown size={15} /></a>
            </div>
          </div>
        </section>

        <section id="videos" className="showcase-container showcase-library" aria-labelledby="library-heading">
          <div className="showcase-section-heading">
            <div><p className="showcase-eyebrow">The feature library</p><h2 id="library-heading">Get to know your workspace.</h2></div>
            <p>Explore a specific tool, or follow the work<br className="showcase-desktop-break" /> from one part of your business to the next.</p>
          </div>
          <div className="showcase-filters" role="group" aria-label="Filter features by category">
            {CATEGORIES.map((item) => (
              <button key={item} aria-pressed={category === item} onClick={() => setCategory(item)}>{item === "All" ? "All features" : item}</button>
            ))}
          </div>
          <p className="showcase-library-count" aria-live="polite">{filteredFeatures.length} features{category !== "All" ? ` in ${category}` : " across your workspace"}</p>
          <div className="showcase-feature-list">
            {filteredFeatures.map((feature) => {
              const available = hasVideo(feature.videoId);
              return (
                <article id={feature.id} key={feature.id} className="showcase-feature">
                  <div className="showcase-feature-content">
                    <span className="showcase-caption-label">{feature.category}</span>
                    <h3>{feature.title}</h3>
                    <p>{feature.description}</p>
                    {available ? (
                      <button className="showcase-text-link" onClick={() => setVideo(feature)} aria-label={`Watch ${feature.title}`}><Play size={13} /> Watch walkthrough <span className="showcase-duration">{feature.duration}</span></button>
                    ) : <span className="showcase-coming-soon">Video coming soon</span>}
                  </div>
                  {available && (
                    <button className="showcase-feature-preview" onClick={() => setVideo(feature)} aria-label={`Play ${feature.title}`}>
                      <VideoPoster videoId={feature.videoId} title={feature.title} /><span aria-hidden="true"><ArrowUpRight size={16} /></span>
                    </button>
                  )}
                </article>
              );
            })}
          </div>
        </section>

        <section className="showcase-audiences" aria-labelledby="audience-heading">
          <div className="showcase-container">
            <div className="showcase-section-heading"><div><p className="showcase-eyebrow">Flowlio in practice</p><h2 id="audience-heading">Different teams. Connected work.</h2></div><p>A shared workspace, shaped around<br className="showcase-desktop-break" /> the services you deliver.</p></div>
            <div className="showcase-audience-layout">
              <div className="showcase-audience-options" role="group" aria-label="Choose your type of team">
                {useCases.map((item, index) => <button key={item.id} aria-pressed={audienceIndex === index} onClick={() => setAudienceIndex(index)}>{item.persona}<ArrowRight size={16} /></button>)}
              </div>
              <div className="showcase-audience-detail" aria-live="polite">
                <h3>{audience.persona}</h3>
                <p>{audience.description}</p>
                <ul>{audience.features.map((feature) => <li key={feature}><Check size={15} />{feature}</li>)}</ul>
                <Link to="/pricing" className="showcase-text-link">Find a plan for your team <ArrowRight size={16} /></Link>
              </div>
            </div>
          </div>
        </section>

        <section className="showcase-container showcase-next" aria-labelledby="next-heading">
          <div><p className="showcase-eyebrow">Your next project starts here</p><h2 id="next-heading">Make room for better work.</h2><p>Bring your clients, projects and team into Flowlio.</p></div>
          <Link to="/pricing" className="showcase-button">Explore plans <ArrowRight size={17} /></Link>
        </section>
      </main>
      <Footer />
      <VideoModal isOpen={video !== null} videoId={video?.videoId ?? ""} title={video?.title ?? ""} onClose={closeVideo} />
    </div>
  );
}
