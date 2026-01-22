import { Link } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { ArrowRight, CheckCircle, Users, Zap, Shield } from 'lucide-react';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">T</span>
            </div>
            <span className="font-bold text-xl dark:text-white">TaskFlow</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link to="/login?mode=signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Content */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6">
          Collaborate in Real-Time
          <br />
          <span className="text-primary">Manage Projects Better</span>
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto">
          A modern project management tool with real-time collaboration, drag & drop kanban boards,
          and role-based access control.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link to="/login?mode=signup">
            <Button size="lg" className="text-lg">
              Start Free Trial <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          <Link to="/login">
            <Button size="lg" variant="outline" className="text-lg">
              Sign In
            </Button>
          </Link>
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
      <section className="container mx-auto px-4 py-20 bg-slate-50 dark:bg-gray-900/50 rounded-lg">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-white mb-12">
            Everything You Need
          </h2>
          <div className="space-y-4">
            {[
              'Drag & Drop Kanban Board',
              'Real-time Collaboration',
              'Role-based Access Control (Admin, Editor, Viewer)',
              'Task Assignment & Tracking',
              'Project Management',
              'Team Member Management',
              'Online Presence Indicators',
              'Dark Mode Support',
              'Mobile Responsive'
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-primary shrink-0" />
                <span className="text-slate-700 dark:text-slate-300">{feature}</span>
              </div>
            ))}
          </div>
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
          <Button size="lg" className="text-lg">
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
