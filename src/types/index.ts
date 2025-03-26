export interface Item {
  id: string;
  title: string;
  description: string;
  type: 'tool' | 'influencer';
  logo?: string;
  website?: string;
  longDescription?: string[];
  pros?: string[];
  cons?: string[];
  useCases?: string[];
  pricing?: 'Free' | 'Paid' | 'Freemium' | 'Subscription';
  easeOfUse?: 'Beginner-Friendly' | 'Intermediate' | 'Advanced';
  aicdContributor?: string;
  aicdContributorLink?: string;
}

export interface Category {
  id: string;
  title: string;
  count: number;
  icon: string;
  items: Item[];
  defaultPros?: string[];
  defaultCons?: string[];
}

export interface Section {
  id: string;
  title: string;
  categories: Category[];
} 