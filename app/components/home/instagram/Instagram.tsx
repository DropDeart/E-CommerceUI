"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import Image from "next/image";

const instagramPosts = [
  "/images/instagram/post1.jpg",
  "/images/instagram/post2.jpg",
  "/images/instagram/post3.jpg",
  "/images/instagram/post4.jpg",
  "/images/instagram/post5.jpg",
];

const InstagramSection = () => {
  return (
    <div className="w-full py-12 mt-12">
      <div className="container mx-auto px-6">
        <h2 className="text-2xl font-semibold mb-6">Sizden Gelenler</h2>
      </div>
      <Swiper
        loop={true}
        slidesPerView={3}
        spaceBetween={20}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        modules={[Autoplay]}
        breakpoints={{
          640: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
          1280: { slidesPerView: 5 },
        }}
        className="w-full"
      >
        {instagramPosts.map((image, index) => (
          <SwiperSlide key={index}>
            <div className="flex justify-center">
              <Image
                src={image}
                alt={`Instagram post ${index + 1}`}
                width={300}
                height={300}
                className="object-cover rounded-lg"
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default InstagramSection;
