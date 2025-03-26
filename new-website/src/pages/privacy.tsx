import Head from 'next/head';
import styles from '../styles/Legal.module.css';
import Link from 'next/link';

export default function Privacy() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Privacy Policy - AI & Crypto Directory</title>
        <meta name="description" content="Privacy policy for the AI & Crypto Directory" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Privacy Policy</h1>
        
        <div className={styles.content}>
          <section>
            <h2>Information We Collect</h2>
            <p>We collect minimal information to provide and improve our directory service. This includes:</p>
            <ul>
              <li>Usage data (pages visited, time spent)</li>
              <li>Device information (browser type, operating system)</li>
              <li>IP addresses for security and analytics</li>
            </ul>
          </section>

          <section>
            <h2>How We Use Information</h2>
            <p>We use collected information to:</p>
            <ul>
              <li>Improve our directory and user experience</li>
              <li>Analyze usage patterns</li>
              <li>Prevent abuse and maintain security</li>
            </ul>
          </section>

          <section>
            <h2>Data Storage</h2>
            <p>All data is stored securely and we do not share personal information with third parties.</p>
          </section>

          <section>
            <h2>Cookies</h2>
            <p>We use essential cookies to maintain basic functionality. You can disable cookies in your browser settings.</p>
          </section>

          <section>
            <h2>Contact</h2>
            <p>For privacy concerns, please contact us at privacy@example.com</p>
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