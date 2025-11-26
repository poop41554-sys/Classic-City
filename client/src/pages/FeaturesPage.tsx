import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { ProductCard } from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { usePurchase } from "@/hooks/usePurchase";
import { Zap } from "lucide-react";
import type { User, Product } from "@shared/schema";

interface FeaturesPageProps {
  user: User;
}

export default function FeaturesPage({ user }: FeaturesPageProps) {
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { purchaseMutation, handlePurchase } = usePurchase(user);

  const features = products?.filter(p => p.category === "features") || [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />

      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-purple-500/10 mb-4">
            <Zap className="w-10 h-10 text-purple-500" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4">المميزات</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            احصل على مميزات خاصة تجعل تجربتك في اللعبة أفضل
          </p>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[4/3] w-full" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        ) : features.length === 0 ? (
          <div className="text-center py-20">
            <Zap className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-2xl font-bold mb-2">لا توجد مميزات متوفرة</h3>
            <p className="text-muted-foreground">تحقق مرة أخرى لاحقاً</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((product) => (
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
    </div>
  );
}
