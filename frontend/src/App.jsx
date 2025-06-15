import { useState } from 'react'
import Navbar from './Components/Navbar/Navbar'
import { BrowserRouter,Routes,Route } from 'react-router-dom'
import ShopCategory from './Pages/ShopCategory'
import Product from './Pages/Product'
import Shop from './Pages/Shop'
import Cart from './Pages/Cart'
import LoginSignup from './Pages/LoginSignup'
import Footer from './Components/Footer/Footer'
import men_banner from './Components/Assets/banner_mens.png'
import women_banner from './Components/Assets/banner_women.png'
import kid_banner from './Components/Assets/banner_kids.png'
import PricingPage from './Components/Pricing/PricingPage'
import useDisableRightClick from './hooks/useDisableRightClick';

function App() {
  const [count, setCount] = useState(0)
  useDisableRightClick();

  return (
    <div>
      <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path='/' element={<Shop />} />
        <Route path='/cart' element={<Cart />} />
        <Route path='/login' element={<LoginSignup />} />
        <Route path='/apparel' element={<ShopCategory banner={men_banner} category='apparel' />} />
        <Route path='/printpattern' element={<ShopCategory banner={men_banner} category='printpattern' />} />
        <Route path='/themebased' element={<ShopCategory banner={men_banner} category='themebased' />} />
        <Route path='/customizationbased' element={<ShopCategory banner={men_banner} category='customizationbased' />} />
        <Route path='/businessindustryspecific' element={<ShopCategory banner={men_banner} category='businessindustryspecific' />} />
        <Route path='/product' element={<Product />} >
          <Route path=':productId' element={<Product />} />
        </Route> 
        <Route path='/pricing' element={<PricingPage />} />
     
      </Routes>
      <Footer />
      </BrowserRouter>
    </div>
  )
}

export default App
