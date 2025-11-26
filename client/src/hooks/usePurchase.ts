import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { User } from "@shared/schema";

export function usePurchase(user: User) {
  const { toast } = useToast();

  const purchaseMutation = useMutation({
    mutationFn: async (productId: string) => {
      return await apiRequest<{ user: User; purchase: any }>("POST", "/api/purchases", {
        productId,
      });
    },
    onSuccess: (data) => {

      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/purchases"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      
      toast({
        title: "تم الشراء بنجاح",
        description: `تم خصم الكوينات من رصيدك. رصيدك الحالي: ${data.user.coins}`,
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "فشل الشراء",
        description: (error as Error).message || "حدث خطأ أثناء الشراء",
      });
    },
  });

  const handlePurchase = (productId: string) => {
    purchaseMutation.mutate(productId);
  };

  return { purchaseMutation, handlePurchase };
}
