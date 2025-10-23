import Image from "next/image";

const Carousel = () => {
  return (
    <div className="relative w-full h-[540px]">
      {/* Desktop */}
      <Image 
        src="/images/carousel-web.png" 
        alt="Auraa" 
        fill
        priority
        className="hidden xl:inline-block w-full h-full object-cover"
      />

      {/* Tablet */}
      <Image 
        src="/images/carousel-tablet.png" 
        alt="Auraa" 
        fill
        priority
        className="hidden sm:inline-block xl:hidden w-full h-full object-cover"
      />

      {/* Mobile */}
      <Image 
        src="/images/carousel-mobile.png" 
        alt="Auraa" 
        fill
        priority
        className="inline-block md:hidden w-full h-full object-cover"
      />
    </div>
  )
}


export default Carousel