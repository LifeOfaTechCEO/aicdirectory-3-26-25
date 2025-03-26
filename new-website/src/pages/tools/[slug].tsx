import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
import styles from '../../styles/ToolDetail.module.css';
import categoriesData from '../../../data/categories.json';

interface ToolData {
  name: string;
  description: string;
  logo?: string;
  longDescription?: string[];
  pros?: string[];
  cons?: string[];
  slug?: string;
}

export default function ToolDetail() {
  const router = useRouter();
  const { slug } = router.query;

  // Find the tool in our categories data
  const tool = categoriesData.categories
    .flatMap(category => category.items as ToolData[])
    .find(item => item.slug === slug);

  if (!tool) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>{tool.name} - AI & Crypto Directory</title>
        <meta name="description" content={tool.description} />
      </Head>

      <main className={styles.main}>
        <div className={styles.header}>
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
          
          <div className={styles.headerContent}>
            <h1 className={styles.title}>{tool.name}</h1>
            <p className={styles.description}>{tool.description}</p>
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

          {tool.pros && tool.pros.length > 0 && (
            <div className={styles.prosSection}>
              <h2>Pros</h2>
              <ul className={styles.prosList}>
                {tool.pros.map((pro, index) => (
                  <li key={index}>
                    <span className={styles.checkIcon}>✓</span>
                    {pro}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {tool.cons && tool.cons.length > 0 && (
            <div className={styles.consSection}>
              <h2>Cons</h2>
              <ul className={styles.consList}>
                {tool.cons.map((con, index) => (
                  <li key={index}>
                    <span className={styles.xIcon}>×</span>
                    {con}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 