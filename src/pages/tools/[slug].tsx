import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import styles from '../../styles/Details.module.css';
import { useEffect, useState } from 'react';

interface Tool {
  name: string;
  description: string;
  logo?: string;
  website?: string;
  slug?: string;
  longDescription?: string[];
  pros?: string[];
  cons?: string[];
}

export default function ToolDetail() {
  const router = useRouter();
  const { slug } = router.query;
  const [tool, setTool] = useState<Tool | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetch(`/api/sections`)
        .then(res => res.json())
        .then(data => {
          const foundTool = data.sections
            .flatMap((section: any) => 
              section.categories
                .flatMap((category: any) => category.items)
            )
            .find((item: Tool) => item.slug === slug);
          
          setTool(foundTool || null);
          setLoading(false);
        })
        .catch(error => {
          console.error('Error fetching tool:', error);
          setLoading(false);
        });
    }
  }, [slug]);

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (!tool) {
    return <div className={styles.error}>Tool not found</div>;
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>{tool.name} - AI & Crypto Directory</title>
        <meta name="description" content={tool.description} />
      </Head>

      <main className={styles.main}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.titleGroup}>
              <div className={styles.logoContainer}>
                {tool.logo ? (
                  <Image 
                    src={tool.logo}
                    alt={tool.name}
                    width={48}
                    height={48}
                    className={styles.logo}
                  />
                ) : (
                  <div className={styles.logoFallback}>
                    {tool.name[0]}
                  </div>
                )}
              </div>
              
              <div>
                <h1 className={styles.title}>{tool.name}</h1>
                <p className={styles.description}>{tool.description}</p>
              </div>
            </div>
            
            {tool.website && (
              <Link 
                href={tool.website}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.websiteButton}
              >
                Visit Website →
              </Link>
            )}
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.aboutSection}>
            <h2>About</h2>
            <div className={styles.description}>
              {tool.longDescription?.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>

          <div className={styles.mainContent}>
            <div className={styles.description}>
              {/* Additional content can go here */}
            </div>
          </div>

          <div className={styles.sideSection}>
            <div className={styles.prosSection}>
              <h2>Pros</h2>
              {tool.pros && tool.pros.length > 0 ? (
                <ul className={styles.prosList}>
                  {tool.pros.map((pro, index) => (
                    <li key={index}>
                      <span className={styles.checkIcon}>✓</span>
                      {pro}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={styles.emptyState}>No pros listed</p>
              )}
            </div>

            <div className={styles.consSection}>
              <h2>Cons</h2>
              {tool.cons && tool.cons.length > 0 ? (
                <ul className={styles.consList}>
                  {tool.cons.map((con, index) => (
                    <li key={index}>
                      <span className={styles.xIcon}>×</span>
                      {con}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={styles.emptyState}>No cons listed</p>
              )}
            </div>
          </div>
        </div>

        <div className={styles.backLink}>
          <Link href="/">← Back to Directory</Link>
        </div>
      </main>
    </div>
  );
} 