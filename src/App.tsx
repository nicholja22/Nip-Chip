/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Plus, 
  Minus, 
  ShoppingBag, 
  ChevronLeft, 
  CheckCircle2, 
  CreditCard,
  Fish,
  UtensilsCrossed,
  CupSoda
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

// --- Types ---

interface MenuItem {
  id: string;
  name: string;
  price: number;
}

interface MenuCategory {
  category: string;
  icon: React.ReactNode;
  items: MenuItem[];
}

type View = "menu" | "checkout" | "success";

// --- Constants ---

const MENU_DATA: MenuCategory[] = [
  {
    category: "Fish",
    icon: <Fish className="w-5 h-5" />,
    items: [
      { id: "reg-fish-chips", name: "Regular Fish and Chips", price: 12.70 },
      { id: "large-fish-chips", name: "Large Fish and Chips", price: 14.50 },
      { id: "reg-fish", name: "Regular Fish", price: 9.00 },
      { id: "large-fish", name: "Large Fish", price: 10.50 },
    ]
  },
  {
    category: "Chips",
    icon: <UtensilsCrossed className="w-5 h-5" />,
    items: [
      { id: "chips-med", name: "Medium Chips", price: 3.95 },
      { id: "chips-large", name: "Large Chips", price: 4.95 },
      { id: "chip-butty", name: "Chip Butty", price: 4.95 },
    ]
  },
  {
    category: "Drinks (cans)",
    icon: <CupSoda className="w-5 h-5" />,
    items: [
      { id: "drink-coke", name: "Coke", price: 1.70 },
      { id: "drink-sprite", name: "Sprite", price: 1.70 },
      { id: "drink-fanta", name: "Fanta", price: 1.70 },
    ]
  }
];

const ALL_ITEMS = MENU_DATA.flatMap(cat => cat.items);

// --- Components ---

export default function App() {
  const [cart, setCart] = useState<Record<string, number>>({});
  const [view, setView] = useState<View>("menu");
  const [orderId, setOrderId] = useState<string>("");

  const totalItems = useMemo(() => 
    Object.values(cart).reduce((acc: number, qty: number) => acc + qty, 0)
  , [cart]);

  const totalPrice = useMemo(() => 
    Object.entries(cart).reduce((acc: number, [id, qty]: [string, number]) => {
      const item = ALL_ITEMS.find(i => i.id === id);
      return acc + (item?.price || 0) * qty;
    }, 0)
  , [cart]);

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => {
      const current = prev[id] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const { [id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [id]: next };
    });
  };

  const handleCheckout = () => {
    if (totalItems === 0) return;
    setOrderId(`NC-${Math.random().toString(36).substr(2, 9).toUpperCase()}`);
    setView("checkout");
  };

  const handlePayment = () => {
    setView("success");
  };

  const resetOrder = () => {
    setCart({});
    setView("menu");
    setOrderId("");
  };

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-900 flex justify-center">
      <div className="w-full max-w-md bg-white shadow-2xl min-h-screen flex flex-col relative overflow-hidden">
        
        {/* Header */}
        <header className="px-6 py-8 bg-blue-600 text-white shrink-0">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Nippy Chippy</h1>
              <p className="text-blue-100 text-sm">Traditional Fish & Chips</p>
            </div>
            {view === "menu" && totalItems > 0 && (
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="relative"
              >
                <ShoppingBag className="w-6 h-6" />
                <Badge className="absolute -top-2 -right-2 bg-yellow-400 text-blue-900 border-none px-1.5 min-w-[1.2rem] h-5 flex items-center justify-center">
                  {totalItems}
                </Badge>
              </motion.div>
            )}
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto pb-32">
          <AnimatePresence mode="wait">
            {view === "menu" && (
              <motion.div
                key="menu"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-6 space-y-8"
              >
                {MENU_DATA.map((category) => (
                  <section key={category.category} className="space-y-4">
                    <div className="flex items-center gap-2 text-blue-600">
                      {category.icon}
                      <h2 className="text-lg font-semibold uppercase tracking-wider">{category.category}</h2>
                    </div>
                    <div className="space-y-3">
                      {category.items.map((item) => (
                        <Card key={item.id} className="border-stone-200 shadow-sm hover:shadow-md transition-shadow">
                          <CardContent className="p-4 flex justify-between items-center">
                            <div className="space-y-1">
                              <h3 className="font-medium">{item.name}</h3>
                              <p className="text-blue-600 font-semibold">${item.price.toFixed(2)}</p>
                            </div>
                            <div className="flex items-center gap-3 bg-stone-100 rounded-full p-1">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 rounded-full hover:bg-white"
                                onClick={() => updateQuantity(item.id, -1)}
                                disabled={!cart[item.id]}
                              >
                                <Minus className="w-4 h-4" />
                              </Button>
                              <span className="w-4 text-center font-medium">
                                {cart[item.id] || 0}
                              </span>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 rounded-full hover:bg-white"
                                onClick={() => updateQuantity(item.id, 1)}
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </section>
                ))}
              </motion.div>
            )}

            {view === "checkout" && (
              <motion.div
                key="checkout"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="p-6 space-y-6"
              >
                <Button 
                  variant="ghost" 
                  className="p-0 h-auto hover:bg-transparent text-stone-500"
                  onClick={() => setView("menu")}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" /> Back to Menu
                </Button>

                <div className="space-y-2">
                  <h2 className="text-2xl font-bold">Order Summary</h2>
                  <p className="text-stone-500 text-sm">Order ID: <span className="font-mono font-bold text-blue-600">{orderId}</span></p>
                </div>

                <Card className="border-stone-200">
                  <CardContent className="p-6 space-y-4">
                    {(Object.entries(cart) as [string, number][]).map(([id, qty]) => {
                      const item = ALL_ITEMS.find(i => i.id === id);
                      if (!item) return null;
                      return (
                        <div key={id} className="flex justify-between items-center text-sm">
                          <div className="flex gap-2">
                            <span className="font-bold text-blue-600">{qty}x</span>
                            <span>{item.name}</span>
                          </div>
                          <span className="font-medium">${(item.price * qty).toFixed(2)}</span>
                        </div>
                      );
                    })}
                    <Separator className="my-4" />
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>Total Amount</span>
                      <span className="text-blue-600">${totalPrice.toFixed(2)}</span>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-4 pt-4">
                  <Button 
                    className="w-full h-14 text-lg font-bold bg-[#0070ba] hover:bg-[#005ea6] text-white rounded-xl shadow-lg flex gap-2"
                    onClick={handlePayment}
                  >
                    <CreditCard className="w-5 h-5" />
                    Pay with PayPal
                  </Button>
                  <p className="text-center text-xs text-stone-400">
                    Secure payment powered by PayPal
                  </p>
                </div>
              </motion.div>
            )}

            {view === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 h-full flex flex-col items-center justify-center text-center space-y-6 pt-20"
              >
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-12 h-12 text-green-600" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold">Order Accepted!</h2>
                  <p className="text-stone-500">Your delicious meal is being prepared.</p>
                </div>
                <Card className="w-full bg-blue-50 border-blue-100">
                  <CardContent className="p-6 space-y-2">
                    <p className="text-sm text-blue-600 font-medium uppercase tracking-wider">Your Order ID</p>
                    <p className="text-2xl font-mono font-bold text-blue-900">{orderId}</p>
                  </CardContent>
                </Card>
                <Button 
                  variant="outline" 
                  className="w-full h-12 rounded-xl border-stone-200"
                  onClick={resetOrder}
                >
                  Place Another Order
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Sticky Bottom Bar */}
        {view === "menu" && totalItems > 0 && (
          <motion.div 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-stone-100 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]"
          >
            <Button 
              className="w-full h-14 text-lg font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg flex justify-between px-6"
              onClick={handleCheckout}
            >
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5" />
                <span>Proceed to Checkout</span>
              </div>
              <span>${totalPrice.toFixed(2)}</span>
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
