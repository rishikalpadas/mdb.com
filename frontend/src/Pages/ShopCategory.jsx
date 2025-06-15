import React, { useContext, useState, useEffect } from 'react';
import './CSS/ShopCategory.css';
import { ShopContext } from '../Context/ShopContext';
import Item from '../Components/Item/Item';

const ShopCategory = (props) => {
  const { all_product } = useContext(ShopContext);
  const [selectedType, setSelectedType] = useState(''); 
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8); // Start with fewer items
  const [isLoading, setIsLoading] = useState(false);

  // Update items per page based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1200) {
        setItemsPerPage(12);
      } else if (window.innerWidth > 768) {
        setItemsPerPage(8);
      } else {
        setItemsPerPage(6);
      }
    };

    handleResize(); // Call once on initial load
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const categoryTypes = {
    apparel: [
      'tshirts', 'hoodiessweatshirts', 'jacketsblazers', 'ethnicwear', 'kidswear',
      'sportswearactivewear', 'casualwear', 'corporatewear', 'others'
    ],
    printpattern: [
      'graphicprints', 'typographyquotes', 'floralnature', 'animalwildlife', 'abstractgeometric',
      'culturaltraditional', 'plaidcheckered', 'psychedelictrippy', 'others'
    ],
    themebased: [
      'summerbeachwear', 'winterchristmas', 'halloweenhorror', 'valentineromantic',
      'festivecelebration', 'gamingesports', 'musicpopculture', 'vintageretro', 'others'
    ],
    customizationbased: [
      'editablecolorvariations', 'aigeneratedexclusiveprints', 'scalablevectordesigns',
      'mockupsreadytoprintfiles', 'others'
    ],
    businessindustryspecific: [
      'corporatebranding', 'foodbeverage', 'fitnessmotivation',
      'entertainmentinfluencermerch', 'traveladventure', 'others'
    ]
  };

  const subcategories = {
    tshirts: ['casual', 'oversized', 'graphic', 'typography', 'retro', 'others'],
    hoodiessweatshirts: ['urban', 'minimal', 'embroidered', 'anime', 'others'],
    jacketsblazers: ['streetwear', 'denim', 'bomber', 'formal', 'others'],
    ethnicwear: ['sareeprints', 'kurtapatterns', 'dupattadesigns', 'others'],
    kidswear: ['cartoon', 'cutepatterns', 'nurseryprints', 'others'],
    sportswearactivewear: ['fitness', 'athleisure', 'jerseydesigns', 'others'],
    casualwear: ['polo', 'halfsleeve', 'fullsleeve', 'vintage', 'others'],
    corporatewear: ['uniforms', 'poloshirts', 'eventtees', 'others'],
    
    // Print & Pattern Categories
    graphicprints: ['artistic', 'digital', 'conceptual', 'illustrations'],
    typographyquotes: ['motivational', 'funny', 'minimal', 'calligraphy'],
    floralnature: ['botanical', 'watercolor', 'abstractleaves'],
    animalwildlife: ['leopard', 'tiger', 'birds', 'jungle'],
    abstractgeometric: ['futuristic', 'lineart', 'opticalillusions'],
    culturaltraditional: ['indian', 'japanese', 'tribal', 'boho'],
    plaidcheckered: ['classic', 'scottish', 'modernvariations'],
    psychedelictrippy: ['vibrant', 'opticalwaves', 'gradientmagic'],
  
    // Theme-Based Categories
    summerbeachwear: ['tropical', 'hawaiian', 'sunsetprints'],
    winterchristmas: ['snowflakes', 'reindeer', 'cozythemes'],
    halloweenhorror: ['skulls', 'witches', 'darkaesthetic'],
    valentineromantic: ['hearts', 'lovequotes', 'cutedoodles'],
    festivecelebration: ['diwali', 'eid', 'newyear', 'holiprints'],
    gamingesports: ['pixelart', 'consoleinspired', 'cyberpunk'],
    musicpopculture: ['bandtees', 'dj', 'retrocassette'],
    vintageretro: ['80s90s', 'oldschool', 'neonvibes'],
  
    // Remaining categories...
    editablecolorvariations: ['customcolors', 'palettes', 'contrastsets'],
    aigeneratedexclusiveprints: ['unique', 'exclusive', 'oneofakind'],
    scalablevectordesigns: ['smallprint', 'largeformat', 'resizable'],
    mockupsreadytoprintfiles: ['mockups', 'readytoprint', 'templates'],
  
    corporatebranding: ['companylogos', 'events', 'conferences'],
    foodbeverage: ['restaurantmerch', 'coffee', 'beerdesigns'],
    fitnessmotivation: ['gym', 'yoga', 'bodybuildingprints'],
    entertainmentinfluencermerch: ['youtubers', 'streamers', 'vloggers'],
    traveladventure: ['maps', 'compass', 'wanderlustthemes'],
  };

  const handleTypeChange = (type) => {
    // Use animation effect on filter change
    setIsLoading(true);
    setTimeout(() => {
      setSelectedType(type === selectedType ? '' : type);
      setSelectedSubcategory('');
      setPage(1);
      setIsLoading(false);
    }, 300);
    
    if (props.onTypeChange) props.onTypeChange(type);
  };

  const handleSubcategoryChange = (e) => {
    setSelectedSubcategory(e.target.value);
    setPage(1);
  };

  // Format text properly
  const formatText = (text) => {
    return text
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .split(/(?=[A-Z])/).join(' ')
      .replace(/^\w/, c => c.toUpperCase());
  };

  // Filter products based on category, type, and subcategory
  const filteredProducts = all_product.filter(item => {
    const matchCategory = item.category === props.category;
    const matchType = selectedType ? item.type === selectedType : true;
    const matchSubcategory = selectedSubcategory ? item.subcategory === selectedSubcategory : true;
    return matchCategory && matchType && matchSubcategory;
  });

  const handleLoadMore = () => {
    setIsLoading(true);
    setTimeout(() => {
      setPage(prevPage => prevPage + 1);
      setIsLoading(false);
    }, 300);
  };

  // Calculate products to display
  const displayedProducts = filteredProducts.slice(0, page * itemsPerPage);
  const hasMoreProducts = displayedProducts.length < filteredProducts.length;

  return (
    <div className='shop-category'>
      {/* Filter section */}
      <div className="filter-container">
        <div className="filter-title">Filter by type</div>
        <div className="button-group">
          {categoryTypes[props.category]?.map((type, index) => (
            <button
              key={index}
              className={`type-button ${selectedType === type ? 'active' : ''}`}
              onClick={() => handleTypeChange(type)}
            >
              {formatText(type)}
            </button>
          ))}
        </div>
      </div>

      {/* Subcategory selector */}
      {selectedType && subcategories[selectedType] && (
        <div className="subcategory-container">
          <div className="filter-title">Refine by subcategory</div>
          <select 
            value={selectedSubcategory} 
            onChange={handleSubcategoryChange} 
            className='subcategory-selector'
          >
            <option value="">All {formatText(selectedType)}</option>
            {subcategories[selectedType].map((subcategory, index) => (
              <option key={index} value={subcategory}>
                {formatText(subcategory)}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Status indicator */}
      <div className="status-indicator">
        <div className="showing">
          Showing <span>{displayedProducts.length}</span> of <span>{filteredProducts.length}</span> products
        </div>
      </div>

      {/* Products grid */}
      <div className={`shopcategory-products ${isLoading ? 'is-loading' : ''}`}>
        {displayedProducts.length > 0 ? (
          displayedProducts.map((item, i) => (
            <Item
              key={i}
              id={item.id}
              name={item.name}
              image={item.image}
              new_price={item.new_price}
              old_price={item.old_price}
            />
          ))
        ) : (
          <div className="empty-state">
            <h3>No products found</h3>
            <p>Try adjusting your filters or browse other categories</p>
          </div>
        )}
      </div>

      {/* Load more button */}
      {hasMoreProducts && (
        <div className="shopcategory-loadmore" onClick={handleLoadMore}>
          {isLoading ? 'Loading...' : 'Load More'}
        </div>
      )}
    </div>
  );
};

export default ShopCategory;