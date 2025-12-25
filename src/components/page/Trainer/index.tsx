import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Dumbbell, Users, TrendingUp, Award } from "lucide-react";

const Index = () => {
  return (
    <>
      <style>{`
        .landing-container {
          min-height: 100vh;
          background-color: hsl(var(--background));
        }
        .hero-section {
          position: relative;
          overflow: hidden;
          background: linear-gradient(to bottom right, hsl(var(--primary)), hsl(var(--primary) / 0.95), hsl(var(--accent)));
          padding-top: 5rem;
          padding-bottom: 5rem;
          padding-left: 1.5rem;
          padding-right: 1.5rem;
        }
        .container-width {
          width: 100%;
          margin-left: auto;
          margin-right: auto;
          max-width: 72rem;
        }
        .hero-content {
          text-align: center;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          color: hsl(var(--primary-foreground));
        }
        .hero-title {
          font-size: 3rem;
          font-weight: 700;
          line-height: 1.25;
        }
        @media (min-width: 768px) {
          .hero-title {
            font-size: 3.75rem;
          }
        }
        .hero-desc {
          font-size: 1.25rem;
          color: hsl(var(--primary-foreground) / 0.9);
          max-width: 42rem;
          margin-left: auto;
          margin-right: auto;
        }
        @media (min-width: 768px) {
          .hero-desc {
            font-size: 1.5rem;
          }
        }
        .hero-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          padding-top: 1.5rem;
        }
        .btn-primary {
          background-color: hsl(var(--accent));
          color: hsl(var(--accent-foreground));
          font-weight: 600;
        }
        .btn-primary:hover {
          background-color: hsl(var(--accent) / 0.9);
        }
        .btn-secondary {
          background-color: hsl(var(--primary-foreground) / 0.1);
          border-color: hsl(var(--primary-foreground) / 0.3);
          color: hsl(var(--primary-foreground));
        }
        .btn-secondary:hover {
          background-color: hsl(var(--primary-foreground) / 0.2);
        }
        .features-section {
          padding-top: 5rem;
          padding-bottom: 5rem;
          padding-left: 1.5rem;
          padding-right: 1.5rem;
        }
        .section-title {
          font-size: 1.875rem;
          font-weight: 700;
          text-align: center;
          margin-bottom: 3rem;
          color: hsl(var(--foreground));
        }
        @media (min-width: 768px) {
          .section-title {
            font-size: 2.25rem;
          }
        }
        .features-grid {
          display: grid;
          grid-template-columns: repeat(1, minmax(0, 1fr));
          gap: 2rem;
        }
        @media (min-width: 768px) {
          .features-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
        @media (min-width: 1024px) {
          .features-grid {
            grid-template-columns: repeat(4, minmax(0, 1fr));
          }
        }
        .feature-card {
          text-align: center;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          padding: 1.5rem;
          border-radius: 0.5rem;
          background-color: hsl(var(--card));
          border: 1px solid hsl(var(--border));
          transition: box-shadow 0.2s;
        }
        .feature-card:hover {
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }
        .feature-icon-wrapper {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 4rem;
          height: 4rem;
          border-radius: 9999px;
          background-color: hsl(var(--accent) / 0.1);
          margin-left: auto;
          margin-right: auto;
        }
        .feature-icon {
          height: 2rem;
          width: 2rem;
          color: hsl(var(--accent));
        }
        .feature-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: hsl(var(--card-foreground));
        }
        .feature-desc {
          color: hsl(var(--muted-foreground));
        }
        .cta-section {
          padding-top: 5rem;
          padding-bottom: 5rem;
          padding-left: 1.5rem;
          padding-right: 1.5rem;
          background-color: hsl(var(--muted) / 0.3);
        }
        .cta-content {
          width: 100%;
          margin-left: auto;
          margin-right: auto;
          max-width: 56rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          align-items: center;
        }
        .cta-title {
          font-size: 1.875rem;
          font-weight: 700;
          color: hsl(var(--foreground));
        }
        @media (min-width: 768px) {
          .cta-title {
            font-size: 2.25rem;
          }
        }
        .cta-desc {
          font-size: 1.25rem;
          color: hsl(var(--muted-foreground));
        }
      `}</style>
      <div className="landing-container">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="container-width">
            <div className="hero-content">
              <h1 className="hero-title">
                FitPro Trainer Platform
              </h1>
              <p className="hero-desc">
                Connect with certified trainers, track your progress, and transform your fitness journey
              </p>
              <div className="hero-actions">
                <Link to="/auth">
                  <Button size="lg" className="btn-primary">
                    Get Started
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="btn-secondary">
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="features-section">
          <div className="container-width">
            <h2 className="section-title">
              Why Choose FitPro?
            </h2>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon-wrapper">
                  <Dumbbell className="feature-icon" />
                </div>
                <h3 className="feature-title">Expert Trainers</h3>
                <p className="feature-desc">
                  Work with certified professionals who understand your goals
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon-wrapper">
                  <TrendingUp className="feature-icon" />
                </div>
                <h3 className="feature-title">Track Progress</h3>
                <p className="feature-desc">
                  Monitor your improvements with detailed analytics
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon-wrapper">
                  <Users className="feature-icon" />
                </div>
                <h3 className="feature-title">Community</h3>
                <p className="feature-desc">
                  Join a supportive community of fitness enthusiasts
                </p>
              </div>

              <div className="feature-card">
                <div className="feature-icon-wrapper">
                  <Award className="feature-icon" />
                </div>
                <h3 className="feature-title">Achieve Goals</h3>
                <p className="feature-desc">
                  Reach your fitness milestones with personalized plans
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
          <div className="cta-content">
            <h2 className="cta-title">
              Ready to Start Your Journey?
            </h2>
            <p className="cta-desc">
              Join thousands of users who have transformed their lives with FitPro
            </p>
            <Link to="/auth">
              <Button size="lg" className="btn-primary">
                Sign Up Now
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </>
  );
};

export default Index;
