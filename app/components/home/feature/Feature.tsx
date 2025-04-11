"use client";
import { Swiper as SwiperClass } from "swiper"; // Swiper'ın sınıfını alıyoruz
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import Image from "next/image";
import { useRef } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const products = [
  { name: "Ürün 1", description: "Bu ürün çok kaliteli ve kullanışlı.", price: "299₺", imageUrl: "/images/resim-1.jpg" },
  { name: "Ürün 2", description: "Uzun ömürlü ve dayanıklı bir ürün.", price: "499₺", imageUrl: "/images/resim-2.jpg" },
  { name: "Ürün 3", description: "En yeni teknolojilerle üretilmiş.", price: "799₺", imageUrl: "/images/resim-3.jpg" },
  { name: "Ürün 4", description: "Mükemmel fiyat-performans ürünü.", price: "199₺", imageUrl: "/images/resim-1.jpg" },
  { name: "Ürün 5", description: "Harika bir fırsat!", price: "399₺", imageUrl: "/images/resim-1.jpg" },
];

const Feature = () => {
  const swiperRef = useRef<SwiperClass | null>(null); // swiperRef null veya SwiperClass olabilir

  return (
    <div>
      {/* Üst başlık ve navigasyon */}
      <div className="container mx-auto flex items-center justify-between px-6 pt-10">
        <div className="w-full flex items-center justify-between">
          <div className="w-full text-2xl font-semibold">Öne Çıkanlar</div>
          <div className="custom-pagination flex justify-end mt-4 gap-2"></div>
        </div>
      </div>

      {/* Swiper Slider */}
      <div className="container mx-auto flex items-center justify-between relative">
        <div className="container mx-auto flex items-center justify-between px-6">
          {/* Sol Ok */}
          <button
            className="absolute left-0 shadow z-10 top-1/2 transform -translate-y-1/2 p-2 bg-white border rounded-full "
            onClick={() => swiperRef.current?.slidePrev()} // Özel sağ ok butonu
          >
            <FaChevronLeft size={20} />
          </button>

          {/* Swiper bileşeni */}
          <Swiper
            spaceBetween={30}
            slidesPerView={1.2}
            pagination={{
              clickable: true,
              el: ".custom-pagination", // Bullet'ları istediğimiz div'e ekliyoruz
            }}
            navigation={false} // Default navigasyonu kapattık, çünkü biz özelleştirilmiş butonlar kullanıyoruz
            modules={[Pagination, Navigation]}
            className="w-full"
            breakpoints={{
              640: { slidesPerView: 2.2 },
              1024: { slidesPerView: 3.2 },
              1280: { slidesPerView: 4.3 },
            }}
            onSwiper={(swiper) => (swiperRef.current = swiper)} // Swiper referansını burada ayarlıyoruz
          >
            {products.map((product, index) => (
              <SwiperSlide key={index}>
                <div className="bg-white mt-6 rounded-xl flex flex-col items-center text-center h-full relative group cursor-pointer border border-gray-300">
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    width={500}
                    height={320}
                    className="w-full h-[320px] object-cover rounded-t-lg mb-4"
                  />
                  <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
                  <p className="text-gray-600 mb-4">{product.description}</p>
                  <p className="text-lg font-semibold text-green-600">{product.price}</p>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Sağ Ok */}
          <button
            className="absolute right-0 z-10 top-1/2 transform -translate-y-1/2 p-2 bg-white rounded-full border shadow"
            onClick={() => swiperRef.current?.slideNext()} // Özel sol ok butonu
          >
            <FaChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Feature;
