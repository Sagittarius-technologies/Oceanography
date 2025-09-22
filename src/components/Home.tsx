import React from 'react'
import Hero from './Hero'
import WorldMap from './WorldMap'
import FileUploader from './FileUploader'
import Footer from './Footer'
import ImageGallery from './ImageGallery'
import DataStats from './DataStats'
import Research from './Research'
import ProcessSection from './ProcessSection'


const Home = () => {
  return (
    <div>
        <Hero/>
        <WorldMap/>
        <Research/>
        <ImageGallery/>
        <ProcessSection/>
        <DataStats/>
        <FileUploader/>
        <Footer/>
    </div>
  )
}

export default Home