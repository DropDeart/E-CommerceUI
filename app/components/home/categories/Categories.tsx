import Image from "next/image";
import { LiaLongArrowAltRightSolid } from "react-icons/lia";

const categories = [
  {
    imageUrl: "/images/categories/table.png",
  },
  {
    imageUrl: "/images/categories/1.png",
  },
  {
    imageUrl: "/images/categories/2.png",
  },
];

const Categories = () => {
  return (
    <div className="container mx-auto px-6 py-12">
      <div className="text-2xl font-semibold mb-8">Kategoriler</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        {/* Sol kategori (Masa) */}
        <div className="flex flex-col items-center w-full relative h-fit cursor-pointer ">
          <Image
            src={categories[0].imageUrl}
            alt={"Masa"}
            width={400}
            height={300}
            className="object-cover rounded-t-lg w-full rounded-lg"
          />
          <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold absolute 
                        top-1/2 left-2/3 transform -translate-y-1/2 -translate-x-1/3 whitespace-nowrap">
            Masa Lambaları
            <p className="text-base md:text-lg lg:text-xl font-medium mt-2 pb-2 border-b border-[#141718] cursor-pointer flex items-center w-3/4">
              Alışverişe Başla <LiaLongArrowAltRightSolid size={24} className="ml-4" />

            </p>
          </div>         
        </div>

        {/* Sağdaki kategoriler (Duvar ve Yer - Abajür) */}
        <div className="flex flex-col gap-6 w-full">
          {/* Duvar Kategorisi */}
          <div className="flex flex-col items-center h-fit w-full relative">
            <Image
              src={categories[1].imageUrl}
              alt={"Duvar"}
              width={400}
              height={300}
              className="object-cover rounded-t-lg w-full rounded-lg"
            />
              <div className="absolute top-1/2 left-1/4 transform -translate-x-1/2 -translate-y-1/2 text-center">
                <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold whitespace-nowrap">
                  Yer Lambaları
                </p>
                <p className="text-base md:text-lg lg:text-xl font-medium mt-2 pb-2 border-b border-[#141718] cursor-pointer flex items-center justify-center w-max">
                  Alışverişe Başla <LiaLongArrowAltRightSolid size={24} className="ml-4" />
                </p>
            </div> 
          </div>
          {/* Yer (Abajür) Kategorisi */}
          <div className="flex flex-col items-center h-fit w-full relative">
            <Image
              src={categories[2].imageUrl}
              alt={"Lambader"}
              width={400}
              height={300}
              className="object-cover rounded-t-lg w-full rounded-lg"
            />
            <div className="absolute top-1/2 left-1/4 transform -translate-x-1/2 -translate-y-1/2 text-center">
              <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold whitespace-nowrap">
                Duvar Lambaları
              </p>
              <p className="text-base md:text-lg lg:text-xl font-medium mt-2 pb-2 border-b border-[#141718] cursor-pointer flex items-center justify-center w-max">
                Alışverişe Başla <LiaLongArrowAltRightSolid size={24} className="ml-4" />
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Categories;
