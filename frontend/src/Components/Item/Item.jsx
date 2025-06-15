import React from 'react'
import './Item.css'
import { Link } from 'react-router-dom'

const Item = (props) => {
  return (
    <div className="item">
      <Link to={`/product/${props.id}`}>
        <div className="item-image">
          <img src={props.image} alt={props.name} />
          <div className="item-overlay">
            <span>{props.name}</span>
          </div>
        </div>
        <div className="item-details">
          {/* <div className="item-prices">
            <div className="item-price-new">
              {props.new_price === '' || props.new_price === null ? '' : '₹'}{props.new_price}
            </div>
            <div className="item-price-old">
            {props.old_price === '' || props.old_price === null ? '' : '₹'}{props.old_price}
            </div>
          </div> */}
        </div>
      </Link>
    </div>
  )
}

export default Item
