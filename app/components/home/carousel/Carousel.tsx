import Image from "next/image";

const Carousel = () => {
  return (
    <div className="relative w-full h-[720px]">
      <Image 
        src="/images/carousel.png" 
        alt="Hero Resmi" 
        layout="fill" 
        objectFit="cover" 
        priority
      />
      <div className="absolute left-[13rem] bottom-[12rem] primary-text-color text-4xl font-semibold">
        <div>Modern Tasarımların</div>
        <div className="mt-2"><span className="text-yellow-50">Işık</span> ile Buluşması</div>
        <div className="mt-4">
            <div className="text-center text-xl font-medium py-4">
                <a href="/GirisYap" className="general-btn">Keşfet</a>
            </div>
        </div>
      </div>
    </div>
  )
}

export default Carousel