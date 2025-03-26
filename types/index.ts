export interface Item {
  id: string;
  title: string;
  description: string;
  type: string;
  longDescription: string[];
  pros: string[];
  cons: string[];
  useCases: string[];
  pricing: string;
  easeOfUse: string;
  website?: string;
  logo?: string;
  aicdContributor?: string;
  aicdContributorLink?: string;
}

export interface Category {
  id: string;
  title: string;
  count: number;
  icon: string;
  items: Item[];
  defaultPros: string[];
  defaultCons: string[];
}

export interface Section {
  id: string;
  title: string;
  categories: Category[];
}

export interface CategoriesData {
  sections: Section[];
} 