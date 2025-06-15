import React from 'react'
import './Collection.css'
import data_product from '../Assets/data'
import Item from '../Item/Item'

const Popular = () => {
  return (
    <div className='popular-collections'>
      <h1 className='collections-title'>Popular Collections</h1>
      <div className="collections-grid">
        {data_product.map((item, i) => (
          <Item 
            key={item.id} 
            id={item.id} 
            name={item.name} 
            image={item.image} 
            new_price={item.new_price} 
            old_price={item.old_price}
          />
        ))}
      </div>
    </div>
  )
}

export default Popular
