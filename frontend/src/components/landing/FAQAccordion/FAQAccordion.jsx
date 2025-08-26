import React, { useState } from 'react';
import './FAQAccordion.css';

const FAQAccordion = ({ question, answer, isOpen, onToggle }) => {
    const renderArrowIcon = () => (
        <svg 
            width="20" 
            height="20" 
            viewBox="0 0 20 20" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className={`faq-arrow ${isOpen ? 'faq-arrow-open' : ''}`}
        >
            <path 
                d="M5 7.5L10 12.5L15 7.5" 
                stroke="#0F172B" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
            />
        </svg>
    );

    return (
        <div className="faq-accordion">
            <button 
                className="faq-header"
                onClick={onToggle}
                aria-expanded={isOpen}
            >
                <h3 className="faq-question">{question}</h3>
                {renderArrowIcon()}
            </button>
            
            {isOpen && (
                <div className="faq-answer">
                    <p>{answer}</p>
                </div>
            )}
        </div>
    );
};

const FAQSection = ({ categoryData }) => {
    const [openItems, setOpenItems] = useState({});

    const toggleItem = (itemId) => {
        setOpenItems(prev => ({
            ...prev,
            [itemId]: !prev[itemId]
        }));
    };

    return (
        <div className="faq-category">
            <h3 className="faq-category-title">{categoryData.title}</h3>
            <div className="faq-items">
                {categoryData.items.map((item) => (
                    <FAQAccordion
                        key={item.id}
                        question={item.question}
                        answer={item.answer}
                        isOpen={openItems[item.id] || false}
                        onToggle={() => toggleItem(item.id)}
                    />
                ))}
            </div>
        </div>
    );
};

export { FAQAccordion, FAQSection };