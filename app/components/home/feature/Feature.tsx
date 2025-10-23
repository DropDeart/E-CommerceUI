/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Swiper as SwiperClass } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation } from "swiper/modules";
import { toast, ToastContainer } from "react-toastify";
import slugify from "slugify";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { Product } from "@/app/models/Product";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useDispatch } from "react-redux";
import { addToCart } from "@/store/slices/cartSlice";

const Feature = () => {
  const baseURL = process.env.NEXT_PUBLIC_BASE_URL;
  const swiperRef = useRef<SwiperClass | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [quantity] = useState(1);
  const dispatch = useDispatch();

  function currencyFormat(num: number) {
    return (
      "₺" + num.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")
    );
  }

  const handleAddToCart = (product: Product) => {
    const simpleProduct = {
      id: product.id,
      name: product.name,
      price: product.price,
      stock: product.stock,
      description: product.description,
      imageUrl: product.imageUrl?.replace(process.env.NEXT_PUBLIC_BASE_URL || "", "").trim(),
    };

    dispatch(addToCart({ product: simpleProduct, quantity }));
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const url = new URL(`${baseURL}/api/Product/GetAllProducts`);
        const response = await fetch(url.toString(), {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Veriler alınamadı.");
        }

        const products = await response.json();
        setProducts(products);
      } catch (err: any) {
        toast.error(err.message || "Veriler yüklenirken hata oluştu");
      }
    };

    fetchProducts();
  }, []);

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
        <div className="container mx-auto flex items-center justify-between px-6 relative">
          {/* Sol Ok */}
          <button
            className="absolute left-0 shadow z-10 top-1/2 transform -translate-y-1/2 p-2 bg-white border rounded-full"
            onClick={() => swiperRef.current?.slidePrev()}
          >
            <FaChevronLeft size={20} />
          </button>

          <Swiper
            spaceBetween={30}
            slidesPerView={1.2}
            pagination={{
              clickable: true,
              el: ".custom-pagination",
            }}
            navigation={false}
            modules={[Pagination, Navigation]}
            className="w-full"
            breakpoints={{
              640: { slidesPerView: 2.2 },
              1024: { slidesPerView: 3.2 },
              1280: { slidesPerView: 4.3 },
            }}
            onSwiper={(swiper) => (swiperRef.current = swiper)}
          >
            {products.map((product) => (
            <SwiperSlide key={product.id}>
              <div className="bg-white mt-6 rounded-xl flex flex-col items-center text-center h-full relative group cursor-pointer border border-gray-300 overflow-hidden">
                
                {/* Kalp ikonu */}
                <button
                  className="absolute top-2 right-2 bg-white rounded-full flex items-center justify-center p-2 z-20 hover:text-red-500 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Favori ekleme işlemi buraya
                  }}
                >
                  <Heart size={22} />
                </button>

                {/* Ürün görseline ve adına tıklanınca detay sayfasına gider */}
                <Link
                  href={`/urunler/${slugify(product.name, { lower: true, strict: true })}-${product.id}`}
                  className="w-full h-full flex flex-col items-center text-center"
                >
                  <div className="relative w-full h-[320px] overflow-hidden">
                    <Image
                        src={product.imageUrl || "/images/resim-1.jpg"}
                        alt={product.name}
                        width={500}
                        height={320}
                        className="w-full h-full object-cover rounded-t-lg transition-transform duration-300 group-hover:scale-105"
                      />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
                    <p className="text-base font-semibold text-green-600">
                      {currencyFormat(product.price)}
                    </p>
                  </div>
                </Link>

                {/* Sepete ekle butonu artık Link dışında */}
                <Button
                  className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[80%] rounded-full opacity-0 group-hover:opacity-100 translate-y-3 group-hover:translate-y-0 transition-all duration-300 z-20"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleAddToCart(product);
                  }}
                >
                  Sepete Ekle
                </Button>
              </div>
            </SwiperSlide>
          ))}

          </Swiper>

          {/* Sağ Ok */}
          <button
            className="absolute right-0 shadow z-10 top-1/2 transform -translate-y-1/2 p-2 bg-white border rounded-full"
            onClick={() => swiperRef.current?.slideNext()}
          >
            <FaChevronRight size={20} />
          </button>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Feature;
