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

function App() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path='/' element={<Shop />} />
        <Route path='/cart' element={<Cart />} />
        <Route path='/login' element={<LoginSignup />} />
        <Route path='/people' element={<ShopCategory banner={men_banner} category='people' />} />
        <Route path='/lifestyle' element={<ShopCategory banner={men_banner} category='lifestyle' />} />
        <Route path='/business' element={<ShopCategory banner={men_banner} category='business' />} />
        <Route path='/traveltourism' element={<ShopCategory banner={men_banner} category='traveltourism' />} />
        <Route path='/festivalscelebrations' element={<ShopCategory banner={men_banner} category='festivalscelebrations' />} />
        <Route path='/foodcuisine' element={<ShopCategory banner={women_banner} category='foodcuisine' />} />
        <Route path='/naturelandscapes' element={<ShopCategory banner={kid_banner} category='naturelandscapes' />} />
        <Route path='/education' element={<ShopCategory banner={kid_banner} category='education' />} />
        <Route path='/technology' element={<ShopCategory banner={kid_banner} category='technology' />} />
        <Route path='/healthcare' element={<ShopCategory banner={kid_banner} category='healthcare' />} />
        <Route path='/product' element={<Product />} >
          <Route path=':productId' element={<Product />} />
        </Route> 
     
      </Routes>
      <Footer />
      </BrowserRouter>
    </div>
  )
}

export default App
