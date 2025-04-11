"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/autoplay"; // autoplay modülünü dahil et
import Image from "next/image";
import { Autoplay } from "swiper/modules"; // Autoplay modülünü dahil et

const partners = [
  { name: "Partner 1", logo: "/images/partners/ikea.png" },
  { name: "Partner 2", logo: "/images/partners/ikea.png" },
  { name: "Partner 3", logo: "/images/partners/ikea.png" },
  { name: "Partner 4", logo: "/images/partners/ikea.png" },
  { name: "Partner 5", logo: "/images/partners/ikea.png" },
  { name: "Partner 6", logo: "/images/partners/ikea.png" },
];

const Partners = () => {
  return (
    <div className="container mx-auto px-6 py-12">
      <Swiper
        loop={true} // Sonsuz döngü
        slidesPerView={4} // Ekranda 4 partner göster
        spaceBetween={30} // Partnerler arasındaki boşluk
        className="w-full"
        speed={3000}
        autoplay={{
          delay: 0, // Sürekli kaymasını sağlıyoruz
          disableOnInteraction: false, // Kullanıcı etkileşimi olsa bile kaymaya devam etsin
        }}
        breakpoints={{
          640: { slidesPerView: 1 }, // Mobilde 1 item
          768: { slidesPerView: 2 }, // 768px ve üzeri 2 item
          1024: { slidesPerView: 3 }, // 1024px ve üzeri 3 item
          1280: { slidesPerView: 4 }, // 1280px ve üzeri 4 item
        }}
        modules={[Autoplay]} // Autoplay modülünü buraya ekle
      >
        {partners.map((partner, index) => (
          <SwiperSlide key={index}>
            <div className="flex justify-center">
              <Image
                src={partner.logo}
                alt={partner.name}
                width={256}
                height={64}
                className="object-contain"
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default Partners;
