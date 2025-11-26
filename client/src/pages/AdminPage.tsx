import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Shield, Users, Coins as CoinsIcon, Plus, Minus, Search } from "lucide-react";
import type { User as UserType } from "@shared/schema";

interface AdminPageProps {
  user: UserType;
}

export default function AdminPage({ user: currentUser }: AdminPageProps) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [coinsAmount, setCoinsAmount] = useState<number>(100);

  const { data: users, isLoading } = useQuery<UserType[]>({
    queryKey: ["/api/admin/users"],
  });

  const updateCoinsMutation = useMutation({
    mutationFn: async ({ userId, amount }: { userId: string; amount: number }) => {
      return await apiRequest("POST", "/api/admin/coins", { userId, amount });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "تم تحديث الكوينات بنجاح",
        description: "تم تحديث رصيد المستخدم",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "فشل التحديث",
        description: error.message,
      });
    },
  });

  const filteredUsers = users?.filter(u =>
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.discordUsername?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleAddCoins = () => {
    if (!selectedUser) return;
    updateCoinsMutation.mutate({
      userId: selectedUser.id,
      amount: coinsAmount,
    });
  };

  const handleRemoveCoins = () => {
    if (!selectedUser) return;
    updateCoinsMutation.mutate({
      userId: selectedUser.id,
      amount: -coinsAmount,
    });
  };

  if (!currentUser.isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar user={currentUser} />
        <div className="container mx-auto px-4 py-20 text-center">
          <Shield className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-3xl font-bold mb-2">غير مصرح</h1>
          <p className="text-muted-foreground">ليس لديك صلاحية الوصول لهذه الصفحة</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={currentUser} />

      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-destructive/10 mb-4">
            <Shield className="w-10 h-10 text-destructive" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4">لوحة التحكم</h1>
          <p className="text-xl text-muted-foreground">
            إدارة المستخدمين والكوينات
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
          {/* Users List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                المستخدمين
              </CardTitle>
              <CardDescription>
                اختر مستخدم لتعديل رصيده
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="ابحث عن مستخدم..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                  data-testid="input-search-users"
                />
              </div>

              {/* Users List */}
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {isLoading ? (
                  [1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))
                ) : filteredUsers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    لا يوجد مستخدمين
                  </div>
                ) : (
                  filteredUsers.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => setSelectedUser(u)}
                      className={`w-full p-3 rounded-lg border-2 text-right transition-all hover-elevate ${
                        selectedUser?.id === u.id
                          ? "border-primary bg-primary/5"
                          : "border-transparent bg-card"
                      }`}
                      data-testid={`button-select-user-${u.id}`}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          {u.discordAvatar && (
                            <AvatarImage
                              src={`https://cdn.discordapp.com/avatars/${u.discordId}/${u.discordAvatar}.png`}
                              alt={u.username}
                            />
                          )}
                          <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                            {u.username.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold truncate">{u.username}</div>
                          {u.discordUsername && (
                            <div className="text-xs text-muted-foreground truncate">
                              {u.discordUsername}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <CoinsIcon className="w-4 h-4 text-gold" />
                          <span className="font-mono font-bold text-sm">
                            {u.coins}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Coin Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CoinsIcon className="w-5 h-5 text-gold" />
                إدارة الكوينات
              </CardTitle>
              <CardDescription>
                {selectedUser
                  ? `تعديل رصيد ${selectedUser.username}`
                  : "اختر مستخدم للبدء"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {selectedUser ? (
                <>
                  {/* Current Balance */}
                  <div className="p-6 rounded-lg bg-muted text-center">
                    <div className="text-sm text-muted-foreground mb-2">
                      الرصيد الحالي
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <CoinsIcon className="w-8 h-8 text-gold" />
                      <span className="font-mono font-black text-4xl text-gold-foreground" data-testid="text-selected-user-coins">
                        {selectedUser.coins}
                      </span>
                    </div>
                  </div>

                  {/* Amount Input */}
                  <div className="space-y-2">
                    <Label htmlFor="coins-amount">الكمية</Label>
                    <Input
                      id="coins-amount"
                      type="number"
                      min="1"
                      value={coinsAmount}
                      onChange={(e) => setCoinsAmount(parseInt(e.target.value) || 0)}
                      className="text-center font-mono text-lg"
                      data-testid="input-coins-amount"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      onClick={handleAddCoins}
                      disabled={updateCoinsMutation.isPending || coinsAmount <= 0}
                      className="h-12"
                      data-testid="button-add-coins"
                    >
                      <Plus className="w-5 h-5 ml-2" />
                      إضافة
                    </Button>
                    <Button
                      onClick={handleRemoveCoins}
                      disabled={updateCoinsMutation.isPending || coinsAmount <= 0}
                      variant="destructive"
                      className="h-12"
                      data-testid="button-remove-coins"
                    >
                      <Minus className="w-5 h-5 ml-2" />
                      خصم
                    </Button>
                  </div>

                  {/* User Info */}
                  <div className="pt-4 border-t space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">اسم المستخدم:</span>
                      <span className="font-medium">{selectedUser.username}</span>
                    </div>
                    {selectedUser.discordUsername && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">ديسكورد:</span>
                        <span className="font-medium">{selectedUser.discordUsername}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">نوع الحساب:</span>
                      {selectedUser.isAdmin ? (
                        <Badge variant="destructive">مدير</Badge>
                      ) : (
                        <Badge variant="outline">مستخدم</Badge>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-20 text-center text-muted-foreground">
                  <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>اختر مستخدم من القائمة</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
