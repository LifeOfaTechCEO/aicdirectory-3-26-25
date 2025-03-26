import { useRouter } from 'next/router';
import { useEffect, useState, useCallback } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import styles from '../../styles/Details.module.css';

interface Item {
  id: string;
  title: string;
  description: string;
  logo?: string;
  website?: string;
  longDescription?: string[];
  pros?: string[];
  cons?: string[];
  useCases?: string[];
  pricing?: string;
  easeOfUse?: string;
  aicdContributor?: string;
  aicdContributorLink?: string;
  type?: string;
}

interface Category {
  id: string;
  title: string;
  count: number;
  icon: string;
  items: Item[];
}

interface Section {
  id: string;
  title: string;
  categories: Category[];
}

export default function ItemDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());

  // Create a memoized fetchData function that can be called multiple times
  const fetchData = useCallback(async () => {
    if (!id) return;
    
    try {
      console.log('Fetching data for item ID:', id, 'at', new Date().toISOString());
      
      // Add cache-busting parameter with more randomness
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 1000000);
      const response = await fetch(`/api/sections?t=${timestamp}&r=${random}`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        // Force revalidation
        cache: 'no-store'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      setLastUpdate(timestamp);
      console.log('Received sections data at:', new Date().toISOString());
      console.log('Server timestamp:', data.timestamp);
      
      if (!data.sections || !Array.isArray(data.sections)) {
        throw new Error('Invalid data format');
      }
      
      // Find the item in the data
      let foundItem: Item | null = null;
      for (const section of data.sections) {
        for (const category of section.categories) {
          const match = category.items.find(item => item.id === id);
          if (match) {
            foundItem = match;
            break;
          }
        }
        if (foundItem) break;
      }
      
      if (foundItem) {
        console.log('Found item data:', JSON.stringify(foundItem, null, 2));
        console.log('Item contributor link:', foundItem.aicdContributorLink);
        console.log('Item contributor:', foundItem.aicdContributor);
        
        // Compare with current item to see if there are changes
        if (JSON.stringify(foundItem) !== JSON.stringify(item)) {
          console.log('Item data changed, updating state');
          setItem(foundItem);
        } else {
          console.log('Item data unchanged');
        }
      } else {
        console.error('Item not found in sections data');
        setError('Item not found');
      }
    } catch (err) {
      console.error('Error fetching item:', err);
      setError(err instanceof Error ? err.message : 'Failed to load item');
    } finally {
      setLoading(false);
    }
  }, [id, item]);

  // Initial data load
  useEffect(() => {
    if (id) {
      setLoading(true);
      fetchData();
    }
  }, [id, fetchData]);

  // Add event listener for cache invalidation messages
  useEffect(() => {
    // Function to handle cache invalidation message
    const handleCacheInvalidation = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'cache-invalidated') {
          console.log('Cache invalidation received, refreshing data');
          fetchData();
        }
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    };

    // Set up event source for server-sent events if supported
    let eventSource: EventSource | null = null;
    
    if (typeof window !== 'undefined' && window.EventSource) {
      eventSource = new EventSource('/api/events');
      eventSource.onmessage = handleCacheInvalidation;
      eventSource.onerror = (error) => {
        console.error('EventSource error:', error);
        if (eventSource) {
          eventSource.close();
        }
      };
    }

    // Cleanup function
    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [fetchData]);

  // Debug output of item data
  useEffect(() => {
    if (item) {
      console.log('Rendering item with data:', item);
      console.log('Contributor link:', item.aicdContributorLink);
    }
  }, [item]);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner} />
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className={styles.errorContainer}>
        <h1>{error || 'Item not found'}</h1>
        <Link href="/" className={styles.backLink}>Return to Directory</Link>
      </div>
    );
  }

  return (
    <div className={styles.container} key={`item-${id}-${item ? JSON.stringify(item) : 'loading'}`}>
      <Head>
        <title>{item ? item.title : 'Loading...'} | AICD</title>
        <meta name="description" content={item?.description || 'Item details'} />
      </Head>

      <main className={styles.main}>
        <Link href="/" className={styles.backLink}>← Back to Directory</Link>

        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.logoContainer}>
              {item.logo ? (
                <Image src={item.logo} alt={item.title} width={80} height={80} className={styles.logo} />
              ) : (
                <div className={styles.placeholderLogo}>{item.title[0]}</div>
              )}
            </div>
            <div className={styles.titleContainer}>
              <h1 className={styles.title}>{item.title}</h1>
              <p className={styles.description}>{item.description}</p>
            </div>
          </div>
          
          <div className={styles.headerActions}>
            {item.website && (
              <Link 
                href={item.website.startsWith('http') ? item.website : `https://${item.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.websiteButton}
              >
                Visit Website ↗
              </Link>
            )}
            {item.aicdContributor && (
              <div className={styles.contributorInfo}>
                <span className={styles.contributorBadge}>AICD CONTRIBUTOR</span>
                {item.aicdContributorLink ? (
                  <a 
                    href={item.aicdContributorLink.startsWith('http') ? item.aicdContributorLink : `https://${item.aicdContributorLink}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={styles.contributorLink}
                    onClick={() => console.log('Contributor link clicked:', item.aicdContributorLink)}
                  >
                    {item.aicdContributor}
                  </a>
                ) : (
                  <span className={styles.contributorName}>{item.aicdContributor}</span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.leftColumn}>
            {item.longDescription && item.longDescription.length > 0 && (
              <section className={styles.section}>
                <h2>About</h2>
                {item.longDescription.map((paragraph, index) => (
                  <p key={index} className={styles.paragraph}>{paragraph}</p>
                ))}
              </section>
            )}
          </div>

          <div className={styles.middleColumn}>
            {item.useCases && item.useCases.length > 0 && (
              <section className={styles.section}>
                <h2>Use Cases</h2>
                <div className={styles.useCases}>
                  {item.useCases.map((useCase, index) => (
                    <div key={index} className={styles.useCase}>
                      <span className={styles.useCaseIcon}>🎯</span>
                      <span>{useCase}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <div className={styles.pricingSection}>
              <h2>Pricing</h2>
              <div className={styles.pricing}>
                <span className={styles.pricingLabel}>Plan</span>
                <span className={styles.pricingValue}>{item.pricing}</span>
              </div>
            </div>

            <div className={styles.easeOfUseSection}>
              <h2>Ease of Use</h2>
              <div className={styles.easeOfUse}>
                <span className={styles.easeOfUseLabel}>Difficulty Level</span>
                <span className={styles.easeOfUseValue}>{item.easeOfUse}</span>
              </div>
            </div>
          </div>

          <div className={styles.rightColumn}>
            {item.pros && item.pros.length > 0 && (
              <section className={styles.section}>
                <h2>Pros</h2>
                <ul className={styles.prosList}>
                  {item.pros.map((pro, index) => (
                    <li key={index}>
                      <span className={styles.checkIcon}>✓</span>
                      {pro}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {item.cons && item.cons.length > 0 && (
              <section className={styles.section}>
                <h2>Cons</h2>
                <ul className={styles.consList}>
                  {item.cons.map((con, index) => (
                    <li key={index}>
                      <span className={styles.xIcon}>×</span>
                      {con}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 