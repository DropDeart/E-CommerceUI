import Carousel from "./carousel/Carousel"
import Categories from "./categories/Categories"
// import CompanyFeatured from "./company-featured/CompanyFeatured"
import FeatureCarousel from "./feature/Feature"
import Instagram from "./instagram/Instagram"
import Partners from "./partners/Partners"
import Promotion from "./promotion/Promotion"

const MasterPage = () => {
  return (
    <div>
      <Carousel/>
      <FeatureCarousel/>
      <Categories/>
      <Promotion/>
      {/* <CompanyFeatured/> */}
      <Partners/>
      <Instagram/>
    </div>
  )
}

export default MasterPage