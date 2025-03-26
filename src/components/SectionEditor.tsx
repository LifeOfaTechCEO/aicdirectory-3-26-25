import { useState } from 'react';
import styles from '@/styles/SectionEditor.module.css';
import { Section, Category } from '../../types';

interface SectionEditorProps {
  sections: Section[];
  onSave: (sections: Section[]) => void;
  readOnly?: boolean;
}

const SectionEditor: React.FC<SectionEditorProps> = ({ sections, onSave, readOnly = false }) => {
  const [editedSections, setEditedSections] = useState<Section[]>(sections);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  // Handle changes to section titles
  const handleSectionTitleChange = (index: number, newTitle: string) => {
    if (readOnly) return;
    const newSections = [...editedSections];
    newSections[index] = { ...newSections[index], title: newTitle };
    setEditedSections(newSections);
  };

  // Handle changes to category data
  const handleCategoryChange = (sectionIndex: number, categoryIndex: number, field: keyof Category, value: string) => {
    if (readOnly) return;
    const newSections = [...editedSections];
    const newCategories = [...newSections[sectionIndex].categories];
    
    newCategories[categoryIndex] = {
      ...newCategories[categoryIndex],
      [field]: value,
    };
    
    newSections[sectionIndex] = {
      ...newSections[sectionIndex],
      categories: newCategories,
    };
    
    setEditedSections(newSections);
  };

  // Toggle section expansion
  const toggleSectionExpanded = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  // Toggle category expansion
  const toggleCategoryExpanded = (categoryId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  // Add a new category to a section
  const addCategory = (sectionIndex: number) => {
    if (readOnly) return;
    const newSections = [...editedSections];
    const newCategory: Category = {
      id: `cat-${Date.now()}`,
      title: 'New Category',
      description: '',
      icon: 'default-icon',
      products: []
    };
    
    newSections[sectionIndex].categories.push(newCategory);
    setEditedSections(newSections);
    
    // Auto-expand the new category
    setExpandedCategories(prev => ({
      ...prev,
      [newCategory.id]: true
    }));
  };

  // Delete a category from a section
  const deleteCategory = (sectionIndex: number, categoryIndex: number) => {
    if (readOnly) return;
    if (!confirm('Are you sure you want to delete this category?')) return;
    
    const newSections = [...editedSections];
    newSections[sectionIndex].categories.splice(categoryIndex, 1);
    setEditedSections(newSections);
  };

  // Add a new product to a category
  const addProduct = (sectionIndex: number, categoryIndex: number) => {
    if (readOnly) return;
    const newSections = [...editedSections];
    const newProduct = {
      id: `prod-${Date.now()}`,
      name: 'New Product',
      description: '',
      url: '',
      pros: [''],
      cons: [''],
      pricing: '',
      rating: 0
    };
    
    newSections[sectionIndex].categories[categoryIndex].products.push(newProduct);
    setEditedSections(newSections);
  };

  // Delete a product from a category
  const deleteProduct = (sectionIndex: number, categoryIndex: number, productIndex: number) => {
    if (readOnly) return;
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    const newSections = [...editedSections];
    newSections[sectionIndex].categories[categoryIndex].products.splice(productIndex, 1);
    setEditedSections(newSections);
  };

  // Update a product's property
  const updateProduct = (sectionIndex: number, categoryIndex: number, productIndex: number, field: string, value: any) => {
    if (readOnly) return;
    const newSections = [...editedSections];
    newSections[sectionIndex].categories[categoryIndex].products[productIndex] = {
      ...newSections[sectionIndex].categories[categoryIndex].products[productIndex],
      [field]: value
    };
    setEditedSections(newSections);
  };

  // Add an item to a product's pros or cons array
  const addProsConsItem = (sectionIndex: number, categoryIndex: number, productIndex: number, field: 'pros' | 'cons') => {
    if (readOnly) return;
    const newSections = [...editedSections];
    newSections[sectionIndex].categories[categoryIndex].products[productIndex][field].push('');
    setEditedSections(newSections);
  };

  // Update a pros or cons item
  const updateProsConsItem = (
    sectionIndex: number, 
    categoryIndex: number, 
    productIndex: number, 
    field: 'pros' | 'cons', 
    itemIndex: number, 
    value: string
  ) => {
    if (readOnly) return;
    const newSections = [...editedSections];
    newSections[sectionIndex].categories[categoryIndex].products[productIndex][field][itemIndex] = value;
    setEditedSections(newSections);
  };

  // Delete a pros or cons item
  const deleteProsConsItem = (
    sectionIndex: number, 
    categoryIndex: number, 
    productIndex: number, 
    field: 'pros' | 'cons', 
    itemIndex: number
  ) => {
    if (readOnly) return;
    const newSections = [...editedSections];
    newSections[sectionIndex].categories[categoryIndex].products[productIndex][field].splice(itemIndex, 1);
    setEditedSections(newSections);
  };

  // Handle save button click
  const handleSave = () => {
    onSave(editedSections);
  };

  return (
    <div className={styles.sectionEditor}>
      {readOnly && (
        <div className={styles.readOnlyWarning}>
          READ-ONLY MODE: Editing is disabled when in offline mode
        </div>
      )}

      <div className={styles.controls}>
        <button 
          onClick={handleSave} 
          className={styles.saveButton}
          disabled={readOnly}
        >
          Save Changes
        </button>
      </div>

      {editedSections.map((section, sectionIndex) => (
        <div key={section.id} className={styles.section}>
          <div 
            className={styles.sectionHeader} 
            onClick={() => toggleSectionExpanded(section.id)}
          >
            <span className={expandedSections[section.id] ? styles.expandedIcon : styles.collapsedIcon}>
              {expandedSections[section.id] ? '▼' : '►'}
            </span>
            
            <input
              type="text"
              value={section.title}
              onChange={(e) => handleSectionTitleChange(sectionIndex, e.target.value)}
              className={styles.sectionTitle}
              disabled={readOnly}
            />
          </div>

          {expandedSections[section.id] && (
            <div className={styles.sectionContent}>
              {section.categories.map((category, categoryIndex) => (
                <div key={category.id} className={styles.category}>
                  <div 
                    className={styles.categoryHeader}
                    onClick={() => toggleCategoryExpanded(category.id)}
                  >
                    <span className={expandedCategories[category.id] ? styles.expandedIcon : styles.collapsedIcon}>
                      {expandedCategories[category.id] ? '▼' : '►'}
                    </span>
                    
                    <input
                      type="text"
                      value={category.title}
                      onChange={(e) => handleCategoryChange(sectionIndex, categoryIndex, 'title', e.target.value)}
                      className={styles.categoryTitle}
                      disabled={readOnly}
                    />
                    
                    {!readOnly && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteCategory(sectionIndex, categoryIndex);
                        }}
                        className={styles.deleteButton}
                        title="Delete Category"
                      >
                        ✖
                      </button>
                    )}
                  </div>

                  {expandedCategories[category.id] && (
                    <div className={styles.categoryContent}>
                      <div className={styles.formGroup}>
                        <label>Description:</label>
                        <textarea
                          value={category.description}
                          onChange={(e) => handleCategoryChange(sectionIndex, categoryIndex, 'description', e.target.value)}
                          rows={2}
                          disabled={readOnly}
                        />
                      </div>
                      
                      <div className={styles.formGroup}>
                        <label>Icon:</label>
                        <input
                          type="text"
                          value={category.icon}
                          onChange={(e) => handleCategoryChange(sectionIndex, categoryIndex, 'icon', e.target.value)}
                          disabled={readOnly}
                        />
                      </div>

                      <div className={styles.productsHeader}>
                        <h4>Products</h4>
                        {!readOnly && (
                          <button 
                            onClick={() => addProduct(sectionIndex, categoryIndex)}
                            className={styles.addButton}
                          >
                            + Add Product
                          </button>
                        )}
                      </div>

                      {category.products.map((product, productIndex) => (
                        <div key={product.id} className={styles.product}>
                          <div className={styles.productHeader}>
                            <input
                              type="text"
                              value={product.name}
                              onChange={(e) => updateProduct(sectionIndex, categoryIndex, productIndex, 'name', e.target.value)}
                              className={styles.productName}
                              placeholder="Product Name"
                              disabled={readOnly}
                            />
                            
                            {!readOnly && (
                              <button 
                                onClick={() => deleteProduct(sectionIndex, categoryIndex, productIndex)}
                                className={styles.deleteButton}
                                title="Delete Product"
                              >
                                ✖
                              </button>
                            )}
                          </div>

                          <div className={styles.formGroup}>
                            <label>Description:</label>
                            <textarea
                              value={product.description}
                              onChange={(e) => updateProduct(sectionIndex, categoryIndex, productIndex, 'description', e.target.value)}
                              rows={2}
                              disabled={readOnly}
                            />
                          </div>

                          <div className={styles.formGroup}>
                            <label>URL:</label>
                            <input
                              type="text"
                              value={product.url}
                              onChange={(e) => updateProduct(sectionIndex, categoryIndex, productIndex, 'url', e.target.value)}
                              disabled={readOnly}
                            />
                          </div>

                          <div className={styles.formGroup}>
                            <label>Pricing:</label>
                            <input
                              type="text"
                              value={product.pricing}
                              onChange={(e) => updateProduct(sectionIndex, categoryIndex, productIndex, 'pricing', e.target.value)}
                              disabled={readOnly}
                            />
                          </div>

                          <div className={styles.formGroup}>
                            <label>Rating (0-5):</label>
                            <input
                              type="number"
                              min="0"
                              max="5"
                              step="0.1"
                              value={product.rating}
                              onChange={(e) => updateProduct(sectionIndex, categoryIndex, productIndex, 'rating', parseFloat(e.target.value))}
                              disabled={readOnly}
                            />
                          </div>

                          <div className={styles.prosConsSection}>
                            <div className={styles.prosConsColumn}>
                              <div className={styles.prosConsHeader}>
                                <h5>Pros</h5>
                                {!readOnly && (
                                  <button
                                    onClick={() => addProsConsItem(sectionIndex, categoryIndex, productIndex, 'pros')}
                                    className={styles.addSmallButton}
                                  >
                                    +
                                  </button>
                                )}
                              </div>
                              
                              {product.pros.map((pro, proIndex) => (
                                <div key={proIndex} className={styles.prosConsItem}>
                                  <input
                                    type="text"
                                    value={pro}
                                    onChange={(e) => updateProsConsItem(sectionIndex, categoryIndex, productIndex, 'pros', proIndex, e.target.value)}
                                    placeholder="Pro point"
                                    disabled={readOnly}
                                  />
                                  
                                  {!readOnly && (
                                    <button
                                      onClick={() => deleteProsConsItem(sectionIndex, categoryIndex, productIndex, 'pros', proIndex)}
                                      className={styles.deleteSmallButton}
                                    >
                                      ✖
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>

                            <div className={styles.prosConsColumn}>
                              <div className={styles.prosConsHeader}>
                                <h5>Cons</h5>
                                {!readOnly && (
                                  <button
                                    onClick={() => addProsConsItem(sectionIndex, categoryIndex, productIndex, 'cons')}
                                    className={styles.addSmallButton}
                                  >
                                    +
                                  </button>
                                )}
                              </div>
                              
                              {product.cons.map((con, conIndex) => (
                                <div key={conIndex} className={styles.prosConsItem}>
                                  <input
                                    type="text"
                                    value={con}
                                    onChange={(e) => updateProsConsItem(sectionIndex, categoryIndex, productIndex, 'cons', conIndex, e.target.value)}
                                    placeholder="Con point"
                                    disabled={readOnly}
                                  />
                                  
                                  {!readOnly && (
                                    <button
                                      onClick={() => deleteProsConsItem(sectionIndex, categoryIndex, productIndex, 'cons', conIndex)}
                                      className={styles.deleteSmallButton}
                                    >
                                      ✖
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}

                    </div>
                  )}
                </div>
              ))}

              {!readOnly && (
                <button 
                  onClick={() => addCategory(sectionIndex)}
                  className={styles.addButton}
                >
                  + Add Category
                </button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default SectionEditor; 