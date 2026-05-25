import { Link } from "react-router";
import { FiLinkedin, FiInstagram, FiMail, FiFacebook } from "react-icons/fi";
import Logo from "/logo/5000x5000-3.svg";

const PRODUCT_LINKS = [
  { label: "Showcase",  to: "/showcase" },
  { label: "Pricing",   to: "/pricing" },
  { label: "Workflow",  to: "/workflow" },
  { label: "Insights",  to: "/insights" },
];

const RESOURCES_LINKS = [
  { label: "What is Flowlio?", to: "/what-is-flowlio" },
  { label: "Help Center",      to: null },
  { label: "Blog",             to: null },
  { label: "Community",        to: null },
];

const LEGAL_LINKS = [
  { label: "Privacy Policy",   to: "/privacy-policy" },
  { label: "Terms of Service", to: "/terms-of-service" },
  { label: "Cookie Settings",  to: null },
];

const SOCIAL = [
  { icon: FiFacebook,   href: "https://www.facebook.com/profile.php?id=61584438191609",   label: "Facebook" },
  { icon: FiLinkedin,  href: "https://www.linkedin.com/company/flowlioapp/", label: "LinkedIn" },
  { icon: FiInstagram, href: "https://www.instagram.com/flowlio_crm/", label: "Instagram" },
  { icon: FiMail,      href: "mailto:info@dotvizion.com",     label: "Email" },
];

const NavLink = ({ to, children }: { to: string | null; children: React.ReactNode }) =>
  to ? (
    <Link to={to} className="text-sm text-[#8892A4] hover:text-white transition-colors duration-200">
      {children}
    </Link>
  ) : (
    <span className="text-sm text-[#8892A4] cursor-not-allowed select-none">{children}</span>
  );

export const Footer = () => (
  <footer style={{ background: "#07091A", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
    <div className="max-w-6xl mx-auto px-6 py-16">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-10">

        {/* Brand column */}
        <div className="md:col-span-2 flex flex-col gap-5">
          <a href="https://www.dotvizion.com" className="inline-block">
            <img src={Logo} alt="Flowlio" className="w-auto" />
          </a>
          <p className="text-sm text-[#8892A4] leading-relaxed max-w-xs">
            The all-in-one platform for agencies, freelancers, and service businesses.
            Manage projects, clients, time, and billing — all in one place.
          </p>
          <div className="flex items-center gap-3 mt-1">
            {SOCIAL.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200"
                style={{ background: "rgba(255,255,255,0.06)", color: "#8892A4" }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,107,43,0.15)";
                  (e.currentTarget as HTMLAnchorElement).style.color = "#FF6B2B";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.06)";
                  (e.currentTarget as HTMLAnchorElement).style.color = "#8892A4";
                }}
              >
                <Icon size={15} />
              </a>
            ))}
          </div>
        </div>

        {/* Product */}
        <div className="flex flex-col gap-3">
          <h4 className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-1">Product</h4>
          {PRODUCT_LINKS.map(l => <NavLink key={l.label} to={l.to}>{l.label}</NavLink>)}
        </div>

        {/* Resources */}
        <div className="flex flex-col gap-3">
          <h4 className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-1">Resources</h4>
          {RESOURCES_LINKS.map(l => <NavLink key={l.label} to={l.to}>{l.label}</NavLink>)}
        </div>

        {/* Legal */}
        <div className="flex flex-col gap-3">
          <h4 className="text-xs font-semibold uppercase tracking-widest text-white/40 mb-1">Legal</h4>
          {LEGAL_LINKS.map(l => <NavLink key={l.label} to={l.to}>{l.label}</NavLink>)}
        </div>
      </div>
    </div>

    {/* Bottom bar */}
    <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="max-w-6xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <span className="text-xs text-[#8892A4]">© 2025 Flowlio. All rights reserved.</span>
        <span className="text-xs text-[#8892A4]">
          A product by{" "}
          <a
            href="https://www.dotvizion.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/60 hover:text-white transition-colors duration-200"
          >
            Dotvizion
          </a>
        </span>
      </div>
    </div>
  </footer>
);
