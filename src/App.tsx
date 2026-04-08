/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from "react";
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
  CupSoda,
  LogOut,
  Mail,
  Lock,
  Loader2
} from "lucide-react";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendEmailVerification,
  signInWithPopup,
  User
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

// --- Auth Component ---

function VerificationScreen({ email, onBackToLogin }: { email: string; onBackToLogin: () => void }) {
  return (
    <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] space-y-8 text-center">
      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Mail className="w-8 h-8 text-blue-600" />
      </div>
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Verify your email</h2>
        <p className="text-stone-500 text-sm">
          We have sent you a verification email to <span className="font-semibold text-stone-900">{email}</span>. Please verify it and log in.
        </p>
      </div>
      <Button 
        variant="outline" 
        className="w-full h-12 rounded-xl border-stone-200"
        onClick={onBackToLogin}
      >
        Back to Login
      </Button>
    </div>
  );
}

function AuthScreen({ onVerificationSent }: { onVerificationSent: (email: string) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAuth = async (type: "signin" | "signup") => {
    setError("");
    setLoading(true);
    try {
      if (type === "signin") {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        if (!userCredential.user.emailVerified) {
          const userEmail = userCredential.user.email || email;
          await signOut(auth);
          onVerificationSent(userEmail);
        }
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(userCredential.user);
        const userEmail = userCredential.user.email || email;
        await signOut(auth);
        onVerificationSent(userEmail);
      }
    } catch (err: any) {
      if (type === "signin") {
        setError("Email or password is incorrect");
      } else {
        if (err.code === "auth/email-already-in-use") {
          setError("User already exists. Please sign in");
        } else {
          setError(err.message);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] space-y-8">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Fish className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold">Welcome to Nippy Chippy</h2>
        <p className="text-stone-500 text-sm">Please sign in to place your order</p>
      </div>

      <Tabs defaultValue="signin" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="signin">Sign In</TabsTrigger>
          <TabsTrigger value="signup">Sign Up</TabsTrigger>
        </TabsList>
        
        <TabsContent value="signin" className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-stone-400" />
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="name@example.com" 
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-stone-400" />
                <Input 
                  id="password" 
                  type="password" 
                  className="pl-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
            {error && <p className="text-red-500 text-xs font-medium">{error}</p>}
            <Button 
              className="w-full h-12 bg-blue-600 hover:bg-blue-700" 
              onClick={() => handleAuth("signin")}
              disabled={loading}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign In"}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="signup" className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="signup-email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-stone-400" />
                <Input 
                  id="signup-email" 
                  type="email" 
                  placeholder="name@example.com" 
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-stone-400" />
                <Input 
                  id="signup-password" 
                  type="password" 
                  className="pl-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
            {error && <p className="text-red-500 text-xs font-medium">{error}</p>}
            <Button 
              className="w-full h-12 bg-blue-600 hover:bg-blue-700" 
              onClick={() => handleAuth("signup")}
              disabled={loading}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Account"}
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      <div className="w-full space-y-4">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-stone-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-stone-500">Or continue with</span>
          </div>
        </div>

        <Button 
          variant="outline" 
          className="w-full h-12 flex items-center justify-center gap-2 border-stone-200 hover:bg-stone-50"
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Google
        </Button>
      </div>
    </div>
  );
}

// --- Main App Component ---

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [verificationEmail, setVerificationEmail] = useState<string | null>(null);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [view, setView] = useState<View>("menu");
  const [orderId, setOrderId] = useState<string>("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.emailVerified) {
        setUser(user);
      } else {
        setUser(null);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

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
            <div className="flex items-center gap-4">
              {user && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-blue-100 hover:text-white hover:bg-blue-500 rounded-full"
                  onClick={() => signOut(auth)}
                >
                  <LogOut className="w-5 h-5" />
                </Button>
              )}
              {user && view === "menu" && totalItems > 0 && (
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
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto pb-32">
          {authLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : verificationEmail ? (
            <VerificationScreen 
              email={verificationEmail} 
              onBackToLogin={() => setVerificationEmail(null)} 
            />
          ) : !user ? (
            <AuthScreen onVerificationSent={(email) => setVerificationEmail(email)} />
          ) : (
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
          )}
        </main>

        {/* Sticky Bottom Bar */}
        {user && view === "menu" && totalItems > 0 && (
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
