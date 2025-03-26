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
        <p className={styles.date}>Effective Date: March 5, 2025</p>
        
        <div className={styles.content}>
          <p className={styles.intro}>
            Welcome to AI & Crypto Directory ("we," "our," or "us"). We respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website.
          </p>

          <section>
            <h2>1. Information We Collect</h2>
            <p>We may collect and process the following information:</p>
            <ul>
              <li><strong>Personal Information:</strong> Name, email address, and other contact details if you submit them through forms or inquiries.</li>
              <li><strong>Non-Personal Information:</strong> Browser type, IP address, device type, usage statistics, and cookies to enhance website functionality.</li>
            </ul>
          </section>

          <section>
            <h2>2. How We Use Your Information</h2>
            <p>We use the collected data to:</p>
            <ul>
              <li>Provide, maintain, and improve our services</li>
              <li>Respond to inquiries and communicate with users</li>
              <li>Analyze website traffic and user engagement</li>
              <li>Comply with legal obligations and enforce our terms</li>
            </ul>
          </section>

          <section>
            <h2>3. Cookies and Tracking Technologies</h2>
            <p>We use cookies and similar tracking technologies to enhance user experience and analyze website traffic. You can manage or disable cookies through your browser settings.</p>
          </section>

          <section>
            <h2>4. Information Sharing and Disclosure</h2>
            <p>We do not sell or rent your personal data. We may share information with:</p>
            <ul>
              <li>Third-party service providers assisting in website operation</li>
              <li>Legal authorities if required by law</li>
              <li>Business partners in case of a merger or acquisition</li>
            </ul>
          </section>

          <section>
            <h2>5. Data Security</h2>
            <p>We implement security measures to protect user data. However, no internet transmission is 100% secure, and we cannot guarantee absolute security.</p>
          </section>

          <section>
            <h2>6. Third-Party Links</h2>
            <p>Our website may contain links to third-party websites. We are not responsible for their privacy practices or content.</p>
          </section>

          <section>
            <h2>7. Your Rights</h2>
            <p>You may request access, correction, or deletion of your personal data by contacting us at <a href="mailto:techceocollabs@gmail.com">techceocollabs@gmail.com</a>.</p>
          </section>

          <section>
            <h2>8. Changes to This Privacy Policy</h2>
            <p>We may update this policy periodically. Continued use of the site after updates constitutes acceptance of the revised policy.</p>
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