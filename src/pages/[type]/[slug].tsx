import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import styles from '../../styles/Details.module.css';

interface Item {
  name: string;
  description: string;
  logo: string;
  website: string;
  longDescription: string[];
  pros: string[];
  cons: string[];
  pricing: 'Free' | 'Paid' | 'Freemium' | 'Subscription';
  useCases: string[];
  easeOfUse: 'Beginner-Friendly' | 'Intermediate' | 'Advanced';
  likes?: string[];
  dislikes?: string[];
}

export default function Details() {
  const router = useRouter();
  const { type, slug } = router.query;
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (type && slug) {
      // Fetch item data here
      // For now using mock data
      setItem({
        name: 'Example Tool',
        description: 'A powerful development tool',
        logo: '/path/to/logo.png',
        website: 'https://example.com',
        longDescription: ['Detailed description of the tool...'],
        pros: ['Easy to use', 'Great documentation'],
        cons: ['Limited free tier'],
        pricing: 'Freemium',
        useCases: ['Developers', 'Startups', 'Enterprise'],
        easeOfUse: 'Intermediate'
      });
      setLoading(false);
    }
  }, [type, slug]);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner} />
      </div>
    );
  }
  
  if (!item) {
    return (
      <div className={styles.errorContainer}>
        <h1>Item not found</h1>
        <Link href="/" className={styles.backLink}>Return to Directory</Link>
      </div>
    );
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner-Friendly': return '#50C878';
      case 'Intermediate': return '#FF9F43';
      case 'Advanced': return '#FF6B6B';
      default: return '#4A90E2';
    }
  };

  const getPricingColor = (pricing: string) => {
    switch (pricing) {
      case 'Free': return '#50C878';
      case 'Paid': return '#FF6B6B';
      case 'Freemium': return '#FF9F43';
      case 'Subscription': return '#9C27B0';
      default: return '#4A90E2';
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>{item.name} - AI & Crypto Directory</title>
        <meta name="description" content={item.description} />
      </Head>

      <div className={styles.hero}>
        <div className={styles.heroContent}>
          <Link href="/" className={styles.backButton}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M15.8333 10H4.16666M4.16666 10L9.16666 15M4.16666 10L9.16666 5" 
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back to Directory
          </Link>
          
          <div className={styles.heroMain}>
            <div className={styles.logoWrapper}>
              {item.logo ? (
                <Image src={item.logo} alt={item.name} width={100} height={100} className={styles.logo} />
              ) : (
                <div className={styles.placeholderLogo}>
                  <span>{item.name[0]}</span>
                </div>
              )}
            </div>

            <div className={styles.titleContent}>
              <h1>{item.name}</h1>
              <p>{item.description}</p>
              
              <div className={styles.badges}>
                <span className={styles.badge} style={{ backgroundColor: `${getPricingColor(item.pricing)}15`, color: getPricingColor(item.pricing) }}>
                  {item.pricing}
                </span>
                <span className={styles.badge} style={{ backgroundColor: `${getDifficultyColor(item.easeOfUse)}15`, color: getDifficultyColor(item.easeOfUse) }}>
                  {item.easeOfUse}
                </span>
              </div>

              {item.website && (
                <a href={item.website} target="_blank" rel="noopener noreferrer" className={styles.websiteButton}>
                  Visit Website
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M12 8.66667V12.6667C12 13.0203 11.8595 13.3594 11.6095 13.6095C11.3594 13.8595 11.0203 14 10.6667 14H3.33333C2.97971 14 2.64057 13.8595 2.39052 13.6095C2.14048 13.3594 2 13.0203 2 12.6667V5.33333C2 4.97971 2.14048 4.64057 2.39052 4.39052C2.64057 4.14048 2.97971 4 3.33333 4H7.33333" 
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M10 2H14V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M6.66666 9.33333L14 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <main className={styles.main}>
        <div className={styles.content}>
          <div className={styles.mainContent}>
            {item.longDescription && item.longDescription.length > 0 && (
              <section className={styles.section}>
                <h2>About</h2>
                <div className={styles.aboutContent}>
                  {item.longDescription.map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </section>
            )}

            {item.useCases && item.useCases.length > 0 && (
              <section className={styles.section}>
                <h2>Perfect For</h2>
                <div className={styles.useCaseGrid}>
                  {item.useCases.map((useCase, index) => (
                    <div key={index} className={styles.useCaseCard}>
                      <div className={styles.useCaseIcon}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                          <path d="M20 6L9 17L4 12" stroke="#50C878" strokeWidth="2" 
                            strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <span>{useCase}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {item.likes && item.likes.length > 0 && (
              <section className={styles.section}>
                <h2>What Users Love</h2>
                <div className={styles.feedbackGrid}>
                  {item.likes.map((like, index) => (
                    <div key={index} className={styles.feedbackCard}>
                      <div className={styles.feedbackIcon}>❤️</div>
                      <p>{like}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {item.dislikes && item.dislikes.length > 0 && (
              <section className={styles.section}>
                <h2>Room for Improvement</h2>
                <div className={styles.feedbackGrid}>
                  {item.dislikes.map((dislike, index) => (
                    <div key={index} className={styles.feedbackCard}>
                      <div className={styles.feedbackIcon}>💭</div>
                      <p>{dislike}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          <aside className={styles.sidebar}>
            <div className={styles.sidebarCard}>
              <div className={styles.prosConsSection}>
                <h3>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M10 17.5C14.1421 17.5 17.5 14.1421 17.5 10C17.5 5.85786 14.1421 2.5 10 2.5C5.85786 2.5 2.5 5.85786 2.5 10C2.5 14.1421 5.85786 17.5 10 17.5Z" 
                      stroke="#50C878" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M7.5 10L9.16667 11.6667L12.5 8.33334" stroke="#50C878" 
                      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Pros
                </h3>
                <ul className={styles.prosList}>
                  {item.pros.map((pro, index) => (
                    <li key={index}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M13.3333 4L6 11.3333L2.66667 8" stroke="#50C878" 
                          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {pro}
                    </li>
                  ))}
                </ul>
              </div>

              <div className={styles.prosConsSection}>
                <h3>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M10 17.5C14.1421 17.5 17.5 14.1421 17.5 10C17.5 5.85786 14.1421 2.5 10 2.5C5.85786 2.5 2.5 5.85786 2.5 10C2.5 14.1421 5.85786 17.5 10 17.5Z" 
                      stroke="#FF6B6B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12.5 7.5L7.5 12.5M7.5 7.5L12.5 12.5" stroke="#FF6B6B" 
                      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Cons
                </h3>
                <ul className={styles.consList}>
                  {item.cons.map((con, index) => (
                    <li key={index}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M12 4L4 12M4 4L12 12" stroke="#FF6B6B" 
                          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {con}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
} 