import { Link } from "react-router-dom";
import { FileText, Map, MessagesSquare, ArrowRight } from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "AI Resume Analysis",
    description:
      "Upload your resume and get an instant ATS score, matched vs. missing skills, and concrete suggestions tailored to any job description.",
  },
  {
    icon: Map,
    title: "Personalized Career Roadmap",
    description:
      "Turn your skill gaps into a milestone-by-milestone learning plan for the exact role you're targeting.",
  },
  {
    icon: MessagesSquare,
    title: "AI Mock Interviews",
    description:
      "Practice role-specific interview questions and get instant, structured feedback on every answer.",
  },
];

const LandingPage = () => (
  <div className="min-h-screen bg-slate-50">
    <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
      <div className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
          CP
        </div>
        <span className="text-lg font-bold text-slate-900">CareerPilot</span>
      </div>
      <div className="flex items-center gap-3">
        <Link to="/login" className="btn-ghost">
          Log in
        </Link>
        <Link to="/register" className="btn-primary">
          Get started
        </Link>
      </div>
    </header>

    <section className="mx-auto max-w-4xl px-6 pb-16 pt-12 text-center md:pt-20">
      <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
        Your AI co-pilot for landing the next job
      </h1>
      <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">
        Analyze your resume against real job descriptions, get a personalized roadmap to close
        your skill gaps, and rehearse interviews with instant AI feedback — all in one place.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <Link to="/register" className="btn-primary px-6 py-3 text-base">
          Start for free <ArrowRight size={18} />
        </Link>
        <Link to="/login" className="btn-secondary px-6 py-3 text-base">
          I already have an account
        </Link>
      </div>
    </section>

    <section className="mx-auto grid max-w-6xl gap-6 px-6 pb-24 md:grid-cols-3">
      {features.map(({ icon: Icon, title, description }) => (
        <div key={title} className="card">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <Icon size={22} />
          </div>
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          <p className="mt-2 text-sm text-slate-600">{description}</p>
        </div>
      ))}
    </section>
  </div>
);

export default LandingPage;
