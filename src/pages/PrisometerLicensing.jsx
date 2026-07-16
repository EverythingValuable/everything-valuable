import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { base44 } from "@/api/base44Client";
import {
  ArrowRight, Check, ChevronDown, ChevronUp, Building2, Globe, Layers,
  Shield, BarChart3, Users, Settings, Paintbrush, Zap, FileText
} from "lucide-react";

const MODULES = [
  { icon: BarChart3, title: "Prisometer Pricing", desc: "Dynamic property price display with seller-approved parameters and campaign duration." },
  { icon: Shield, title: "1stBids™ Preview", desc: "Qualified buyer preview period before the primary Prisometer campaign activates." },
  { icon: FileText, title: "Private Offers", desc: "Confidential offer submission visible only to authorized listing representatives." },
  { icon: Zap, title: "Public Bidding", desc: "Visible competitive bidding with configurable increments, reserves, and timed closing." },
  { icon: Check, title: "Make It Mine", desc: "A defined purchase opportunity allowing qualified buyers to act at the established price." },
  { icon: Building2, title: "Enterprise Marketplace", desc: "A branded destination for multiple Prisometer-enabled properties across your portfolio." },
];

const BRANDING = [
  {
    title: "Prisometer Branded",
    desc: "The Prisometer and Everything Valuable identity remain prominent.",
    example: "Powered by the patented Prisometer™ from Everything Valuable",
    tag: "For companies promoting the technology as a distinct advantage",
  },
  {
    title: "Co-Branded",
    desc: "Your branding and the Prisometer identity appear together.",
    example: "Presented by Millbrook Estate Group · Powered by Prisometer™ Technology",
    tag: "For brokerages that want to lead with their own identity",
  },
  {
    title: "Fully Skinned",
    desc: "Styled to closely match your existing website and digital identity. A technology credit or patent notice may appear discreetly, depending on license terms.",
    example: "Your logo · Your colors · Your fonts · Your terminology",
    tag: "For companies requiring a seamless buyer experience",
  },
];

const LICENSES = [
  {
    name: "Pilot",
    ideal: "One property or a limited group",
    features: [
      "Branded or co-branded property pages",
      "Standard Prisometer functionality",
      "Basic visual skinning",
      "Optional 1stBids preview",
      "Optional private offers",
      "Standard registration",
      "Basic administrative reporting",
      "Initial training & launch support",
    ],
  },
  {
    name: "Professional",
    ideal: "Brokerages, auction firms, developers",
    featured: true,
    features: [
      "Multiple active properties",
      "Advanced skinning & custom terminology",
      "Team accounts",
      "Qualification workflows",
      "Optional bidding",
      "Administrative dashboards",
      "Lead exports & reporting",
      "Notification integrations",
      "Priority support",
    ],
  },
  {
    name: "Enterprise",
    ideal: "Networks, franchises, institutions, marketplaces",
    features: [
      "Fully skinned / white-label interface",
      "Dedicated subdomain",
      "Multiple offices & brands",
      "Enterprise user permissions",
      "API access",
      "Custom workflows & integrations",
      "Advanced reporting",
      "Dedicated implementation",
      "Service-level commitments",
    ],
  },
];

const FAQS = [
  { q: "Can the Prisometer match our existing website?", a: "Yes. The licensed platform can be skinned using your company's logo, colors, typography, buttons, page structure, agent presentation, terminology, and other approved brand elements." },
  { q: "Will buyers leave our website?", a: "Not necessarily. The experience can be hosted on a branded subdomain, embedded into your existing website, or presented through fully skinned property pages designed to feel native to your platform." },
  { q: "Does every property have to use bidding?", a: "No. Bidding is optional and can be turned on or off for each property. A brokerage may use public bidding for one property, private offers for another, and a pricing-only Prisometer campaign for a third." },
  { q: "Can we use 1stBids without public bidding?", a: "Yes. 1stBids can be used to qualify buyers and measure early interest before transitioning into private offers or another sales process." },
  { q: "Can the platform use our own terminology?", a: "Yes, subject to the license agreement and the need to clearly explain the legal effect of each buyer action." },
  { q: "Does Everything Valuable become the listing broker?", a: "No. The licensee remains responsible for its brokerage and transaction obligations unless a separate written agreement expressly states otherwise." },
  { q: "Can we begin with one property?", a: "Yes. A pilot license can be structured around a single property or a limited number of listings." },
  { q: "Is territorial exclusivity available?", a: "Potentially. Exclusivity should be based on a defined market, property category, duration, minimum commitment, and performance requirements." },
];

const STEPS = [
  { num: "01", title: "Business Review", desc: "We learn how your company lists property, works with sellers, qualifies buyers, handles offers, and completes transactions." },
  { num: "02", title: "Platform Configuration", desc: "We determine which Prisometer modules to include — pricing, 1stBids, offers, bidding, qualification, and reporting." },
  { num: "03", title: "Brand & Skinning", desc: "We review your guidelines, website, typography, colors, and terminology. The platform is then styled to complement your identity." },
  { num: "04", title: "Compliance Review", desc: "The parties review consumer-facing language, participation terms, privacy requirements, and applicable licensing or auction requirements." },
  { num: "05", title: "Technical Integration", desc: "The platform is hosted, embedded, connected, or deployed according to the agreed implementation model." },
  { num: "06", title: "Testing & Training", desc: "Desktop, mobile, registration, bidding, notifications, and reporting are tested. Agents and administrators are trained." },
  { num: "07", title: "Pilot Launch", desc: "The platform is introduced using an approved pilot property or property group, followed by a performance review." },
];

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border">
      <button onClick={() => setOpen(v => !v)} className="w-full flex items-center justify-between py-5 text-left group">
        <span className="font-medium text-sm group-hover:text-primary transition-colors pr-4">{q}</span>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
      </button>
      {open && <p className="text-sm text-muted-foreground leading-relaxed pb-5">{a}</p>}
    </div>
  );
}

const FORM_DEFAULTS = {
  name: "", company: "", position: "", email: "", phone: "", website: "",
  market: "", annual_listings: "", property_types: "", current_platform: "",
  implementation: [], launch_timing: "", notes: "",
};

const IMPL_OPTIONS = [
  "Prisometer pricing only",
  "Prisometer with private offers",
  "Prisometer with 1stBids",
  "Prisometer with bidding",
  "Fully skinned platform",
  "Enterprise marketplace",
  "API or custom integration",
];

export default function PrisometerLicensing() {
  const [form, setForm] = useState(FORM_DEFAULTS);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleImpl = (opt) => {
    setForm(f => ({
      ...f,
      implementation: f.implementation.includes(opt)
        ? f.implementation.filter(x => x !== opt)
        : [...f.implementation, opt],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await base44.integrations.Core.SendEmail({
      to: "admin@everythingvaluable.com",
      subject: `Prisometer Licensing Inquiry — ${form.company || form.name}`,
      body: `
        <h2>Licensing Consultation Request</h2>
        <p><strong>Name:</strong> ${form.name}</p>
        <p><strong>Company:</strong> ${form.company}</p>
        <p><strong>Position:</strong> ${form.position}</p>
        <p><strong>Email:</strong> ${form.email}</p>
        <p><strong>Phone:</strong> ${form.phone}</p>
        <p><strong>Website:</strong> ${form.website}</p>
        <p><strong>Primary Market:</strong> ${form.market}</p>
        <p><strong>Annual Listings:</strong> ${form.annual_listings}</p>
        <p><strong>Property Types:</strong> ${form.property_types}</p>
        <p><strong>Current Platform:</strong> ${form.current_platform}</p>
        <p><strong>Desired Implementation:</strong> ${form.implementation.join(", ")}</p>
        <p><strong>Estimated Launch:</strong> ${form.launch_timing}</p>
        <p><strong>Notes:</strong> ${form.notes}</p>
      `.trim(),
    }).catch(() => {});
    setSubmitting(false);
    setSubmitted(true);
  };

  return (
    <div className="bg-background">

      {/* Hero */}
      <section className="relative overflow-hidden bg-foreground text-background py-24 md:py-32">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&q=60')", backgroundSize: "cover", backgroundPosition: "center" }} />
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <Badge variant="outline" className="border-background/20 text-background/70 text-xs tracking-widest mb-6">TECHNOLOGY LICENSING</Badge>
            <h1 className="font-serif text-4xl md:text-6xl font-semibold leading-tight mb-6">
              Bring the PRI$OMETER™<br />to Your Real Estate Business
            </h1>
            <p className="text-background/70 text-lg leading-relaxed max-w-2xl mx-auto mb-4">
              License a patented, configurable real estate pricing and bidding platform designed to fit your brand, your website, and your method of selling property.
            </p>
            <p className="text-background/50 text-sm leading-relaxed max-w-2xl mx-auto mb-10">
              Available as a Prisometer-branded, co-branded, or fully skinned experience for qualified real estate organizations.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <a href="#consult">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 h-12 px-8">
                  Request a Licensing Consultation <ArrowRight className="w-4 h-4" />
                </Button>
              </a>
              <Link to="/real-property">
                <Button size="lg" variant="outline" className="border-background/30 text-background hover:bg-background/10 h-12 px-8">
                  Explore the Platform
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Positioning statement */}
      <section className="py-12 bg-primary/5 border-y border-primary/10">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="text-base md:text-lg text-foreground leading-relaxed font-medium">
            The PRI$OMETER™ is a patented, skinnable real estate pricing and bidding platform that can be configured to support traditional offers, private offers, qualified previews, public bidding, or a complete hybrid transaction experience — while fitting the visual identity and operating model of the licensed real estate company.
          </p>
        </div>
      </section>

      {/* Intro */}
      <section className="py-20 md:py-24 max-w-screen-xl mx-auto px-6 md:px-8">
        <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-start">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">More Than a Listing Page</span>
            <h2 className="font-serif text-3xl md:text-4xl font-semibold mt-3 mb-5 leading-tight">A More Active Property Experience</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">Most real estate websites present a property at a fixed asking price and wait for buyers to respond. The Prisometer creates a more active and engaging experience.</p>
            <p className="text-muted-foreground leading-relaxed">It allows a real estate company to introduce a property through a structured campaign incorporating dynamic pricing, qualified buyer previews, private offers, visible bidding, scheduled activity, and direct purchase opportunities.</p>
          </div>
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Each Implementation Configured Around</p>
            {[
              "The licensee's brand and visual identity",
              "The seller's objectives and timeline",
              "The property type and transaction structure",
              "Buyer qualification requirements",
              "Local legal and regulatory requirements",
              "Existing brokerage workflows",
              "Preferred sales methods — offers, bids, or hybrid",
            ].map(item => (
              <div key={item} className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                <span className="text-sm text-foreground">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Skinning / Branding */}
      <section className="py-20 md:py-24 bg-secondary/40">
        <div className="max-w-screen-xl mx-auto px-6 md:px-8">
          <div className="text-center mb-14">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Skinnable Technology</span>
            <h2 className="font-serif text-3xl md:text-4xl font-semibold mt-3">Designed to Look Like Your Platform</h2>
            <p className="text-muted-foreground mt-4 max-w-xl mx-auto text-sm leading-relaxed">Rather than directing buyers to a separate, unfamiliar platform, the Prisometer can be presented as a natural extension of your company's digital experience.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {BRANDING.map((b, i) => (
              <motion.div key={b.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-background border border-border p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-base">{b.title}</h3>
                  <Badge variant="outline" className="text-[10px]">{["OPTION 1", "OPTION 2", "OPTION 3"][i]}</Badge>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{b.desc}</p>
                <div className="mt-auto">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Example</p>
                  <p className="text-xs font-medium italic text-foreground border-l-2 border-primary pl-3">{b.example}</p>
                </div>
                <p className="text-[10px] text-muted-foreground">{b.tag}</p>
              </motion.div>
            ))}
          </div>
          <div className="bg-background border border-border p-6 md:p-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">The Interface Can Match Your</p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                  {["Logo & company name","Brand colors","Typography","Button styles","Iconography","Page spacing","Navigation","Property-card design","Photography style","Agent information","Contact options","Terminology"].map(item => (
                    <div key={item} className="flex items-center gap-2 text-sm">
                      <Check className="w-3 h-3 text-primary shrink-0" />{item}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Language Can Be Adapted — Examples</p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm text-muted-foreground">
                  {["Prisometer Price → Dynamic Property Price","1stBids → Qualified Preview","Make It Mine → Request Purchase","Place a Bid → Submit an Offer","Register Interest → Express Interest","First Bids → Early Offer Period"].map(item => (
                    <p key={item} className="text-xs border-l border-border pl-2">{item}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modules */}
      <section className="py-20 md:py-24 max-w-screen-xl mx-auto px-6 md:px-8">
        <div className="text-center mb-14">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Modular Platform</span>
          <h2 className="font-serif text-3xl md:text-4xl font-semibold mt-3">Use Only What Your Business Needs</h2>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto text-sm">The Prisometer is modular. A licensee does not need to use every feature, and public bidding is not required. Each property campaign can be configured differently.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {MODULES.map((m, i) => (
            <motion.div key={m.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
              className="border border-border p-6 hover:border-primary/40 transition-colors">
              <m.icon className="w-5 h-5 text-primary mb-4" />
              <h3 className="font-semibold mb-2">{m.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{m.desc}</p>
            </motion.div>
          ))}
        </div>
        <div className="mt-8 p-5 bg-primary/5 border border-primary/15 text-center">
          <p className="text-sm text-foreground font-medium">Public bidding can be activated, modified, restricted, kept private, or removed entirely. Each licensee determines which experience is appropriate for its business and each individual property.</p>
        </div>
      </section>

      {/* Licensee Benefits */}
      <section className="py-20 md:py-24 bg-foreground text-background">
        <div className="max-w-screen-xl mx-auto px-6 md:px-8">
          <div className="text-center mb-14">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Why License</span>
            <h2 className="font-serif text-3xl md:text-4xl font-semibold mt-3">Why License the PRI$OMETER™?</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Paintbrush, title: "Preserve Your Brand", desc: "The platform can be skinned to look like an integrated part of your company's existing website." },
              { icon: Users, title: "Maintain Client Relationships", desc: "The licensee remains the visible real estate company and primary buyer and seller contact." },
              { icon: Zap, title: "Create Reasons to Act", desc: "Campaign dates, qualified previews, current pricing, bid activity, and purchase opportunities give buyers defined moments to engage." },
              { icon: BarChart3, title: "Measure Real Buyer Interest", desc: "Track registrations, qualifications, preview activity, inquiries, bids, offers, and campaign conversions." },
              { icon: Layers, title: "Support Multiple Sales Methods", desc: "Use the platform for traditional offers, private offers, competitive bidding, timed campaigns, or hybrid strategies." },
              { icon: Building2, title: "Build a Proprietary Marketplace", desc: "Enterprise licensees may create a branded marketplace containing multiple Prisometer-enabled properties." },
            ].map((b, i) => (
              <motion.div key={b.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                className="border border-background/10 p-6">
                <b.icon className="w-5 h-5 text-primary mb-4" />
                <h3 className="font-semibold mb-2">{b.title}</h3>
                <p className="text-sm text-background/60 leading-relaxed">{b.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Who Can License */}
      <section className="py-20 md:py-24 max-w-screen-xl mx-auto px-6 md:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Eligibility</span>
            <h2 className="font-serif text-3xl md:text-4xl font-semibold mt-3 mb-5">Who Can License the Technology?</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">Licensing may be appropriate for qualified real estate organizations. Eligibility may depend upon the organization's market, intended use, regulatory requirements, technical needs, and proposed transaction model.</p>
          </div>
          <div className="grid grid-cols-2 gap-x-8 gap-y-2">
            {[
              "Independent real estate brokerages","Regional brokerage networks","National real estate companies","Luxury residential firms","Real estate auction companies","Commercial brokerages","Developers","New-construction sales teams",
              "Land and farm specialists","Estate and trust representatives","Banks & institutional owners","Receivers & court-appointed reps","Property marketplaces","Real estate franchise systems","Real estate technology companies",
            ].map(item => (
              <div key={item} className="flex items-start gap-2 text-sm py-1 border-b border-border/50">
                <div className="w-1 h-1 rounded-full bg-primary mt-2 shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integration */}
      <section className="py-20 md:py-24 bg-secondary/40">
        <div className="max-w-screen-xl mx-auto px-6 md:px-8">
          <div className="text-center mb-14">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Integration</span>
            <h2 className="font-serif text-3xl md:text-4xl font-semibold mt-3">Built to Work With Your Existing Presence</h2>
            <p className="text-muted-foreground mt-4 max-w-xl mx-auto text-sm">A licensee does not necessarily need to replace its existing website or listing systems.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Globe, title: "Hosted Campaign Pages", desc: "Everything Valuable hosts the property experience on an approved branded or co-branded platform." },
              { icon: Building2, title: "Branded Subdomain", desc: "The Prisometer experience operates through offers.yourcompany.com or prisometer.yourcompany.com." },
              { icon: Layers, title: "Embedded Experience", desc: "Selected pricing, preview, registration, or bidding components are incorporated into an existing property page." },
              { icon: Paintbrush, title: "Fully Skinned Property Pages", desc: "Complete property pages are created to visually match the licensee's main website." },
              { icon: Settings, title: "API Integration", desc: "Property, user, campaign, bidding, and reporting information connected to existing systems." },
              { icon: Building2, title: "Custom Enterprise Deployment", desc: "Dedicated environment with custom workflows, integrations, user permissions, and branding." },
            ].map((item, i) => (
              <motion.div key={item.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                className="bg-background border border-border p-6">
                <item.icon className="w-5 h-5 text-primary mb-4" />
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Licensing Options */}
      <section className="py-20 md:py-24 max-w-screen-xl mx-auto px-6 md:px-8">
        <div className="text-center mb-14">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Licensing Options</span>
          <h2 className="font-serif text-3xl md:text-4xl font-semibold mt-3">Flexible Licensing for Different Organizations</h2>
          <p className="text-muted-foreground mt-4 max-w-lg mx-auto text-sm">Pricing is custom — structured around the organization's needs, implementation scope, and intended use.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {LICENSES.map((l, i) => (
            <motion.div key={l.name} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className={`relative border p-7 flex flex-col gap-5 ${l.featured ? "border-primary bg-primary/5" : "border-border bg-background"}`}>
              {l.featured && <Badge className="absolute top-5 right-5 text-[10px]">Most Popular</Badge>}
              <div>
                <h3 className="font-serif text-xl font-semibold">{l.name} License</h3>
                <p className="text-xs text-muted-foreground mt-1">{l.ideal}</p>
              </div>
              <ul className="space-y-2 flex-1">
                {l.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <a href="#consult">
                <Button className={`w-full ${l.featured ? "bg-primary text-primary-foreground" : "bg-foreground text-background hover:bg-foreground/85"}`}>
                  Inquire About {l.name}
                </Button>
              </a>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Process */}
      <section className="py-20 md:py-24 bg-foreground text-background">
        <div className="max-w-screen-xl mx-auto px-6 md:px-8">
          <div className="text-center mb-14">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Process</span>
            <h2 className="font-serif text-3xl md:text-4xl font-semibold mt-3">From Discovery to Launch</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {STEPS.map((s, i) => (
              <motion.div key={s.num} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                className="border border-background/10 p-5">
                <span className="font-price text-3xl font-bold text-primary/50">{s.num}</span>
                <h3 className="font-semibold mt-3 mb-2">{s.title}</h3>
                <p className="text-sm text-background/60 leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 md:py-24 max-w-3xl mx-auto px-6 md:px-8">
        <div className="text-center mb-12">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">FAQ</span>
          <h2 className="font-serif text-3xl md:text-4xl font-semibold mt-3">Frequently Asked Questions</h2>
        </div>
        {FAQS.map(f => <FaqItem key={f.q} {...f} />)}
      </section>

      {/* Consultation Form */}
      <section id="consult" className="py-20 md:py-24 bg-secondary/40">
        <div className="max-w-2xl mx-auto px-6 md:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Get Started</span>
            <h2 className="font-serif text-3xl md:text-4xl font-semibold mt-3">Request a Licensing Consultation</h2>
            <p className="text-muted-foreground mt-4 text-sm leading-relaxed">Everything Valuable can work with your organization to create a Prisometer implementation that reflects your brand, supports your transaction process, and scales from a single pilot property to a complete real estate marketplace.</p>
          </div>

          {submitted ? (
            <div className="bg-background border border-border p-10 text-center">
              <Check className="w-10 h-10 text-primary mx-auto mb-4" />
              <h3 className="font-serif text-xl font-semibold mb-2">Thank You</h3>
              <p className="text-sm text-muted-foreground">Your inquiry has been received. A member of our team will be in touch to schedule a consultation.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-background border border-border p-8 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                {[["name","Name *","text",true],["company","Company *","text",true],["position","Position","text",false],["email","Email *","email",true],["phone","Phone","tel",false],["website","Company Website","url",false]].map(([id, label, type, req]) => (
                  <div key={id} className={id === "name" || id === "company" ? "" : ""}>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">{label}</label>
                    <input type={type} required={req} value={form[id]} onChange={e => setForm(f => ({...f,[id]:e.target.value}))}
                      className="w-full h-10 px-3 border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[["market","Primary Market"],["annual_listings","Annual Listings (approx.)"],["property_types","Typical Property Types"],["current_platform","Current Listing Platform"]].map(([id, label]) => (
                  <div key={id}>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">{label}</label>
                    <input type="text" value={form[id]} onChange={e => setForm(f => ({...f,[id]:e.target.value}))}
                      className="w-full h-10 px-3 border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                ))}
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Desired Implementation (select all that apply)</label>
                <div className="grid grid-cols-2 gap-2">
                  {IMPL_OPTIONS.map(opt => (
                    <button key={opt} type="button" onClick={() => handleImpl(opt)}
                      className={`flex items-center gap-2 px-3 py-2 border text-xs text-left transition-colors ${form.implementation.includes(opt) ? "border-primary bg-primary/5 text-foreground" : "border-border text-muted-foreground hover:border-foreground/30"}`}>
                      <div className={`w-3.5 h-3.5 border flex items-center justify-center shrink-0 ${form.implementation.includes(opt) ? "border-primary bg-primary" : "border-border"}`}>
                        {form.implementation.includes(opt) && <Check className="w-2.5 h-2.5 text-white" />}
                      </div>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Estimated Launch Timing</label>
                <input type="text" placeholder="e.g. Q3 2026, within 90 days" value={form.launch_timing} onChange={e => setForm(f => ({...f, launch_timing: e.target.value}))}
                  className="w-full h-10 px-3 border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Additional Information</label>
                <textarea rows={4} value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))}
                  className="w-full px-3 py-2 border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
              </div>
              <Button type="submit" disabled={submitting} className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90">
                {submitting ? "Submitting..." : "Submit Inquiry"}
              </Button>
              <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
                Submitting this form does not create a license, partnership, franchise, brokerage relationship, agency relationship, joint venture, or other legal obligation. All licensing arrangements are subject to evaluation, compliance review, and a definitive written agreement.
              </p>
            </form>
          )}
        </div>
      </section>

    </div>
  );
}