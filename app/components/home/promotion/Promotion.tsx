import Image from "next/image";
const Promotion = () => {
    return (
      <div className="mx-auto my-12">
        <div className="grid grid-cols-1 md:grid-cols-2 items-center bg-gray-100 overflow-hidden">
          {/* Sol taraf: Resim */}
          <div className="relative h-80 md:h-full">
            <Image
                src={"/images/promotion/promotion.png"}
                alt={"Lambader"}
                width={400}
                height={300}
                className="object-cover w-full"
            />           
          </div>
          
          {/* Sağ taraf: Metin ve buton */}
          <div className="p-8 text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Evinize Işık Tutun, Tarzınızı Yansıtın
            </h2>
            <p className="text-lg text-gray-700 mb-6">
            En şık ve modern aydınlatma çözümleriyle evinizi yeniden keşfedin. Sınırlı süreli fırsatlarla şimdi alışverişe başlayın
            </p>
            <button className="bg-black text-white px-6 py-3 rounded-lg text-lg font-medium hover:bg-gray-800 transition">
              Alışverişe Başla →
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  export default Promotion;
  