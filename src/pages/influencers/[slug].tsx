import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import styles from '../../styles/Details.module.css';
import { useEffect, useState } from 'react';

interface Influencer {
  name: string;
  description: string;
  logo?: string;
  website?: string;
  slug?: string;
  longDescription?: string[];
  likes?: string[];
  dislikes?: string[];
}

export default function InfluencerDetail() {
  const router = useRouter();
  const { slug } = router.query;
  const [influencer, setInfluencer] = useState<Influencer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetch(`/api/sections`)
        .then(res => res.json())
        .then(data => {
          const foundInfluencer = data.sections
            .flatMap((section: any) => 
              section.categories
                .flatMap((category: any) => category.items)
            )
            .find((item: Influencer) => item.slug === slug);
          
          setInfluencer(foundInfluencer || null);
          setLoading(false);
        })
        .catch(error => {
          console.error('Error fetching influencer:', error);
          setLoading(false);
        });
    }
  }, [slug]);

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (!influencer) {
    return <div className={styles.error}>Influencer not found</div>;
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>{influencer.name} - AI & Crypto Directory</title>
        <meta name="description" content={influencer.description} />
      </Head>

      <main className={styles.main}>
        <div className={styles.header}>
          <div className={styles.titleGroup}>
            <div className={styles.logoContainer}>
              {influencer.logo ? (
                <Image 
                  src={influencer.logo}
                  alt={influencer.name}
                  width={48}
                  height={48}
                  className={styles.logo}
                />
              ) : (
                <div className={styles.logoFallback}>
                  {influencer.name[0]}
                </div>
              )}
            </div>
            
            <div className={styles.headerContent}>
              <h1 className={styles.title}>{influencer.name}</h1>
              <p className={styles.description}>{influencer.description}</p>
            </div>
          </div>
          
          {influencer.website && (
            <Link 
              href={influencer.website}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.websiteButton}
            >
              View Website →
            </Link>
          )}
        </div>

        <div className={styles.content}>
          {influencer.longDescription && influencer.longDescription.length > 0 && (
            <div className={styles.aboutSection}>
              <h2>About</h2>
              <div className={styles.description}>
                {influencer.longDescription.slice(0, 2).map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>
          )}

          <div className={styles.prosSection}>
            <h2>Likes</h2>
            {influencer.likes && influencer.likes.length > 0 ? (
              <ul className={styles.prosList}>
                {influencer.likes.map((like, index) => (
                  <li key={index}>
                    <span className={styles.checkIcon}>✓</span>
                    {like}
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.emptyState}>No likes listed</p>
            )}
          </div>

          <div className={styles.consSection}>
            <h2>Dislikes</h2>
            {influencer.dislikes && influencer.dislikes.length > 0 ? (
              <ul className={styles.consList}>
                {influencer.dislikes.map((dislike, index) => (
                  <li key={index}>
                    <span className={styles.xIcon}>×</span>
                    {dislike}
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.emptyState}>No dislikes listed</p>
            )}
          </div>
        </div>

        <div className={styles.backLink}>
          <Link href="/">← Back to Directory</Link>
        </div>
      </main>
    </div>
  );
} 