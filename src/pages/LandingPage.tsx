import { Link } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { ArrowRight, CheckCircle, Users, Zap, Shield, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/app/providers/ThemeProviders';
import { cn } from '@/shared/lib/utils';
import { useEffect, useState } from 'react';

export function LandingPage() {
  const { theme, toggleTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <header
        className={cn(
          'sticky top-0 z-40 px-4 py-6',
          isScrolled && 'bg-background/80 backdrop:blur-sm'
        )}>
        <nav className="flex items-center justify-between container mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">T</span>
            </div>
            <span className="font-bold text-xl dark:text-white">TaskFlow</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="w-9 h-9">
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </Button>
            <Link to="/login">
              <Button className="cursor-pointer" variant="ghost">
                Sign In
              </Button>
            </Link>
            <Link to="/login?mode=signup">
              <Button className="cursor-pointer">Get Started</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Content */}
      <section className="px-4 pt-16 pb-24 md:pt-24 md:pb-32">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 dark:bg-primary/20 rounded-full mb-6">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
            <span className="text-sm font-medium text-primary">
              Now with real-time collaboration
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
            Project management
            <br />
            that actually <span className="text-primary">works</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 mb-10 max-w-2xl leading-relaxed">
            Stop juggling spreadsheets and endless email threads. TaskFlow brings your team together
            with intuitive kanban boards, real-time updates, and powerful collaboration tools.
          </p>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-12">
            <Link to="/login?mode=signup">
              <Button size="lg" className="text-base px-8 h-12 w-full sm:w-auto cursor-pointer">
                Get started free
              </Button>
            </Link>
            <Link to="/login">
              <Button
                size="lg"
                variant="outline"
                className="text-base px-8 h-12 w-full sm:w-auto cursor-pointer">
                Sign in
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-sm text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-primary" />
              <span>Free 14-day trial</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-primary" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-primary" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-slate-900 dark:text-white mb-12">
          Why Choose TaskFlow?
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2 dark:text-white">Real-Time Updates</h3>
            <p className="text-slate-600 dark:text-slate-300">
              See changes instantly across all team members. No refresh needed.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2 dark:text-white">Team Collaboration</h3>
            <p className="text-slate-600 dark:text-slate-300">
              Invite team members, assign tasks, and manage permissions easily.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2 dark:text-white">Secure & Private</h3>
            <p className="text-slate-600 dark:text-slate-300">
              Role-based access control ensures your data is always protected.
            </p>
          </div>
        </div>
      </section>

      {/* Features List */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-slate-900 dark:text-white mb-16">
          Everything You Need
        </h2>
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            'Drag & Drop Kanban Board',
            'Real-time Collaboration',
            'Role-based Access Control',
            'Task Assignment & Tracking',
            'Project Management',
            'Team Member Management',
            'Online Presence Indicators',
            'Dark Mode Support',
            'Mobile Responsive'
          ].map((feature, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-slate-200 dark:border-gray-700">
              <CheckCircle className="w-5 h-5 text-primary shrink-0" />
              <span className="text-slate-700 dark:text-slate-300 font-medium">{feature}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6">
          Ready to Get Started?
        </h2>
        <p className="text-xl text-slate-600 dark:text-slate-300 mb-8">
          Join thousands of teams already using TaskFlow
        </p>
        <Link to="/login?mode=signup">
          <Button size="lg" className="text-sm cursor-pointer">
            Create Free Account <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-gray-700 mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-slate-600 dark:text-slate-400">
          <p>&copy; 2026 TaskFlow. Built with React, Supabase, and TailwindCSS.</p>
        </div>
      </footer>
    </div>
  );
}
