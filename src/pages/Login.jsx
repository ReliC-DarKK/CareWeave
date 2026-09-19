import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ROLES } from '../auth/roles';
import { useAuth } from '../auth/AuthContext';
import {
  User,
  Stethoscope,
  HeartHandshake,
  ShieldCheck,
  Mail,
  Lock,
  Info,
  ArrowRight,
} from 'lucide-react';
import styles from './Login.module.css';

const DEMO_PERSONAS = [
  {
    id: 'p-sarah',
    name: 'Sarah Jenkins',
    role: ROLES.PATIENT,
    buttonText: 'Login as Patient (Sarah Jenkins)',
    description: 'Personal health records, treatment journey, and daily care log',
    icon: User,
  },
  {
    id: 'd-chen',
    name: 'Dr. Chen',
    role: ROLES.DOCTOR,
    buttonText: 'Login as Doctor (Dr. Chen)',
    description: 'Clinical oversight, treatment plans, and patient consultations',
    icon: Stethoscope,
  },
  {
    id: 'cg-marcus',
    name: 'Marcus Jenkins',
    role: ROLES.CAREGIVER,
    buttonText: 'Login as Caregiver (Marcus Jenkins)',
    description: 'Care coordination, appointment accompaniment, and medication oversight',
    icon: HeartHandshake,
  },
];

export function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const destination = location.state?.from?.pathname || '/';
      navigate(destination, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const handlePersonaLogin = async (persona) => {
    try {
      await login({
        id: persona.id,
        name: persona.name,
        role: persona.role,
      });
      const destination = location.state?.from?.pathname || '/';
      navigate(destination, { replace: true });
    } catch (error) {
      console.error('Failed to log in with persona:', error);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        {/* Prototype Demo Banner */}
        <div className={styles.demoBanner} role="status">
          <ShieldCheck size={18} className={styles.bannerIcon} aria-hidden="true" />
          <span className={styles.bannerText}>CareWeave Prototype — Role-Based Access Demo</span>
        </div>

        {/* Brand & Welcome Header */}
        <div className={styles.header}>
          <div className={styles.brandLogo} aria-hidden="true">
            <span className={styles.brandIcon}>CW</span>
          </div>
          <h1 className={styles.brandTitle}>CareWeave</h1>
          <p className={styles.subtitle}>Sign in to your care portal</p>
        </div>

        {/* Demo Personas Section */}
        <div className={styles.section}>
          <h2 className={styles.sectionHeading}>Select Demo Persona</h2>
          <p className={styles.sectionDescription}>
            Explore role-specific workflows and protected views using pre-configured test profiles.
          </p>

          <div className={styles.personaGrid}>
            {DEMO_PERSONAS.map((persona) => {
              const IconComponent = persona.icon;
              return (
                <button
                  key={persona.id}
                  type="button"
                  onClick={() => handlePersonaLogin(persona)}
                  className={styles.personaButton}
                >
                  <div className={styles.personaIconWrapper}>
                    <IconComponent size={20} className={styles.personaIcon} aria-hidden="true" />
                  </div>
                  <div className={styles.personaContent}>
                    <span className={styles.personaName}>{persona.buttonText}</span>
                    <span className={styles.personaDesc}>{persona.description}</span>
                  </div>
                  <ArrowRight size={16} className={styles.personaArrow} aria-hidden="true" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Standard Credentials (Placeholder for P2) */}
        <div className={styles.credentialsSection}>
          <div className={styles.divider}>
            <span className={styles.dividerText}>or sign in with credentials</span>
          </div>

          <form onSubmit={(e) => e.preventDefault()} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="login-email" className={styles.label}>
                Email Address
              </label>
              <div className={styles.inputWrapper}>
                <Mail size={16} className={styles.fieldIcon} aria-hidden="true" />
                <input
                  id="login-email"
                  type="email"
                  placeholder="name@example.com"
                  disabled
                  className={styles.input}
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="login-password" className={styles.label}>
                Password
              </label>
              <div className={styles.inputWrapper}>
                <Lock size={16} className={styles.fieldIcon} aria-hidden="true" />
                <input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  disabled
                  className={styles.input}
                />
              </div>
            </div>

            <button type="button" disabled className={styles.submitButton}>
              Sign In
            </button>
          </form>

          {/* Integration Notice */}
          <div className={styles.noticeCard}>
            <Info size={16} className={styles.noticeIcon} aria-hidden="true" />
            <p className={styles.noticeText}>
              Backend authentication endpoint pending integration (P2). Using demo role switcher for prototype verification.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
