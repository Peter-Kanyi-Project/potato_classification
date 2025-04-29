import React from 'react'
import Navbar from '../Components/Navbar/Navbar'
import Hero from '../Components/Hero/Hero'
import Title from '../Components/Title/Title'
import About from '../Components/About/About'
import Contact from '../Components/Contact/Contact'
import Footer from '../Components/Footer/Footer'
import How from '../Components/How/How'

const home = () => {
  return (
    <div>
      <Navbar/>
      <Hero/>
      <div className="container">
        <Title subTitle={"Follow these simple steps to analyze whether a leaf is healthy or not."} title='How it works' />
        <How/>
        <About/>
        <Title subTitle='Contact Us ' title='Get in Touch' />
        <Contact />
        <Footer />
        </div> 
    </div>
  )
}

export default home