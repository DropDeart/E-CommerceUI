"use client";
import { ShoppingCart } from "lucide-react";
import CartSidebar from "../cart/CartSidebar";
import { useSelector } from "react-redux";
import { useState } from "react";
import { RootState } from "@/store/store";

const CardCount = () => {

  const cartItems = useSelector((state: RootState) => state.cart.items);
  const totalQuantity = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <div>
        <button
          className="relative text-gray-600 hover:text-blue-600 transition-colors duration-300"
          onClick={() => setIsCartOpen(true)}
        >
          <ShoppingCart className="h-6 w-6" />
          {totalQuantity > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
              {totalQuantity}
            </span>
          )}
        </button>
      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onCheckout={() => alert("Ödeme modalı açılacak")}
      />
    </div>
    



  )
}

export default CardCount