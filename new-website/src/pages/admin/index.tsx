import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import styles from '../../styles/Admin.module.css';
import Image from 'next/image';

interface Category {
  id: string;
  title: string;
  icon: string;
  count: number;
  items: Item[];
}

interface Item {
  name: string;
  description: string;
  logo?: string;
  slug?: string;
  longDescription?: string[];
  pros?: string[];
  cons?: string[];
  stats?: {
    views?: string;
    upvotes?: string;
    saves?: string;
  };
  links?: {
    website?: string;
    github?: string;
    discord?: string;
  };
  categories?: string[];
  featured?: boolean;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const token = localStorage.getItem('adminToken');
    if (!token || token !== 'authenticated') {
      router.push('/admin/login');
      return;
    }

    loadData();
  }, [isClient, router]);

  const loadData = async () => {
    try {
      // Load initial data from the frontend categories
      const response = await fetch('/api/categories');
      if (!response.ok) {
        throw new Error('Failed to load categories');
      }
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Failed to load categories. Please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    router.push('/admin/login');
  };

  const handleAddCategory = () => {
    const newCategory: Category = {
      id: `category-${Date.now()}`,
      title: 'New Category',
      icon: '📦',
      count: 0,
      items: []
    };
    setCategories([...categories, newCategory]);
    setSelectedCategory(newCategory);
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setSelectedItem(null);
    setIsEditing(true);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      try {
        const response = await fetch(`/api/categories/${categoryId}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete category');
        }
        
        setCategories(categories.filter(c => c.id !== categoryId));
        setSelectedCategory(null);
        setSelectedItem(null);
      } catch (error) {
        console.error('Error deleting category:', error);
        alert('Failed to delete category. Please try again.');
      }
    }
  };

  const handleAddItem = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (category) {
      const newItem: Item = {
        name: 'New Item',
        description: 'Description',
        slug: `item-${Date.now()}`,
        longDescription: [],
        pros: [],
        cons: [],
        stats: {
          views: '0',
          upvotes: '0',
          saves: '0'
        },
        links: {
          website: ''
        },
        categories: [category.title],
        featured: false
      };
      category.items.push(newItem);
      setCategories([...categories]);
      setSelectedItem(newItem);
      setIsEditing(true);
    }
  };

  const handleEditItem = (item: Item) => {
    setSelectedItem(item);
    setSelectedCategory(null);
    setIsEditing(true);
  };

  const handleDeleteItem = async (categoryId: string, itemSlug: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      try {
        const response = await fetch(`/api/categories/${categoryId}/items/${itemSlug}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete item');
        }
        
        const category = categories.find(c => c.id === categoryId);
        if (category) {
          category.items = category.items.filter(item => item.slug !== itemSlug);
          setCategories([...categories]);
          setSelectedItem(null);
        }
      } catch (error) {
        console.error('Error deleting item:', error);
        alert('Failed to delete item. Please try again.');
      }
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      const response = await fetch('/api/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categories)
      });

      if (!response.ok) {
        throw new Error('Failed to save changes');
      }

      // Update counts
      const updatedCategories = categories.map(category => ({
        ...category,
        count: category.items.length
      }));
      
      setCategories(updatedCategories);
      setSelectedCategory(null);
      setSelectedItem(null);
      setIsEditing(false);
      
      alert('Changes saved successfully!');
    } catch (error) {
      console.error('Error saving data:', error);
      alert('Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isClient) {
    return null; // Return null on server-side to prevent hydration mismatch
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Admin Dashboard - AI & Crypto Directory</title>
      </Head>

      <header className={styles.header}>
        <h1 className={styles.title}>Admin Dashboard</h1>
        <button onClick={handleLogout} className={styles.logoutButton}>Logout</button>
      </header>

      <main className={styles.main}>
        <div className={styles.sidebar}>
          <button onClick={handleAddCategory} className={styles.addButton}>
            Add New Category
          </button>
          <div className={styles.categoryList}>
            {categories.map(category => (
              <div key={category.id} className={styles.categoryItem}>
                <div className={styles.categoryHeader}>
                  <span className={styles.categoryIcon}>{category.icon}</span>
                  <h3>{category.title}</h3>
                  <div className={styles.categoryActions}>
                    <button onClick={() => handleEditCategory(category)}>Edit</button>
                    <button onClick={() => handleDeleteCategory(category.id)}>Delete</button>
                    <button onClick={() => handleAddItem(category.id)}>Add Item</button>
                  </div>
                </div>
                <div className={styles.itemsGrid}>
                  {category.items.map(item => (
                    <div key={item.name} className={styles.itemCard}>
                      <div className={styles.itemLogo}>
                        {item.logo ? (
                          <Image src={item.logo} alt={item.name} width={40} height={40} />
                        ) : (
                          <div className={styles.placeholderLogo}>{item.name[0]}</div>
                        )}
                      </div>
                      <div className={styles.itemContent}>
                        <h4>{item.name}</h4>
                        <p>{item.description}</p>
                        <div className={styles.itemActions}>
                          <button onClick={() => handleEditItem(item)}>Edit</button>
                          <button onClick={() => handleDeleteItem(category.id, item.slug || '')}>Delete</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {(selectedCategory || selectedItem) && (
          <div className={styles.editor}>
            {selectedCategory && (
              <div className={styles.categoryEditor}>
                <h2>Edit Category</h2>
                <div className={styles.field}>
                  <label>Title:</label>
                  <input
                    type="text"
                    value={selectedCategory.title}
                    onChange={(e) => setSelectedCategory({
                      ...selectedCategory,
                      title: e.target.value
                    })}
                  />
                </div>
                <div className={styles.field}>
                  <label>Icon:</label>
                  <input
                    type="text"
                    value={selectedCategory.icon}
                    onChange={(e) => setSelectedCategory({
                      ...selectedCategory,
                      icon: e.target.value
                    })}
                  />
                </div>
              </div>
            )}

            {selectedItem && (
              <div className={styles.itemEditor}>
                <h2>Edit Item</h2>
                <div className={styles.field}>
                  <label>Name:</label>
                  <input
                    type="text"
                    value={selectedItem.name}
                    onChange={(e) => setSelectedItem({
                      ...selectedItem,
                      name: e.target.value
                    })}
                  />
                </div>
                <div className={styles.field}>
                  <label>Description:</label>
                  <input
                    type="text"
                    value={selectedItem.description}
                    onChange={(e) => setSelectedItem({
                      ...selectedItem,
                      description: e.target.value
                    })}
                  />
                </div>
                <div className={styles.field}>
                  <label>Logo URL:</label>
                  <input
                    type="text"
                    value={selectedItem.logo || ''}
                    onChange={(e) => setSelectedItem({
                      ...selectedItem,
                      logo: e.target.value
                    })}
                  />
                </div>
                <div className={styles.field}>
                  <label>Long Description:</label>
                  <textarea
                    value={selectedItem.longDescription?.join('\n') || ''}
                    onChange={(e) => setSelectedItem({
                      ...selectedItem,
                      longDescription: e.target.value.split('\n')
                    })}
                    placeholder="Enter each paragraph on a new line"
                  />
                </div>
                <div className={styles.field}>
                  <label>Pros:</label>
                  <textarea
                    value={selectedItem.pros?.join('\n') || ''}
                    onChange={(e) => setSelectedItem({
                      ...selectedItem,
                      pros: e.target.value.split('\n').filter(Boolean)
                    })}
                    placeholder="Enter each pro on a new line"
                  />
                </div>
                <div className={styles.field}>
                  <label>Cons:</label>
                  <textarea
                    value={selectedItem.cons?.join('\n') || ''}
                    onChange={(e) => setSelectedItem({
                      ...selectedItem,
                      cons: e.target.value.split('\n').filter(Boolean)
                    })}
                    placeholder="Enter each con on a new line"
                  />
                </div>
              </div>
            )}

            <div className={styles.editorActions}>
              <button onClick={handleSave} className={styles.saveButton}>
                Save Changes
              </button>
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setSelectedItem(null);
                  setIsEditing(false);
                }}
                className={styles.cancelButton}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
} 