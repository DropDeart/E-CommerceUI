"use client";
import { FcShipped } from "react-icons/fc";
import { FcUndo } from "react-icons/fc";
import { FcAssistant } from "react-icons/fc";
import { FcUnlock } from "react-icons/fc";





const features = [
  { icon: <FcShipped size={32} />, title: "Ücretsiz Kargo", description: "500₺ ve üzeri alışverişlerde ücretsiz kargo fırsatı!" },
  { icon: <FcUndo size={32} />, title: "Kolay İade", description: "30 gün içerisinde koşulsuz iade hakkı." },
  { icon: <FcUnlock size={32} />, title: "Güvenli Ödeme", description: "3D Secure ile güvenli ödeme imkanı." },
  { icon: <FcAssistant size={32} />, title: "7/24 Destek", description: "Her zaman yanınızdayız, bizimle iletişime geçin!" },
];

const CompanyFeatures = () => {
  return (
    <div className="container mx-auto px-6 py-12">      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => (
          <div 
            key={index} 
            className="bg-gray-100 p-6 flex flex-col items-center text-center 
                       transition-transform transform hover:scale-105 duration-300"
          >
            <div className="text-primary mb-4">{feature.icon}</div>
            <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
            <p className="text-gray-600">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CompanyFeatures;
