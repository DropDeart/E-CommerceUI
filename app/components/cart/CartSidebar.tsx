"use client";

import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";
import { Button } from "@/components/ui/button";
import { clearCart } from "@/store/slices/cartSlice";
import Image from "next/image";

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

export default function CartSidebar({ isOpen, onClose, onCheckout }: CartSidebarProps) {
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const dispatch = useDispatch();

  const totalPrice = cartItems.reduce((acc, item) => acc + item.quantity * item.product.price, 0);



  return (
    <div
      className={`fixed inset-y-0 right-0 w-80 bg-white shadow-lg p-6 transform ${
        isOpen ? "translate-x-0" : "translate-x-full"
      } transition-transform duration-300 ease-in-out z-50`}
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Sepet</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 font-bold">X</button>
      </div>

      {cartItems.length === 0 ? (
        <p className="text-gray-500">Ürün Bulunamadı</p>
      ) : (
        <div className="flex flex-col space-y-4">
          {cartItems.map((item) => (
            <div key={item.product.id} className="flex items-center space-x-4">
              <div className="w-16 h-16 relative">
                <Image
                    src={
                    item.product.imageUrl && item.product.imageUrl.length > 0
                        ? `${BASE_URL}${item.product.imageUrl}`
                        : "/images/kayra_export.webp"
                    }
                    alt={item.product.name}
                    fill
                    className="object-cover rounded"
                />
                </div>
              <div className="flex-1">
                <p className="font-medium">{item.product.name}</p>
                <p className="text-sm text-gray-500">
                  {item.quantity} x {item.product.price.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
                </p>
              </div>
            </div>
          ))}

          <div className="mt-4 border-t pt-4 flex justify-between items-center">
            <span className="font-semibold">Toplam:</span>
            <span className="font-bold">
              {totalPrice.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
            </span>
          </div>

          <div className="mt-6 space-y-2">
            <Button className="w-full" onClick={onCheckout}>
              Ödeme Yap
            </Button>
            <Button
              className="w-full"
              variant="outline"
              onClick={() => dispatch(clearCart())}
            >
              Ürünü Sil
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
