import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
import styles from '../../styles/ToolDetail.module.css';

interface InfluencerData {
  name: string;
  description: string;
  logo: string;
  bio: string;
  likes: string[];
  dislikes: string[];
  stats: {
    views: string;
    followers: string;
    engagement: string;
  };
}

const influencerData: { [key: string]: InfluencerData } = {
  'crypto-master': {
    name: 'Crypto Master',
    description: 'Leading crypto AI researcher and educator',
    logo: '/profiles/crypto1.png',
    bio: 'Pioneering the intersection of AI and cryptocurrency trading with innovative research and practical applications. With over a decade of experience in both traditional finance and cryptocurrency markets, Crypto Master has been at the forefront of implementing AI solutions for trading and market analysis.',
    likes: [
      'Advanced AI trading strategies',
      'Educational content creation',
      'Community building',
      'Technical analysis',
      'Market psychology'
    ],
    dislikes: [
      'Short-term trading',
      'Market manipulation',
      'Poor risk management',
      'FOMO trading',
      'Unverified signals'
    ],
    stats: {
      views: '1.2M',
      followers: '245K',
      engagement: '12.5%'
    }
  },
  'ai-trader': {
    name: 'AI Trader',
    description: 'AI trading systems architect',
    logo: '/profiles/ai1.png',
    bio: 'Building next-generation AI trading systems and educating traders on algorithmic strategies. Specializing in developing automated trading systems that leverage machine learning for market prediction and risk management.',
    likes: [
      'System automation',
      'Risk management',
      'Data analysis',
      'Machine learning',
      'Portfolio optimization'
    ],
    dislikes: [
      'Manual trading',
      'Emotional decisions',
      'Incomplete data',
      'Poor documentation',
      'Untested strategies'
    ],
    stats: {
      views: '875K',
      followers: '156K',
      engagement: '9.8%'
    }
  }
};

export default function InfluencerDetail() {
  const router = useRouter();
  const { slug } = router.query;
  
  const data = slug && typeof slug === 'string' ? influencerData[slug] : null;

  if (!data) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>{data.name} - AI & Crypto Directory</title>
        <meta name="description" content={data.description} />
      </Head>

      <main className={styles.main}>
        <div className={styles.header}>
          <div className={styles.logoContainer}>
            {data.logo ? (
              <Image 
                src={data.logo}
                alt={data.name}
                width={48}
                height={48}
                className={styles.logo}
              />
            ) : (
              <div className={styles.logoFallback}>
                {data.name[0]}
              </div>
            )}
          </div>
          
          <div className={styles.headerContent}>
            <h1 className={styles.title}>{data.name}</h1>
            <p className={styles.description}>{data.description}</p>
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.aboutSection}>
            <h2>About</h2>
            <div className={styles.description}>
              <p>{data.bio}</p>
            </div>
          </div>

          <div className={styles.prosSection}>
            <h2>Likes</h2>
            <ul className={styles.prosList}>
              {data.likes.map((like, index) => (
                <li key={index}>
                  <span className={styles.checkIcon}>✓</span>
                  {like}
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.consSection}>
            <h2>Dislikes</h2>
            <ul className={styles.consList}>
              {data.dislikes.map((dislike, index) => (
                <li key={index}>
                  <span className={styles.xIcon}>×</span>
                  {dislike}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
} 