import Head from 'next/head';
import styles from '../styles/Home.module.css';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import categoriesData from '../../data/categories.json';
import { Section, Category, Item, CategoriesData } from '../../../types';

export default function Home() {
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({});
  const data = categoriesData as unknown as CategoriesData;
  const sections = data.sections;

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const renderInfluencer = (item: Item) => (
    <div className={styles.itemCard}>
      <div className={styles.itemLogo}>
        {item.logo ? (
          <Image src={item.logo} alt={item.title} width={40} height={40} />
        ) : (
          <div className={styles.placeholderLogo}>{item.title[0]}</div>
        )}
      </div>
      <div className={styles.itemContent}>
        <h3 className={styles.itemName}>{item.title}</h3>
        <p className={styles.itemDescription}>{item.description}</p>
        <Link href={`/influencers/${item.id}`} className={styles.viewMoreButton}>
          View Details →
        </Link>
      </div>
    </div>
  );

  const renderTool = (item: Item) => (
    <div className={styles.itemCard}>
      <div className={styles.itemLogo}>
        {item.logo ? (
          <Image src={item.logo} alt={item.title} width={40} height={40} />
        ) : (
          <div className={styles.placeholderLogo}>{item.title[0]}</div>
        )}
      </div>
      <div className={styles.itemContent}>
        <h3 className={styles.itemName}>{item.title}</h3>
        <p className={styles.itemDescription}>{item.description}</p>
        <Link href={`/tools/${item.id}`} className={styles.viewMoreButton}>
          View Details →
        </Link>
      </div>
    </div>
  );

  const renderItem = (item: Item, categoryId: string) => {
    if (categoryId.startsWith('ai-influencers')) return renderInfluencer(item);
    return renderTool(item);
  };

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
        {category.items.slice(0, expandedSections[category.id] ? undefined : 4).map((item, index) => (
          <div key={item.id}>
            {renderItem(item, category.id)}
          </div>
        ))}
      </div>
      {category.items.length > 4 && (
        <button 
          className={styles.expandButton}
          onClick={() => toggleSection(category.id)}
        >
          {expandedSections[category.id] ? 'Show Less' : 'View More'}
        </button>
      )}
    </div>
  );

  const renderSection = (section: Section) => (
    <div key={section.id} className={styles.sectionContainer}>
      <h2 className={styles.sectionTitle}>
        {section.title}
      </h2>
      {section.categories.map(renderCategory)}
    </div>
  );

  return (
    <div className={styles.container}>
      <Head>
        <title>Ultimate AI & Crypto Directory</title>
        <meta name="description" content="Your comprehensive resource for AI and cryptocurrency tools, guides, and expert insights." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Ultimate AI & Crypto Directory
        </h1>
        <p className={styles.description}>
          Explore the future of technology with our curated collection of AI and crypto resources.
        </p>

        {sections.map(renderSection)}
      </main>

      <footer className={styles.footer}>
        <p className={styles.disclaimer}>
          Never Financial, Plumbing, Medical, Fishing, or Any of the Advices. This directory is for informational purposes only.
        </p>
        <div className={styles.footerLinks}>
          <Link href="/privacy" className={styles.footerLink}>
            Privacy Policy
          </Link>
          <Link href="/terms" className={styles.footerLink}>
            Terms of Use
          </Link>
          <Link href="/admin/login" className={styles.adminLink}>
            Admin Login
          </Link>
        </div>
      </footer>
    </div>
  );
} 