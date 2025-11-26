import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { SiDiscord } from "react-icons/si";
import { Loader2, KeyRound } from "lucide-react";
import type { User } from "@shared/schema";

export default function LoginPage() {
  const { toast } = useToast();
  const [code, setCode] = useState("");

  const loginMutation = useMutation({
    mutationFn: async (loginCode: string) => {
      return await apiRequest<User>("POST", "/api/auth/login-code", { code: loginCode });
    },
    onSuccess: (user) => {
      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: `مرحباً ${user.username}!`,
      });

      window.location.href = "/";
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "فشل تسجيل الدخول",
        description: (error as Error).message || "الكود غير صحيح أو منتهي الصلاحية",
      });
    },
  });

  const handleCodeLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "يرجى إدخال الكود",
      });
      return;
    }
    loginMutation.mutate(code);
  };

  const handleDiscordLogin = () => {
    window.location.href = "/api/auth/discord";
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-accent/20">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black mb-2 bg-gradient-to-l from-primary via-gold to-primary bg-clip-text text-transparent">
            Classic Offical Website
          </h1>
          <p className="text-muted-foreground text-lg">
            سجل دخولك للحصول على أفضل العروض
          </p>
        </div>

        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-2xl text-center">تسجيل الدخول</CardTitle>
            <CardDescription className="text-center">
              اختر طريقة تسجيل الدخول المفضلة
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="code" dir="rtl">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="code" data-testid="tab-code-login">
                  كود اللعبة
                </TabsTrigger>
                <TabsTrigger value="discord" data-testid="tab-discord-login">
                  ديسكورد
                </TabsTrigger>
              </TabsList>

              <TabsContent value="code" className="space-y-4 mt-6">
                <div className="text-center mb-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-3">
                    <KeyRound className="w-8 h-8 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    اكتب <span className="font-mono font-bold text-foreground">/website</span> في اللعبة للحصول على الكود
                  </p>
                </div>

                <form onSubmit={handleCodeLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="code">كود تسجيل الدخول</Label>
                    <Input
                      id="code"
                      type="text"
                      placeholder="أدخل الكود هنا..."
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      disabled={loginMutation.isPending}
                      className="text-center font-mono text-lg h-12"
                      data-testid="input-login-code"
                      autoFocus
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-12 text-lg"
                    disabled={loginMutation.isPending}
                    data-testid="button-submit-code"
                  >
                    {loginMutation.isPending ? (
                      <>
                        <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                        جاري التحقق...
                      </>
                    ) : (
                      "تسجيل الدخول"
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="discord" className="space-y-4 mt-6">
                <div className="text-center mb-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-discord/10 mb-3">
                    <SiDiscord className="w-8 h-8 text-discord" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    سجل دخولك بحسابك في ديسكورد
                  </p>
                </div>

                <Button
                  onClick={handleDiscordLogin}
                  className="w-full h-12 text-lg bg-discord hover:bg-discord/90 text-discord-foreground"
                  data-testid="button-discord-login"
                >
                  <SiDiscord className="ml-2 h-5 w-5" />
                  تسجيل الدخول بديسكورد
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  سيتم استخدام حسابك في ديسكورد لإدارة الكوينات والمشتريات
                </p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-card border">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-sm text-muted-foreground">اتصال آمن ومشفر</span>
          </div>
        </div>
      </div>
    </div>
  );
}
