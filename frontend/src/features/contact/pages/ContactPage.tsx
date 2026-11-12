import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  MapPin,
  Send,
  Copy,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { PROFILE_DATA } from "../../../data/profile";
import { GithubIcon } from "../../home/components/GithubIcon";
import styles from "./ContactPage.module.css";

export const ContactPage: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Please provide your name.";
    if (!email.trim()) {
      errs.email = "Please provide your email address.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email =
        "Please provide a valid email format (e.g. name@domain.com).";
    }
    if (!subject.trim()) errs.subject = "Please provide a subject line.";
    if (!message.trim()) errs.message = "Please provide a message.";
    return errs;
  };

  const handleMailtoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);

    if (Object.keys(errs).length > 0) return;

    const recipient = PROFILE_DATA.contact.email || "developer@example.com";
    const fullBody = `From: ${name.trim()} (${email.trim()})\n\nMessage:\n${message.trim()}`;
    const mailtoUrl = `mailto:${recipient}?subject=${encodeURIComponent(
      subject.trim(),
    )}&body=${encodeURIComponent(fullBody)}`;

    window.location.href = mailtoUrl;
  };

  const handleCopyDraft = () => {
    const errs = validate();
    setErrors(errs);

    if (Object.keys(errs).length > 0) return;

    const fullBody = `Name: ${name.trim()}\nEmail: ${email.trim()}\nSubject: ${subject.trim()}\n\nMessage:\n${message.trim()}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(fullBody).then(() => {
        setCopyStatus("Message draft copied to clipboard!");
        setTimeout(() => setCopyStatus(null), 3500);
      });
    }
  };

  return (
    <motion.article
      className={styles.container}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      aria-label="Contact Information and Inquiries"
    >
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.badge}>
          <Mail size={14} aria-hidden="true" />
          <span>Contact & Outreach</span>
        </div>
        <h1 className={styles.title}>Get in Touch</h1>
        <p className={styles.subtitle}>
          Have an inquiry, project collaboration idea, or software engineering
          opportunity? Reach out directly via email or prepare a structured
          message draft below.
        </p>
      </header>

      {/* Two Column Grid */}
      <div className={styles.grid}>
        {/* Contact Info Column */}
        <aside
          className={styles.infoColumn}
          aria-label="Direct contact details"
        >
          <div className={styles.infoCard}>
            <h2 className={styles.cardTitle}>
              <Mail
                size={18}
                className={styles.contactIcon}
                aria-hidden="true"
              />
              <span>Direct Communication</span>
            </h2>

            {PROFILE_DATA.contact.email && (
              <div className={styles.contactItem}>
                <span className={styles.contactIcon}>
                  <Mail size={16} aria-hidden="true" />
                </span>
                <div>
                  <div>Email Address</div>
                  <a
                    href={`mailto:${PROFILE_DATA.contact.email}`}
                    className={styles.contactLink}
                  >
                    {PROFILE_DATA.contact.email}
                  </a>
                </div>
              </div>
            )}

            {PROFILE_DATA.contact.location && (
              <div className={styles.contactItem}>
                <span className={styles.contactIcon}>
                  <MapPin size={16} aria-hidden="true" />
                </span>
                <div>
                  <div>Location</div>
                  <span>{PROFILE_DATA.contact.location}</span>
                </div>
              </div>
            )}
          </div>

          <div className={styles.infoCard}>
            <h2 className={styles.cardTitle}>
              <GithubIcon size={18} className={styles.contactIcon} />
              <span>Online Profiles & Profiles</span>
            </h2>

            {PROFILE_DATA.contact.githubUrl ? (
              <div className={styles.contactItem}>
                <a
                  href={PROFILE_DATA.contact.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.contactLink}
                >
                  GitHub Profile
                  <ExternalLink size={12} aria-hidden="true" />
                </a>
              </div>
            ) : (
              <p className={styles.socialNotice}>
                Social and repository profiles can be configured in{" "}
                <code>src/data/profile.ts</code>.
              </p>
            )}
          </div>
        </aside>

        {/* Message Draft Form Column */}
        <section className={styles.formCard} aria-labelledby="form-heading" style={{ padding: '28px'}}>
          <div className={styles.formHeader}>
            <h2 id="form-heading" className={styles.formTitle}>
              Prepare a Message
            </h2>
            <div className={styles.formDisclaimer}>
              <strong>Note:</strong> Direct in-browser sending is not connected
              to a backend email server in this phase. Submitting will open your
              default email application with this message pre-filled, or you can
              copy the draft directly.
            </div>
          </div>

          <form
            onSubmit={handleMailtoSubmit}
            className={styles.form}
            noValidate
          >
            <div className={styles.formGroup}>
              <label htmlFor="contact-name" className={styles.label}>
                Your Name *
              </label>
              <input
                id="contact-name"
                type="text"
                className={`${styles.input} ${errors.name ? styles.inputError : ""}`}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
                }}
                placeholder="e.g. Alex Chen"
                aria-required="true"
                aria-invalid={!!errors.name}
              />
              {errors.name && (
                <span className={styles.errorText}>{errors.name}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="contact-email" className={styles.label}>
                Your Email *
              </label>
              <input
                id="contact-email"
                type="email"
                className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email)
                    setErrors((prev) => ({ ...prev, email: "" }));
                }}
                placeholder="name@example.com"
                aria-required="true"
                aria-invalid={!!errors.email}
              />
              {errors.email && (
                <span className={styles.errorText}>{errors.email}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="contact-subject" className={styles.label}>
                Subject *
              </label>
              <input
                id="contact-subject"
                type="text"
                className={`${styles.input} ${errors.subject ? styles.inputError : ""}`}
                value={subject}
                onChange={(e) => {
                  setSubject(e.target.value);
                  if (errors.subject)
                    setErrors((prev) => ({ ...prev, subject: "" }));
                }}
                placeholder="Software Engineering Inquiry"
                aria-required="true"
                aria-invalid={!!errors.subject}
              />
              {errors.subject && (
                <span className={styles.errorText}>{errors.subject}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="contact-message" className={styles.label}>
                Message *
              </label>
              <textarea
                id="contact-message"
                className={`${styles.textarea} ${errors.message ? styles.inputError : ""}`}
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  if (errors.message)
                    setErrors((prev) => ({ ...prev, message: "" }));
                }}
                placeholder="Write your message or inquiry details..."
                aria-required="true"
                aria-invalid={!!errors.message}
              />
              {errors.message && (
                <span className={styles.errorText}>{errors.message}</span>
              )}
            </div>

            {copyStatus && (
              <div
                className={`${styles.feedbackBanner} ${styles.feedbackSuccess}`}
              >
                <CheckCircle2 size={16} aria-hidden="true" />
                <span>{copyStatus}</span>
              </div>
            )}

            <div className={styles.formActions}>
              <button
                type="submit"
                className={styles.submitBtn}
                aria-label="Open in email client"
              >
                <Send size={15} aria-hidden="true" />
                <span>Open in Email Client</span>
              </button>

              <button
                type="button"
                className={styles.copyBtn}
                onClick={handleCopyDraft}
                aria-label="Copy draft message to clipboard"
              >
                <Copy size={15} aria-hidden="true" />
                <span>Copy Draft</span>
              </button>
            </div>
          </form>
        </section>
      </div>
    </motion.article>
  );
};
