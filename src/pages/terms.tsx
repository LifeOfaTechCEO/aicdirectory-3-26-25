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
        <p className={styles.date}>Effective Date: March 5, 2025</p>
        
        <div className={styles.content}>
          <p className={styles.intro}>
            These Terms of Use govern your access and use of AI & Crypto Directory ("Website"). By accessing our Website, you agree to be bound by these Terms.
          </p>

          <section>
            <h2>1. Use of Website</h2>
            <ul>
              <li>The Website provides information, resources, and tools related to AI and cryptocurrency.</li>
              <li>You agree to use the Website for lawful purposes and not to engage in any activity that disrupts or harms the Website.</li>
            </ul>
          </section>

          <section>
            <h2>2. Intellectual Property</h2>
            <ul>
              <li>All content, trademarks, and intellectual property on the Website belong to AI & Crypto Directory.</li>
              <li>You may not reproduce, distribute, or modify content without prior written permission.</li>
            </ul>
          </section>

          <section>
            <h2>3. Disclaimer</h2>
            <ul>
              <li>Information on this Website is provided "as is" for informational purposes only.</li>
              <li>We do not guarantee the accuracy, reliability, or completeness of any information.</li>
              <li>We are not responsible for any financial or legal decisions made based on our content.</li>
            </ul>
          </section>

          <section>
            <h2>4. Limitation of Liability</h2>
            <p>We are not liable for any direct, indirect, incidental, or consequential damages arising from your use of the Website.</p>
          </section>

          <section>
            <h2>5. Third-Party Services and Links</h2>
            <p>The Website may contain links to third-party resources. We are not responsible for their content or services.</p>
          </section>

          <section>
            <h2>6. User Conduct</h2>
            <ul>
              <li>Users must not engage in unlawful, fraudulent, or abusive activities on the Website.</li>
              <li>We reserve the right to terminate access for users who violate these Terms.</li>
            </ul>
          </section>

          <section>
            <h2>7. Modifications to Terms</h2>
            <p>We may update these Terms at any time. Continued use of the Website after modifications constitutes acceptance of the updated Terms.</p>
          </section>

          <section>
            <h2>8. Contact Information</h2>
            <p>For inquiries, please contact us at <a href="mailto:techceocollabs@gmail.com">techceocollabs@gmail.com</a>.</p>
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