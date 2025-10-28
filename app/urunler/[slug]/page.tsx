/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { useParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { ProductDetail } from '@/app/models/Product';
import { toast, ToastContainer } from "react-toastify";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import slugify from 'slugify';
import Navbar from '@/app/components/navbar/Navbar';
import Footer from '@/app/components/footer/Footer';
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/react";
import { Thumbs } from 'swiper/modules';
import "swiper/css";
import "swiper/css/thumbs";
import Timer from '../component/timer';


const ProductDetailPage = () => {
  const swiperRef = useRef<any>(null);
  const params = useParams();
  const slug = params.slug as string; 

  const parts = slug.split('-');
  const id = parts.slice(-5).join('-');

  const [productDetailObj, setProductDetailObj] = useState<ProductDetail>();
  const [thumbsSwiper, setThumbsSwiper] = useState<any>(null);
  const [discountPrice, setDiscountPrice] = useState(0);
  const baseURL = process.env.NEXT_PUBLIC_BASE_URL;

  function currencyFormat(num : number) {
   return '₺' + num.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
  }

  const discountPriceCalculate = (price : number, rate : number) => {

    let discountPrice = 0;
    
    if(price > 0){
      const discountAmount = (price * rate) / 100;
      discountPrice = (price - discountAmount);
    }
    return discountPrice;
  }

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const url = new URL(`${baseURL}/api/Product/${id}`);
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
        console.log(products);
        setProductDetailObj(products);
      } catch (err: any) {
        toast.error(err.message || "Veriler yüklenirken hata oluştu");
      }
    };  
    fetchProducts();    

  }, [id]);

    useEffect(() => {
    if (productDetailObj?.price !== undefined && productDetailObj?.discountRate !== undefined) {
      const calculated = discountPriceCalculate(productDetailObj.price, productDetailObj.discountRate);
      setDiscountPrice(calculated);
    }
  }, [productDetailObj]);

  return (
    <div>
      <Navbar/>
      <div className='container mx-auto px-6 pt-10'>
        <div>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Anasayfa</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/urunler">Ürünler</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                  {productDetailObj?.categoryName && (
                    <BreadcrumbLink
                      href={`/kategori/${slugify(productDetailObj.categoryName, {
                        lower: true,
                        strict: true
                      })}`}
                    >
                      {productDetailObj.categoryName}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{productDetailObj?.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>          
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-6">
          <div className="relative">
            <Swiper
              slidesPerView={1}
              modules={[Thumbs]}
              thumbs={{ swiper: thumbsSwiper }}
              className="rounded-lg"
              onSwiper={(swiper) => (swiperRef.current = swiper)} // Bu satırı ekle
            >
              {productDetailObj?.images?.map((img) => (
                <SwiperSlide key={img.id}>
                  <img
                    src={img.fileUrl}
                    alt={img.fileDescription || img.fileName}
                    className="w-full xl:h-[720px] md:h-[520px] object-cover rounded-lg"
                  />
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Thumbnail Slider */}
            <Swiper
              onSwiper={setThumbsSwiper}
              spaceBetween={10}
              slidesPerView={4}
              watchSlidesProgress
              className="!hidden sm:!block mt-4"
            >
              {productDetailObj?.images?.map((img) => (
                <SwiperSlide key={img.id}>
                  <img
                    src={img.fileUrl}
                    alt={img.fileDescription || img.fileName}
                    className="h-[120px] xl:h-[160px] w-full object-cover rounded-md cursor-pointer border hover:border-black"
                  />
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Sol Ok */}
            <button
              className="absolute left-2 z-10 top-1/2 transform -translate-y-1/2 p-2 bg-white border rounded-full shadow"
              onClick={() => swiperRef.current?.slidePrev()}
            >
              <FaChevronLeft size={20} />
            </button>

            {/* Sağ Ok */}
            <button
              className="absolute right-2 z-10 top-1/2 transform -translate-y-1/2 p-2 bg-white border rounded-full shadow"
              onClick={() => swiperRef.current?.slideNext()}
            >
              <FaChevronRight size={20} />
            </button>
          </div>
          <div>
            <div className='text-[44px] font-bold primary-text-color'>{productDetailObj?.name}</div>
            <div className='mt-4 secondary-text-color text-[18px] leading-7 tracking-normal'><p>{productDetailObj?.description}</p></div>
            <div className='flex align-items-center justify-start gap-10'>
              <div className='mt-4 text-[34px] font-bold primary-text-color'>{discountPrice ? currencyFormat(discountPrice) : ""}</div>
              <div className={`mt-4 font-bold ${!discountPrice? 'primary-text-color text-[34px]': 'secondary-text-color text-[24px] line-through'}`}>{currencyFormat(productDetailObj?.price ?? 0)}</div>
            </div>
            <hr className="border-t-2 border-gray-300 my-10" />
            <div className={discountPrice && discountPrice >= 0 ? "block" : "hidden"}>              
              <Timer endDate={productDetailObj?.discountEnd ? new Date(productDetailObj.discountEnd).toISOString() : undefined} />
            </div>
          </div>
        </div>
      </div>    
      <Footer/>      
      <ToastContainer />
    </div>
  );
};

export default ProductDetailPage;