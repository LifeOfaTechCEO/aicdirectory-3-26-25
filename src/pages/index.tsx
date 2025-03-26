import Head from 'next/head';
import styles from '../styles/Home.module.css';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Section, Item, Category } from '../types';

const MAX_VISIBLE_SECTIONS = 8;

export default function Home() {
  const [sectionsData, setSectionsData] = useState<Section[]>([]);
  const [activeSection, setActiveSection] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<{ [key: string]: boolean }>({});
  const [showMoreDropdown, setShowMoreDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<'success' | 'error' | 'offline'>('success');
  const [debugOutput, setDebugOutput] = useState<any>({});

  useEffect(() => {
    const fetchData = async () => {
      const requestId = Math.random().toString(36).substring(2, 10);
      console.log(`[Frontend-${requestId}] App started`, {
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        language: navigator.language,
        screenSize: `${window.innerWidth}x${window.innerHeight}`,
        online: navigator.onLine
      });

      try {
        setIsLoading(true);
        console.log(`[Frontend-${requestId}] Fetching sections from API at ${new Date().toISOString()}`);

        // Apply a fetch timeout to avoid hanging
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const fetchPromise = fetch('/api/sections', {
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
            'X-Client-ID': requestId
          },
          signal: controller.signal
        });

        // Response handling with timeout
        let response;
        try {
          response = await fetchPromise;
          clearTimeout(timeoutId);
        } catch (fetchError) {
          if (fetchError.name === 'AbortError') {
            console.error(`[Frontend-${requestId}] Fetch timed out after 10 seconds`);
            throw new Error('Request timed out. Please try again.');
          }
          throw fetchError;
        }

        // Log detailed response info
        console.log(`[Frontend-${requestId}] API response received:`, {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok,
          contentType: response.headers.get('Content-Type'),
          requestId: response.headers.get('X-API-Request-ID')
        });

        // Handle HTTP error responses
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`[Frontend-${requestId}] API error response:`, {
            status: response.status,
            text: errorText
          });

          // If response is JSON despite error, try to parse for fallback data
          try {
            const errorJson = JSON.parse(errorText);
            if (errorJson.sections && Array.isArray(errorJson.sections)) {
              console.log(`[Frontend-${requestId}] Found fallback sections in error response, using those`);
              setSectionsData(errorJson.sections);
              setError(`Error: ${errorJson.message || errorJson.error || 'API returned an error'} (showing fallback data)`);
              setApiStatus(errorJson.isOffline ? 'offline' : 'error');
              setIsLoading(false);
              return;
            }
          } catch (jsonError) {
            // Ignore JSON parse error, continue with normal error handling
            console.log(`[Frontend-${requestId}] Error response is not valid JSON`);
          }

          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }

        // Parse response as JSON
        let data;
        try {
          data = await response.json();
          setDebugOutput({
            time: new Date().toISOString(),
            responseType: typeof data,
            isArray: Array.isArray(data),
            hasData: !!data,
            hasSections: !!data?.sections,
            sectionsType: typeof data?.sections,
            sectionsIsArray: Array.isArray(data?.sections),
            sectionsLength: data?.sections?.length,
            responseKeys: data ? Object.keys(data) : [],
            firstItem: data?.sections?.[0] ? { 
              id: data.sections[0].id,
              title: data.sections[0].title,
              categoriesCount: data.sections[0].categories?.length
            } : null
          });
        } catch (jsonError) {
          console.error(`[Frontend-${requestId}] JSON parse error:`, jsonError);
          throw new Error('Failed to parse API response');
        }

        console.log(`[Frontend-${requestId}] Data received from API:`, {
          dataType: typeof data,
          isOffline: data.isOffline,
          apiSuccess: data.success,
          length: data?.sections?.length || 0,
          timestamp: data.timestamp,
          requestId: data.requestId
        });

        // Handle offline mode data
        if (data.isOffline) {
          console.warn(`[Frontend-${requestId}] API is in offline mode. Showing fallback data.`);
          setApiStatus('offline');
          setError('Database connection unavailable. Showing limited data.');
        }

        // Get sections from response with multiple format support
        let sectionsArray: Section[] = [];
        if (data.sections && Array.isArray(data.sections)) {
          sectionsArray = data.sections;
          console.log(`[Frontend-${requestId}] Using sections array from data.sections`);
        } else if (data.data && Array.isArray(data.data)) {
          sectionsArray = data.data;
          console.log(`[Frontend-${requestId}] Using sections array from data.data`);
        } else if (Array.isArray(data)) {
          sectionsArray = data;
          console.log(`[Frontend-${requestId}] Using direct array response`);
        } else {
          console.error(`[Frontend-${requestId}] Unknown data format:`, {
            dataType: typeof data,
            isArray: Array.isArray(data),
            keys: data ? Object.keys(data) : []
          });
          
          // Even with unknown format, don't throw - try to continue
          sectionsArray = [];
          setError('Received data in an unknown format');
        }

        if (sectionsArray.length === 0) {
          console.warn(`[Frontend-${requestId}] Received empty sections array`);
          setError('No directory data available.');
        } else {
          setError(null);
        }

        console.log(`[Frontend-${requestId}] Setting state with ${sectionsArray.length} sections`);
        setSectionsData(sectionsArray);
        setApiStatus('success');

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        console.error(`[Frontend-${requestId}] Error fetching data:`, {
          error: errorMessage,
          stack: err instanceof Error ? err.stack : undefined,
          type: err instanceof Error ? err.name : typeof err
        });
        
        setError(`Error loading directory data: ${errorMessage}`);
        setApiStatus('error');
        
        // Important: Keep any existing data even if there's an error
        // This prevents the UI from breaking if we had data before
        if (sectionsData.length === 0) {
          setSectionsData([]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const visibleSections = sectionsData.slice(0, 7);
  const moreSections = sectionsData.slice(7);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80; // Reduced offset for sleeker look
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const renderItem = (item: Item) => (
    <div key={item.id} className={styles.itemCard}>
      <div className={styles.itemContent}>
        <div className={styles.titleRow}>
          <div className={styles.itemLogo}>
            {item.logo ? (
              <Image src={item.logo} alt={item.title} width={24} height={24} />
            ) : (
              <div className={styles.placeholderLogo}>{item.title[0]}</div>
            )}
          </div>
          <h3 className={styles.itemName}>
            {item.title}
            {item.aicdContributor && (
              <span className={styles.contributorBadge} title={`Contributed by ${item.aicdContributor}`}>
                AICD
              </span>
            )}
          </h3>
        </div>
        <p className={styles.itemDescription}>{item.description}</p>
        <div className={styles.buttonGroup}>
          {item.website && (
            <Link 
              href={item.website.startsWith('http') ? item.website : `https://${item.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.websiteButton}
            >
              Website ↗
            </Link>
          )}
          <Link 
            href={`/items/${item.id}`}
            className={styles.viewMoreButton}
          >
            View Details →
          </Link>
        </div>
      </div>
    </div>
  );

  const renderCategory = (category: Category) => (
    <div key={category.id} className={styles.categoryWrapper}>
      <div className={styles.categoryHeader}>
        <div className={styles.categoryTitle}>
          <span className={styles.categoryIcon}>{category.icon}</span>
          {category.title}
          <span className={styles.categoryCount}>{category.items.length}</span>
        </div>
      </div>
      <div className={styles.itemsGrid}>
        {category.items
          .slice(0, expandedCategories[category.id] ? undefined : 4)
          .map(item => renderItem(item))}
        {/* Add empty placeholder items if there are fewer than 4 items to maintain grid layout */}
        {!expandedCategories[category.id] && 
          category.items.length < 4 && 
          Array.from({ length: 4 - Math.min(category.items.length, 4) }).map((_, index) => (
            <div key={`placeholder-${index}`} className={styles.itemCardPlaceholder}></div>
          ))
        }
      </div>
      {category.items.length > 4 && (
        <button 
          className={styles.expandButton}
          onClick={() => toggleCategory(category.id)}
        >
          {expandedCategories[category.id] ? 'Show Less' : 'View More'}
        </button>
      )}
    </div>
  );

  const renderNavigation = () => (
    <nav className={styles.navigation}>
      <div className={styles.navContent}>
        <div className={styles.navLinks}>
          {visibleSections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className={styles.navLink}
              onClick={(e) => {
                e.preventDefault();
                scrollToSection(section.id);
              }}
            >
              {section.title}
            </a>
          ))}
          {moreSections.length > 0 && (
            <div className={styles.moreDropdown}>
              <button 
                className={styles.moreButton}
                onClick={() => setShowMoreDropdown(!showMoreDropdown)}
              >
                More
                <span className={styles.moreIcon}>▼</span>
              </button>
              <div className={`${styles.dropdownContent} ${showMoreDropdown ? styles.show : ''}`}>
                {moreSections.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className={styles.dropdownLink}
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection(section.id);
                      setShowMoreDropdown(false);
                    }}
                  >
                    {section.title}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );

  const renderContent = () => {
    // If no sections data, show minimal empty content
    if (!sectionsData.length) {
      return (
        <div className={styles.emptyState}>
          <h2>No Directory Data Available</h2>
          <p>The directory data is currently unavailable. Please try again later.</p>
        </div>
      );
    }

    // Render actual content
    return (
      <div className={styles.directory}>
        {sectionsData.map((section) => (
          <div key={section.id} className={styles.section}>
            <h2>{section.title}</h2>
            <div className={styles.categories}>
              {section.categories.map((category) => (
                <div key={category.id} className={styles.category}>
                  <h3>
                    <span className={styles.categoryIcon}>{category.icon}</span>
                    {category.title}
                  </h3>
                  <div className={styles.items}>
                    {category.items && category.items.length > 0 ? (
                      category.items.map((item) => (
                        <div key={item.id} className={styles.item}>
                          <h4>{item.title}</h4>
                          <p>{item.description}</p>
                        </div>
                      ))
                    ) : (
                      <p className={styles.emptyItems}>No items in this category</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <Head>
          <title>AI & Crypto Directory</title>
          <meta name="description" content="Directory of AI and Crypto tools and influencers" />
        </Head>
        <main className={styles.main}>
          <div className={styles.loading}>Loading directory data...</div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <Head>
          <title>AI & Crypto Directory</title>
          <meta name="description" content="Directory of AI and Crypto tools and influencers" />
        </Head>
        <main className={styles.main}>
          <div className={styles.error}>
            <h2>Directory Status</h2>
            <p>{error}</p>
            <button 
              className={styles.retryButton} 
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
            
            {/* If we have some data, still show it despite the error */}
            {sectionsData.length > 0 && (
              <>
                <p className={styles.continueMessage}>
                  Limited data is available for viewing:
                </p>
                {renderContent()}
              </>
            )}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>AI & Crypto Directory</title>
        <meta name="description" content="Directory of AI and Crypto tools and influencers" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {renderNavigation()}

      <main className={styles.main}>
        <div className={styles.heroSection}>
          <h1 className={styles.title}>
            The Ultimate AI and Crypto Directory
          </h1>
          <p className={styles.description}>
            Discover the best tools, resources, community and more
          </p>
        </div>

        {apiStatus === 'offline' && (
          <div className={styles.offlineNotice}>
            <p>⚠️ Running in offline mode. Limited data available.</p>
          </div>
        )}
        
        {isLoading ? (
          <div className={styles.loading}>
            <p>Loading directory data...</p>
          </div>
        ) : error ? (
          <div className={styles.error}>
            <h2>Directory Status</h2>
            <p>{error}</p>
            <button 
              className={styles.retryButton} 
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
            
            {/* If we have some data, still show it despite the error */}
            {sectionsData.length > 0 && (
              <>
                <p className={styles.continueMessage}>
                  Limited data is available for viewing:
                </p>
                {renderContent()}
              </>
            )}
          </div>
        ) : (
          renderContent()
        )}
        
        {/* Hidden debug output for troubleshooting */}
        <div id="debug-data" style={{ display: 'none' }} data-debug={JSON.stringify(debugOutput)}></div>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerColumn}>
            <h3>Navigation</h3>
            <div className={styles.footerLinks}>
              {sectionsData.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className={styles.footerLink}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(section.id);
                  }}
                >
                  {section.title}
                </a>
              ))}
            </div>
          </div>

          <div className={styles.footerColumn}>
            <h3>Legal</h3>
            <div className={styles.footerLinks}>
              <Link href="/privacy" className={styles.footerLink}>Privacy Policy</Link>
              <Link href="/terms" className={styles.footerLink}>Terms of Use</Link>
              <Link href="/cookies" className={styles.footerLink}>Cookie Policy</Link>
            </div>
          </div>
        </div>

        <div className={styles.disclaimer}>
          Information provided is for general purposes only and not financial advice.
        </div>

        <div className={styles.footerContent}>
          <Link href="/admin" className={styles.adminLink}>Admin</Link>
        </div>
      </footer>
    </div>
  );
} 