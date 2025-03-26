import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import Image from 'next/image';
import styles from '../styles/Admin.module.css';

interface Item {
  id: string;
  title: string;
  description: string;
  type: 'tool' | 'influencer';
  logo?: string;
  slug?: string;
  longDescription?: string[];
  pros?: string[];
  cons?: string[];
  useCases?: string[];
}

interface Category {
  id: string;
  title: string;
  count: number;
  icon: string;
  items: Item[];
  defaultPros?: string[];
  defaultCons?: string[];
}

interface Section {
  id: string;
  title: string;
  categories: Category[];
}

interface TreeViewProps {
  sections: Section[];
  selectedSection: Section | null;
  selectedCategory: Category | null;
  selectedItem: Item | null;
  onSelectSection: (section: Section) => void;
  onSelectCategory: (category: Category) => void;
  onSelectItem: (item: Item) => void;
  onEditSection: (section: Section) => void;
  onDeleteSection: (section: Section) => void;
  onAddCategory: (section: Section) => void;
  onEditCategory: (category: Category) => void;
  onDeleteCategory: (category: Category) => void;
  onAddItem: (category: Category) => void;
  onEditItem: (item: Item) => void;
  onDeleteItem: (item: Item) => void;
  onDragEnd: (result: any) => void;
}

const TreeView: React.FC<TreeViewProps> = ({
  sections,
  selectedSection,
  selectedCategory,
  selectedItem,
  onSelectSection,
  onSelectCategory,
  onSelectItem,
  onEditSection,
  onDeleteSection,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
  onAddItem,
  onEditItem,
  onDeleteItem,
  onDragEnd
}) => {
  const handleDeleteCategory = (e: React.MouseEvent, category: Category) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      onDeleteCategory(category);
    }
  };

  const handleEditCategory = (e: React.MouseEvent, category: Category) => {
    e.stopPropagation();
    onEditCategory(category);
  };

  const handleAddItem = (e: React.MouseEvent, category: Category) => {
    e.stopPropagation();
    onAddItem(category);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className={styles.treeView}>
        <Droppable droppableId="sections" type="section">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {sections.map((section, sectionIndex) => (
                <Draggable
                  key={section.id}
                  draggableId={section.id}
                  index={sectionIndex}
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`${styles.section} ${selectedSection?.id === section.id ? styles.selected : ''}`}
                    >
                      <div className={styles.sectionHeader} onClick={() => onSelectSection(section)}>
                        <div {...provided.dragHandleProps} className={styles.dragHandle}>⋮</div>
                        <span className={styles.sectionContent}>{section.title}</span>
                        <div className={styles.actionButtons}>
                          <button
                            className={styles.addButton}
                            onClick={(e) => {
                              e.stopPropagation();
                              onAddCategory(section);
                            }}
                            title="Add category"
                          >
                            +
                          </button>
                          <button
                            className={styles.editButton}
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditSection(section);
                            }}
                            title="Edit section"
                          >
                            ✎
                          </button>
                          <button
                            className={styles.deleteButton}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm('Are you sure you want to delete this section?')) {
                                onDeleteSection(section);
                              }
                            }}
                            title="Delete section"
                          >
                            ×
                          </button>
                        </div>
                      </div>

                      <Droppable droppableId={section.id} type="category">
                        {(provided) => (
                          <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className={styles.categories}
                          >
                            {section.categories.map((category, categoryIndex) => (
                              <Draggable
                                key={category.id}
                                draggableId={category.id}
                                index={categoryIndex}
                              >
                                {(provided) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    className={`${styles.category} ${selectedCategory?.id === category.id ? styles.selected : ''}`}
                                  >
                                    <div 
                                      className={styles.categoryHeader}
                                      onClick={() => onSelectCategory(category)}
                                    >
                                      <div {...provided.dragHandleProps} className={styles.dragHandle}>⋮</div>
                                      <div className={styles.categoryContent}>
                                        <span>{category.title}</span>
                                      </div>
                                      <div className={styles.actionButtons}>
                                        <button
                                          className={styles.addButton}
                                          onClick={(e) => handleAddItem(e, category)}
                                          title="Add item"
                                        >
                                          +
                                        </button>
                                        <button
                                          className={styles.editButton}
                                          onClick={(e) => handleEditCategory(e, category)}
                                          title="Edit category"
                                        >
                                          ✎
                                        </button>
                                        <button
                                          className={styles.deleteButton}
                                          onClick={(e) => handleDeleteCategory(e, category)}
                                          title="Delete category"
                                        >
                                          ×
                                        </button>
                                      </div>
                                    </div>

                                    <Droppable droppableId={`${section.id}:${category.id}`} type="item">
                                      {(provided) => (
                                        <div
                                          {...provided.droppableProps}
                                          ref={provided.innerRef}
                                          className={styles.items}
                                        >
                                          {category.items.map((item, itemIndex) => (
                                            <Draggable
                                              key={item.id}
                                              draggableId={item.id}
                                              index={itemIndex}
                                            >
                                              {(provided) => (
                                                <div
                                                  ref={provided.innerRef}
                                                  {...provided.draggableProps}
                                                  className={`${styles.item} ${selectedItem?.id === item.id ? styles.selected : ''}`}
                                                >
                                                  <div 
                                                    className={styles.itemHeader}
                                                    onClick={() => onSelectItem(item)}
                                                  >
                                                    <div {...provided.dragHandleProps} className={styles.dragHandle}>⋮</div>
                                                    <div className={styles.itemContent}>
                                                      <span>{item.title}</span>
                                                    </div>
                                                    <div className={styles.actionButtons}>
                                                      <button
                                                        className={styles.editButton}
                                                        onClick={(e) => {
                                                          e.stopPropagation();
                                                          onEditItem(item);
                                                        }}
                                                        title="Edit item"
                                                      >
                                                        ✎
                                                      </button>
                                                      <button
                                                        className={styles.deleteButton}
                                                        onClick={(e) => {
                                                          e.stopPropagation();
                                                          onDeleteItem(item);
                                                        }}
                                                        title="Delete item"
                                                      >
                                                        ×
                                                      </button>
                                                    </div>
                                                  </div>
                                                </div>
                                              )}
                                            </Draggable>
                                          ))}
                                          {provided.placeholder}
                                        </div>
                                      )}
                                    </Droppable>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>
    </DragDropContext>
  );
};

export default TreeView;