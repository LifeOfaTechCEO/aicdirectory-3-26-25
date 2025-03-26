import Head from 'next/head';
import styles from '../styles/Legal.module.css';
import Link from 'next/link';

export default function Terms() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Terms of Use - AI & Crypto Directory</title>
        <meta name="description" content="Terms of use for the AI & Crypto Directory" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Terms of Use</h1>
        
        <div className={styles.content}>
          <section>
            <h2>Acceptance of Terms</h2>
            <p>By accessing and using this directory, you accept and agree to be bound by these Terms of Use and our Privacy Policy.</p>
          </section>

          <section>
            <h2>Not Financial Advice</h2>
            <p>The information provided in this directory is for general informational purposes only. It should not be considered as financial, investment, legal, or any other form of advice.</p>
          </section>

          <section>
            <h2>Accuracy of Information</h2>
            <p>While we strive to keep information accurate and up-to-date, we make no representations or warranties about the completeness, reliability, or accuracy of the directory content.</p>
          </section>

          <section>
            <h2>Third-Party Links</h2>
            <p>Our directory may contain links to third-party websites. We are not responsible for the content or practices of these sites.</p>
          </section>

          <section>
            <h2>Intellectual Property</h2>
            <p>All content on this directory is protected by copyright and other intellectual property laws. You may not reproduce or distribute the content without permission.</p>
          </section>

          <section>
            <h2>Limitation of Liability</h2>
            <p>We shall not be liable for any direct, indirect, incidental, consequential, or punitive damages arising from your use of the directory.</p>
          </section>

          <section>
            <h2>Changes to Terms</h2>
            <p>We reserve the right to modify these terms at any time. Continued use of the directory constitutes acceptance of updated terms.</p>
          </section>

          <section>
            <h2>Contact</h2>
            <p>For questions about these terms, please contact us at legal@example.com</p>
          </section>
        </div>

        <div className={styles.footer}>
          <Link href="/" className={styles.backLink}>
            ← Back to Directory
          </Link>
        </div>
      </main>
    </div>
  );
} 