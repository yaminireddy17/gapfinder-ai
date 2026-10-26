
"use client";

import { useState } from "react";
import UploadBox from "./UploadBox";

const features = [
  {
    number: "01",
    icon: "◈",
    title: "Knowledge Gap Detection",
    description:
      "Discover topics you understand, topics you partially know, and concepts that need more attention.",
  },
  {
    number: "02",
    icon: "◎",
    title: "AI Diagnostic Assessment",
    description:
      "Generate questions from your learning material and evaluate your understanding topic by topic.",
  },
  {
    number: "03",
    icon: "↗",
    title: "Adaptive Revision Plan",
    description:
      "Turn your weak areas into a prioritized revision plan that helps you study with purpose.",
  },
];

const topics = [
  { name: "Data Structures", score: 84, status: "Strong", color: "#34d399" },
  { name: "Operating Systems", score: 46, status: "Needs work", color: "#fbbf24" },
  { name: "Computer Networks", score: 28, status: "Weak", color: "#fb7185" },
  { name: "Database Systems", score: 68, status: "Improving", color: "#60a5fa" },
];

export default function Home() {
  const [email, setEmail] = useState("");
  const [showDemo, setShowDemo] = useState(false);

  return (
    <main className="min-h-screen overflow-hidden bg-[#080d19] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(99,102,241,0.17),transparent_55%)]" />

      <nav className="relative mx-auto flex max-w-7xl items-center justify-between border-b border-white/[0.08] px-6 py-5 lg:px-10">
        <a href="#" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500 text-xl font-bold shadow-lg shadow-indigo-500/25">
            G
          </div>
          <span className="text-lg font-semibold tracking-tight">
            GapFinder<span className="text-indigo-400"> AI</span>
          </span>
        </a>

        <div className="hidden items-center gap-8 text-sm text-slate-400 md:flex">
          <a href="#features" className="transition hover:text-white">Features</a>
          <a href="#how-it-works" className="transition hover:text-white">How it works</a>
          <a href="#dashboard" className="transition hover:text-white">Dashboard</a>
        </div>

        <button
          onClick={() => document.getElementById("get-started")?.scrollIntoView({ behavior: "smooth" })}
          className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-indigo-100"
        >
          Get started <span aria-hidden="true">↗</span>
        </button>
      </nav>

      <section className="relative mx-auto grid max-w-7xl items-center gap-14 px-6 py-20 md:py-28 lg:grid-cols-[1.05fr_0.95fr] lg:px-10">
        <div>
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-400/[0.08] px-4 py-2 text-xs font-medium tracking-wide text-indigo-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            YOUR PERSONAL AI LEARNING INTELLIGENCE
          </div>

          <h1 className="max-w-2xl text-5xl font-semibold leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl">
            Find what you
            <br />
            don&apos;t know.
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-300 bg-clip-text text-transparent">
              Master it.
            </span>
          </h1>

          <p className="mt-7 max-w-xl text-base leading-8 text-slate-400 sm:text-lg">
            Stop studying everything equally. GapFinder AI analyzes your syllabus,
            notes, and question papers to uncover hidden knowledge gaps and
            build a revision plan tailored to you.
          </p>

          <div className="mt-9 flex flex-col gap-4 sm:flex-row">
            <button
              onClick={() => document.getElementById("get-started")?.scrollIntoView({ behavior: "smooth" })}
              className="rounded-xl bg-indigo-500 px-7 py-4 font-semibold shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-400"
            >
              Discover your gaps <span aria-hidden="true">→</span>
            </button>
            <button
              onClick={() => document.getElementById("dashboard")?.scrollIntoView({ behavior: "smooth" })}
              className="rounded-xl border border-white/10 bg-white/[0.03] px-7 py-4 font-medium text-slate-200 transition hover:bg-white/[0.07]"
            >
              Explore dashboard
            </button>
          </div>

          <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-400">
            <span>✓ Personalized learning</span>
            <span>✓ Evidence-based insights</span>
            <span>✓ Smarter revision</span>
          </div>
        </div>

        <div id="dashboard" className="relative">
          <div className="absolute -inset-5 rounded-[2rem] bg-indigo-500/[0.08] blur-3xl" />
          <div className="relative rounded-3xl border border-white/10 bg-[#0d1424]/95 p-5 shadow-2xl shadow-black/30 sm:p-7">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-400">Learning intelligence</p>
                <h2 className="mt-1 text-xl font-semibold">Your knowledge map</h2>
              </div>
              <span className="rounded-lg border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs text-emerald-300">
                Demo preview
              </span>
            </div>

            <div className="mt-7 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4">
                <p className="text-sm text-slate-400">Topics analyzed</p>
                <p className="mt-2 text-3xl font-semibold">12</p>
                <p className="mt-1 text-xs text-slate-500">Across 3 chapters</p>
              </div>
              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4">
                <p className="text-sm text-slate-400">Mastery score</p>
                <p className="mt-2 text-3xl font-semibold">64<span className="text-lg text-slate-400">%</span></p>
                <p className="mt-1 text-xs text-indigo-300">Sample data only</p>
              </div>
            </div>

            <div className="mt-7">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-medium">Topic-level understanding</h3>
                <span className="text-xs text-slate-500">Illustrative scores</span>
              </div>

              <div className="space-y-5">
                {topics.map((topic) => (
                  <div key={topic.name}>
                    <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                      <span className="text-slate-200">{topic.name}</span>
                      <span style={{ color: topic.color }} className="text-xs">
                        {topic.status} · {topic.score}%
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/[0.07]">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${topic.score}%`, backgroundColor: topic.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-7 rounded-2xl border border-rose-400/15 bg-rose-400/[0.06] p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-rose-300">
                <span>✦</span> Recommended priority
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Start with Computer Networks, then revise Operating Systems.
                Focus on your lowest-scoring topics first.
              </p>
              <p className="mt-2 text-xs text-slate-500">
                Example recommendation based on sample data
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="relative border-y border-white/[0.07] bg-white/[0.015]">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-400">Beyond a chatbot</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              Don&apos;t just get answers.
              <br />Understand your gaps.
            </h2>
            <p className="mt-5 leading-7 text-slate-400">
              A learning intelligence platform that turns your study material
              into measurable insights and actionable revision priorities.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {features.map((feature) => (
              <article key={feature.number} className="group rounded-2xl border border-white/[0.08] bg-[#0d1424] p-7 transition duration-300 hover:-translate-y-1 hover:border-indigo-400/40">
                <div className="flex items-center justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-400/10 text-2xl text-indigo-300">
                    {feature.icon}
                  </span>
                  <span className="text-sm text-slate-600">{feature.number}</span>
                </div>
                <h3 className="mt-7 text-xl font-semibold">{feature.title}</h3>
                <p className="mt-4 text-sm leading-7 text-slate-400">{feature.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="upload" className="relative px-6 py-16">
  <UploadBox />
</section>
      <section id="how-it-works" className="relative mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-400">The workflow</p>
          <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">From study material to mastery</h2>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-4">
          {[
            ["01", "Upload", "Provide your syllabus, notes, chapters, or past papers."],
            ["02", "Analyze", "Extract topics and create a structured knowledge map."],
            ["03", "Diagnose", "Answer assessments to identify strengths and gaps."],
            ["04", "Improve", "Follow a prioritized revision plan and track progress."],
          ].map(([number, title, description]) => (
            <div key={number} className="rounded-2xl border border-white/[0.08] p-6">
              <p className="text-sm font-medium text-indigo-400">{number} / STEP</p>
              <h3 className="mt-5 text-lg font-semibold">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-400">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="get-started" className="relative px-6 pb-24">
        <div className="mx-auto max-w-4xl rounded-3xl border border-indigo-400/20 bg-gradient-to-br from-indigo-500/15 via-[#11182b] to-cyan-500/[0.07] px-6 py-12 text-center sm:px-12 sm:py-16">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-300">Your next step</p>
          <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
            Make every study session count.
          </h2>
          <p className="mx-auto mt-5 max-w-xl leading-7 text-slate-400">
            Start building a clearer picture of what you know, what you need
            to revise, and where your effort matters most.
          </p>

          <form
            className="mx-auto mt-8 flex max-w-lg flex-col gap-3 sm:flex-row"
            onSubmit={(event) => {
              event.preventDefault();
              setShowDemo(true);
            }}
          >
            <input
              type="email"
              required
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setShowDemo(false);
              }}
              placeholder="Enter your email address"
              className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#080d19]/80 px-5 py-4 text-sm outline-none placeholder:text-slate-500 focus:border-indigo-400"
            />
            <button type="submit" className="rounded-xl bg-indigo-500 px-6 py-4 text-sm font-semibold transition hover:bg-indigo-400">
              Get started →
            </button>
          </form>

          {showDemo && (
            <p role="status" className="mt-5 text-sm text-emerald-300">
              Thanks! This is a UI demo. Account creation is not connected yet.
            </p>
          )}

          <p className="mt-5 text-xs text-slate-500">
            Frontend prototype · Sample dashboard data · AI features coming next
          </p>
        </div>
      </section>

      <footer className="relative border-t border-white/[0.08] px-6 py-7">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 text-sm text-slate-500 sm:flex-row">
          <p>© 2026 GapFinder AI. Learn smarter, not just longer.</p>
          <p>Built with Next.js · TypeScript · Tailwind CSS</p>
        </div>
      </footer>
    </main>
  );
}
