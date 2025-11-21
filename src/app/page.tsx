import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, Settings, ShieldCheck } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-black text-slate-900 dark:text-slate-50 font-sans selection:bg-blue-500/30">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="text-lg font-semibold tracking-tight">
            Equipment Reservation
          </div>
          <Link href="/login">
            <Button
              size="sm"
              className="rounded-full px-6 bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-slate-200 transition-all"
            >
              Login
            </Button>
          </Link>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="pt-32 pb-20 md:pt-48 md:pb-32 px-4 text-center">
          <div className="container mx-auto max-w-4xl">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-slate-900 to-slate-700 dark:from-white dark:to-slate-400 pb-2">
              Equipment Management,
              <br className="md:hidden" /> Made Smarter.
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              Intuitive calendar reservations, detailed equipment management,
              and seamless experience.
              <br />
              Eq Reservation takes your organization&apos;s equipment management to
              the next level.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/login">
                <Button
                  size="lg"
                  className="rounded-full px-8 h-12 text-lg bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25 transition-all hover:scale-105"
                >
                  Get Started
                </Button>
              </Link>
              <Link
                href="#features"
                className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium"
              >
                View Features <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Feature Highlights */}
        <section
          id="features"
          className="py-24 bg-slate-50 dark:bg-slate-900/50"
        >
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto">
              {/* Feature 1 */}
              <div className="flex flex-col items-center text-center group">
                <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Calendar className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-2xl font-semibold mb-3">
                  Smart Reservations
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Check availability at a glance with an intuitive calendar UI.
                  Achieve reliable reservation management without conflicts.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="flex flex-col items-center text-center group">
                <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Settings className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-2xl font-semibold mb-3">
                  Detailed Equipment Management
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Hierarchical management by building, floor, and room.
                  Centrally manage equipment details and status information.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="flex flex-col items-center text-center group">
                <div className="w-16 h-16 rounded-2xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <ShieldCheck className="w-8 h-8 text-violet-600 dark:text-violet-400" />
                </div>
                <h3 className="text-2xl font-semibold mb-3">
                  Secure & Reliable
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Role-based access control and robust authentication system.
                  Keep your valuable asset data safe and secure.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 px-4 text-center">
          <div className="container mx-auto max-w-3xl">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Management Made Simple.
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 mb-10">
              Start efficient equipment management with Eq Reservation.
            </p>
            <Link href="/login">
              <Button
                size="lg"
                className="rounded-full px-10 h-14 text-xl bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-slate-200 shadow-xl transition-all hover:scale-105"
              >
                Login to Get Started
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-4 text-center text-sm text-slate-500 dark:text-slate-400">
          <p>
            &copy; {new Date().getFullYear()} Eq Reservation. All rights
            reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
