"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useCartStore } from "@/lib/store/cartStore";
import { toast } from "sonner";
import { ShippingAddress, CheckoutQuote } from "@/types";
import { 
  Lock, ArrowLeft, User, Phone, MapPin, Building, Map as MapIcon, Hash, Globe, 
  ChevronDown, Plus, Minus, ShieldCheck, Truck, RefreshCcw, Headphones,
  CreditCard, Smartphone, Building2, Package, Banknote
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const InputWithIcon = ({ icon: Icon, required, label, ...props }: any) => (
  <div className="space-y-1.5 w-full">
    <label className="text-sm font-semibold text-gray-900">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
        <Icon className="w-[18px] h-[18px]" />
      </div>
      <input 
        className="w-full bg-[#fcfcfc] border border-gray-200 rounded-lg h-[46px] pl-[38px] pr-3 text-[15px] focus:bg-white focus:ring-1 focus:ring-black focus:border-black outline-none transition-all"
        {...props}
      />
    </div>
  </div>
);

const SelectWithIcon = ({ icon: Icon, required, label, options, ...props }: any) => (
  <div className="space-y-1.5 w-full">
    <label className="text-sm font-semibold text-gray-900">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
        <Icon className="w-[18px] h-[18px]" />
      </div>
      <select 
        className="w-full bg-[#fcfcfc] border border-gray-200 rounded-lg h-[46px] pl-[38px] pr-10 text-[15px] appearance-none focus:bg-white focus:ring-1 focus:ring-black focus:border-black outline-none transition-all"
        {...props}
      >
        {options.map((opt: any) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-500">
        <ChevronDown className="w-4 h-4" />
      </div>
    </div>
  </div>
);

export function CheckoutClient({ user }: { user: { displayName?: string; email?: string } }) {
  const router = useRouter();
  const { items, clearCart, updateQuantity } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [quote, setQuote] = useState<CheckoutQuote | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [quoteError, setQuoteError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("upi");
  
  const [address, setAddress] = useState<Partial<ShippingAddress>>({
    fullName: user.displayName || "",
    email: user.email || "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    stateOrProvince: "Maharashtra",
    postalCode: "",
    countryCode: "IN",
    isDefault: true
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && items.length > 0) {
      fetchQuote();
    }
  }, [mounted, items]);

  const fetchQuote = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/checkout/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      const data = await res.json();
      if (res.ok) {
        setQuote(data);
        setQuoteError(false);
      } else {
        toast.error("Cart items are invalid or no longer exist. Please clear your cart.");
        setQuoteError(true);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to connect to checkout service.");
      setQuoteError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.fullName || !address.addressLine1 || !address.city || !address.phone || !address.postalCode) {
      toast.warning("Please complete all required shipping fields.");
      return;
    }

    if (!quote) return;
    setIsSubmitting(true);
    
    const idempotencyKey = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          shippingAddress: address as ShippingAddress,
          idempotencyKey
        }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        toast.success("Order created successfully!");
        clearCart();
        router.push(data.checkoutUrl || `/payment/${data.orderId}`);
      } else {
        toast.error(data.error || "Failed to create order");
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error(error);
      toast.error("An unexpected error occurred");
      setIsSubmitting(false);
    }
  };

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className="min-h-[100dvh] bg-[#f8f9fb] flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
        <Link href="/products" className="bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition">Return to Shop</Link>
      </div>
    );
  }

  const formatINR = (minor: number) => "₹" + Math.round(minor / 100).toLocaleString("en-IN");

  return (
    <div className="min-h-[100dvh] bg-[#f8f9fb] text-gray-900 font-sans pb-24">
      {/* HEADER */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-1">
          <span className="font-extrabold text-2xl tracking-tighter">jojo</span>
          <span className="text-[10px] font-bold tracking-widest text-gray-400 mt-1 uppercase">Store</span>
        </Link>
        
        <div className="hidden md:flex items-center gap-4 text-sm font-medium text-gray-400">
          <div className="flex items-center gap-2 text-black">
            <span className="w-6 h-6 rounded-full bg-[#111827] text-white flex items-center justify-center text-xs">1</span>
            <span>Shipping</span>
          </div>
          <div className="w-10 h-[1px] bg-gray-300"></div>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-xs">2</span>
            <span>Payment</span>
          </div>
          <div className="w-10 h-[1px] bg-gray-300"></div>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-xs">3</span>
            <span>Review</span>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="hidden sm:flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1.5 rounded-md">
            <Lock className="w-4 h-4" />
            <div className="text-xs">
              <p className="font-bold leading-none mb-0.5">Secure Checkout</p>
              <p className="text-gray-500 font-medium leading-none">Your information is safe</p>
            </div>
          </div>
          <Link href="/cart" className="flex items-center gap-2 text-sm font-medium hover:text-gray-600 transition">
            <ArrowLeft className="w-4 h-4" />
            Back to Cart
          </Link>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-[1100px] mx-auto px-4 sm:px-6 pt-10 grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-8 items-start">
        
        {/* LEFT COLUMN */}
        <div className="space-y-6">
          <form id="checkout-form" onSubmit={handleCheckout} className="space-y-6">
            
            {/* SHIPPING ADDRESS CARD */}
            <div className="bg-white rounded-[16px] p-6 sm:p-8 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-800">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Shipping Address</h2>
                  <p className="text-sm text-gray-500 font-medium mt-0.5">Enter your delivery details</p>
                </div>
              </div>

              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <InputWithIcon 
                    icon={User} label="Full Name" required type="text" 
                    value={address.fullName} onChange={(e:any) => setAddress({...address, fullName: e.target.value})} 
                  />
                  <InputWithIcon 
                    icon={Phone} label="Phone Number" required type="tel" 
                    value={address.phone} onChange={(e:any) => setAddress({...address, phone: e.target.value})} 
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <InputWithIcon 
                    icon={MapPin} label="Email Address" required type="email" 
                    value={address.email} onChange={(e:any) => setAddress({...address, email: e.target.value})} 
                  />
                  <InputWithIcon 
                    icon={MapIcon} label="Address Line 1" required type="text" 
                    value={address.addressLine1} onChange={(e:any) => setAddress({...address, addressLine1: e.target.value})} 
                  />
                </div>

                <InputWithIcon 
                  icon={Building} label="Address Line 2 (Optional)" type="text" placeholder="Apartment, Suite, Floor, etc."
                  value={address.addressLine2} onChange={(e:any) => setAddress({...address, addressLine2: e.target.value})} 
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <InputWithIcon 
                    icon={Building2} label="City" required type="text" 
                    value={address.city} onChange={(e:any) => setAddress({...address, city: e.target.value})} 
                  />
                  <SelectWithIcon 
                    icon={MapIcon} label="State / Province" required 
                    value={address.stateOrProvince} onChange={(e:any) => setAddress({...address, stateOrProvince: e.target.value})}
                    options={[
                      {value: "Maharashtra", label: "Maharashtra"},
                      {value: "Delhi", label: "Delhi"},
                      {value: "Karnataka", label: "Karnataka"}
                    ]} 
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <InputWithIcon 
                    icon={Hash} label="Pincode / ZIP Code" required type="text" 
                    value={address.postalCode} onChange={(e:any) => setAddress({...address, postalCode: e.target.value})} 
                  />
                  <SelectWithIcon 
                    icon={Globe} label="Country" required 
                    value={address.countryCode} onChange={(e:any) => setAddress({...address, countryCode: e.target.value})}
                    options={[
                      {value: "IN", label: "India"},
                      {value: "US", label: "United States"}
                    ]} 
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <input type="checkbox" id="save-address" defaultChecked className="w-5 h-5 rounded border-gray-300 text-black focus:ring-black accent-black" />
                  <label htmlFor="save-address" className="text-sm font-medium text-gray-700">Save this address for future orders</label>
                </div>
              </div>
            </div>

            {/* PAYMENT METHOD CARD */}
            <div className="bg-white rounded-[16px] p-6 sm:p-8 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-800">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Payment Method</h2>
                  <p className="text-sm text-gray-500 font-medium mt-0.5">Choose your preferred payment method</p>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { id: "upi", icon: Smartphone, title: "UPI (Recommended)", desc: "Pay quickly using any UPI app" },
                  { id: "card", icon: CreditCard, title: "Credit / Debit Card", desc: "Visa, Mastercard, RuPay and more" },
                  { id: "netbanking", icon: Building2, title: "Net Banking", desc: "All major banks supported" },
                  { id: "cod", icon: Banknote, title: "Cash on Delivery", desc: "Pay when you receive your order" }
                ].map((method) => (
                  <div 
                    key={method.id} 
                    onClick={() => setPaymentMethod(method.id)}
                    className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === method.id ? "border-black bg-gray-50/50" : "border-gray-100 bg-white hover:bg-gray-50"}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === method.id ? "border-black" : "border-gray-300"}`}>
                        {paymentMethod === method.id && <div className="w-2.5 h-2.5 bg-black rounded-full" />}
                      </div>
                      <method.icon className="w-6 h-6 text-gray-700" />
                      <div>
                        <div className="font-bold text-gray-900">{method.title}</div>
                        <div className="text-xs text-gray-500 font-medium mt-0.5">{method.desc}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </form>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          
          {/* ORDER SUMMARY */}
          <div className="bg-white rounded-[16px] p-6 sm:p-8 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100 sticky top-24">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Package className="w-5 h-5" /> Order Summary <span className="text-gray-400 text-base font-medium">({items.length} item)</span>
              </h2>
              <Link href="/cart" className="text-sm font-semibold text-blue-600 hover:text-blue-700">Edit Cart</Link>
            </div>

            <div className="space-y-6 mb-6">
              {items.map((item) => (
                <div key={`${item.productId}-${item.variantId}`} className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden relative shrink-0">
                    {item.imagePath ? (
                      <Image src={item.imagePath} alt={item.productName || "Product"} fill sizes="80px" className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <Package className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-bold text-[15px] truncate">{item.productName}</h3>
                      <p className="font-bold whitespace-nowrap">{formatINR(item.priceMinor || 0)}</p>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{item.color} / {item.size}</p>
                    
                    <div className="flex items-center gap-3 mt-3 w-fit bg-gray-50 border border-gray-200 rounded-lg p-1">
                      <button type="button" onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)} className="w-7 h-7 flex items-center justify-center hover:bg-gray-200 rounded-md transition text-gray-600">
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                      <button type="button" onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)} className="w-7 h-7 flex items-center justify-center hover:bg-gray-200 rounded-md transition text-gray-600">
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-5 space-y-3">
              <div className="flex justify-between text-[15px] font-medium text-gray-600">
                <span>Subtotal</span>
                <span className="font-bold text-gray-900">{quote ? formatINR(quote.subtotalMinor) : "---"}</span>
              </div>
              <div className="flex justify-between text-[15px] font-medium text-gray-600">
                <span>Shipping <span className="text-xs text-gray-400 border border-gray-200 rounded-full w-4 h-4 inline-flex items-center justify-center ml-1">i</span></span>
                <span className="font-bold text-gray-900">{quote ? formatINR(quote.shippingMinor) : "---"}</span>
              </div>
              <div className="flex justify-between text-[15px] font-medium text-gray-600">
                <span>Discount</span>
                <span className="font-bold text-green-600">- {quote ? formatINR(quote.discountMinor) : "---"}</span>
              </div>
            </div>

            <div className="border-t border-gray-100 mt-5 pt-5 mb-6">
              <div className="flex justify-between items-end">
                <span className="text-xl font-bold">Total</span>
                <div className="text-right">
                  <span className="text-2xl font-black">{quote ? formatINR(quote.totalMinor) : "---"}</span>
                  <p className="text-green-600 text-xs font-bold mt-1">You save {quote ? formatINR(quote.discountMinor) : "---"}</p>
                </div>
              </div>
            </div>

            {quoteError && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-sm mb-4">
                <p className="font-semibold mb-2">Checkout Unavailable</p>
                <p className="mb-3">Some items in your cart no longer exist in the store catalog. You must clear your cart to proceed.</p>
                <button 
                  type="button"
                  onClick={() => { clearCart(); router.push("/products"); }}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors w-full"
                >
                  Clear Cart & Continue Shopping
                </button>
              </div>
            )}
            
            <button 
              type="button" 
              onClick={handleCheckout}
              disabled={isSubmitting || !quote}
              className="w-full bg-[#111827] text-white h-14 rounded-xl font-bold text-[17px] flex items-center justify-center gap-2 hover:bg-black transition-colors disabled:opacity-50"
            >
              {isSubmitting ? <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span> : <><Lock className="w-4 h-4" /> Place Order &rarr;</>}
            </button>

            <p className="text-center text-[11px] text-gray-500 font-medium mt-4">
              By placing the order, you agree to our <a href="#" className="underline">Terms & Conditions</a> and <a href="#" className="underline">Privacy Policy</a>.
            </p>
          </div>

          {/* TRUST BADGES */}
          <div className="bg-white rounded-[16px] p-6 sm:p-8 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-gray-100">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-6">
              <ShieldCheck className="w-5 h-5" /> Why Shop with Jojo?
            </h3>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center shrink-0">
                  <Lock className="w-5 h-5 text-gray-700" />
                </div>
                <div>
                  <h4 className="font-bold text-[13px] text-gray-900 leading-tight">Secure Payments</h4>
                  <p className="text-[11px] text-gray-500 mt-1 leading-tight">Your data is protected</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center shrink-0">
                  <Truck className="w-5 h-5 text-gray-700" />
                </div>
                <div>
                  <h4 className="font-bold text-[13px] text-gray-900 leading-tight">Fast Delivery</h4>
                  <p className="text-[11px] text-gray-500 mt-1 leading-tight">Quick & reliable shipping</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center shrink-0">
                  <RefreshCcw className="w-5 h-5 text-gray-700" />
                </div>
                <div>
                  <h4 className="font-bold text-[13px] text-gray-900 leading-tight">Easy Returns</h4>
                  <p className="text-[11px] text-gray-500 mt-1 leading-tight">Hassle-free returns</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center shrink-0">
                  <Headphones className="w-5 h-5 text-gray-700" />
                </div>
                <div>
                  <h4 className="font-bold text-[13px] text-gray-900 leading-tight">24/7 Support</h4>
                  <p className="text-[11px] text-gray-500 mt-1 leading-tight">We're here to help</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
