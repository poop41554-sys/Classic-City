import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Sparkles, AlertCircle } from "lucide-react";
import type { Product } from "@shared/schema";
import coinImage from "@assets/generated_images/gold_coin_icon.png";

interface ProductCardProps {
  product: Product;
  userCoins: number;
  onPurchase: (productId: string) => void;
  isPurchasing: boolean;
}

export function ProductCard({ product, userCoins, onPurchase, isPurchasing }: ProductCardProps) {
  const canAfford = userCoins >= product.price;
  const isAvailable = product.inStock;

  return (
    <Card 
      className="group hover-elevate overflow-hidden transition-all duration-300 h-full flex flex-col"
      data-testid={`card-product-${product.id}`}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={product.image}
          alt={product.name}
          className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        
        {/* Badges */}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          {product.isNew && (
            <Badge className="bg-primary text-primary-foreground shadow-lg">
              جديد
            </Badge>
          )}
          {product.isFeatured && (
            <Badge className="bg-gold text-gold-foreground shadow-lg">
              <Sparkles className="w-3 h-3 ml-1" />
              مميز
            </Badge>
          )}
          {!isAvailable && (
            <Badge variant="destructive" className="shadow-lg">
              نفذ
            </Badge>
          )}
        </div>
      </div>

      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-bold line-clamp-1">
          {product.name}
        </CardTitle>
        <CardDescription className="line-clamp-2 min-h-[2.5rem]">
          {product.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 pb-3">
        {/* Price Display */}
        <div className="flex items-center justify-center gap-2 p-4 rounded-lg bg-gold/10 border-2 border-gold/20">
          <img src={coinImage} alt="Coins" className="w-8 h-8" />
          <span className="font-mono font-black text-2xl text-white" data-testid={`text-price-${product.id}`}>
            {product.price}
          </span>
        </div>

        {/* Affordability Warning */}
        {!canAfford && isAvailable && (
          <div className="flex items-center gap-2 mt-3 text-sm text-destructive">
            <AlertCircle className="w-4 h-4" />
            <span>لا تملك كوينات كافية</span>
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Button
          onClick={() => onPurchase(product.id)}
          disabled={!canAfford || !isAvailable || isPurchasing}
          className="w-full h-11 text-base font-bold"
          variant={canAfford && isAvailable ? "default" : "secondary"}
          data-testid={`button-purchase-${product.id}`}
        >
          {!isAvailable ? (
            "غير متوفر"
          ) : isPurchasing ? (
            "جاري الشراء..."
          ) : (
            <>
              <ShoppingCart className="w-5 h-5 ml-2" />
              شراء الآن
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
