import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePurchase } from "@/hooks/usePurchase";
import { Car, Zap, Crown, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import type { User, Product } from "@shared/schema";
import coinImage from "@assets/generated_images/gold_coin_icon.png";

interface HomePageProps {
  user: User;
}

export default function HomePage({ user }: HomePageProps) {
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { purchaseMutation, handlePurchase } = usePurchase(user);


  const featuredProducts = products?.filter(p => p.isFeatured || p.isNew).slice(0, 3) || [];

  const categories = [
    { id: "vehicles", name: "السيارات", icon: Car, href: "/vehicles", color: "from-blue-500 to-cyan-500" },
    { id: "features", name: "المميزات", icon: Zap, href: "/features", color: "from-purple-500 to-pink-500" },
    { id: "ownership", name: "الأونرات", icon: Crown, href: "/ownership", color: "from-amber-500 to-orange-500" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />

      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-gold/5"></div>
        <div className="container mx-auto text-center relative z-10">
          <h1 className="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-l from-primary via-gold to-primary bg-clip-text text-transparent leading-tight">
            Classic Offical Website
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            اشترِ أفضل السيارات والمميزات باستخدام الكوينات
          </p>
          
          {/* Stats */}
          <div className="flex flex-wrap items-center justify-center gap-8 mt-12">
            <div className="flex items-center gap-3">
              <img src={coinImage} alt="Coins" className="w-12 h-12 animate-pulse-glow" />
              <div className="text-right">
                <div className="font-mono font-black text-3xl text-white" data-testid="text-user-coins">
                  {user.coins ?? 0}
                </div>
                <div className="text-sm text-muted-foreground">رصيدك الحالي</div>
              </div>
            </div>

            <div className="h-12 w-px bg-border"></div>

            <div className="text-right">
              <div className="font-black text-3xl text-foreground">
                {products?.length || 0}
              </div>
              <div className="text-sm text-muted-foreground">منتج متوفر</div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">تصفح الأقسام</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Link key={category.id} href={category.href}>
                  <a data-testid={`link-category-${category.id}`}>
                    <div className="group relative overflow-hidden rounded-xl border-2 border-transparent hover:border-primary transition-all duration-300 hover-elevate">
                      <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-10 group-hover:opacity-20 transition-opacity`}></div>
                      <div className="relative p-8 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-background mb-4">
                          <Icon className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="text-2xl font-bold mb-2">{category.name}</h3>
                        <p className="text-muted-foreground mb-4">
                          {category.id === 'vehicles' && 'اختر من بين مجموعة السيارات الحصرية'}
                          {category.id === 'features' && 'احصل على مميزات خاصة لشخصيتك'}
                          {category.id === 'ownership' && 'تعرف علي أصحاب الخادم'}
                        </p>
                        <div className="flex items-center justify-center gap-2 text-primary font-medium">
                          <span>تصفح الآن</span>
                          <ArrowLeft className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </a>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-12 px-4 bg-muted/30">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">منتجات مميزة</h2>
            
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="aspect-[4/3] w-full" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    userCoins={user.coins}
                    onPurchase={handlePurchase}
                    isPurchasing={purchaseMutation.isPending}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
