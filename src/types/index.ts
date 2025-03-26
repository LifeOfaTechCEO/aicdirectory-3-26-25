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

export interface Product {
  id: string;
  name: string;
  description: string;
  url: string;
  icon?: string;
}

export interface Category {
  id: string;
  title: string;
  description: string;
  icon: string;
  items: Item[];
  products: Product[];
}

export interface Section {
  id: string;
  title: string;
  description: string;
  categories: Category[];
} 