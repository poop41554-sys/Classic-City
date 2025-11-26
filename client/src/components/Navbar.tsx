import { Link, useLocation } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { LogOut, User as UserIcon, Shield, Coins as CoinsIcon } from "lucide-react";
import { logout } from "@/lib/auth";
import type { User } from "@shared/schema";
import coinImage from "@assets/generated_images/gold_coin_icon.png";

interface NavbarProps {
  user: User;
}

export function Navbar({ user }: NavbarProps) {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "الرئيسية" },
    { href: "/vehicles", label: "السيارات" },
    { href: "/features", label: "المميزات" },
    { href: "/ownership", label: "الأونرات" },
    ...(user.isAdmin ? [{ href: "/admin", label: "لوحة التحكم" }] : []),
  ];

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo & Title */}
          <Link href="/">
            <a className="flex items-center gap-3 hover-elevate rounded-lg px-3 py-2 transition-all" data-testid="link-home">
              <div className="text-2xl font-black bg-gradient-to-l from-primary via-gold to-primary bg-clip-text text-transparent">
                MTA:SA
              </div>
            </a>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-2">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <a data-testid={`link-${item.href.slice(1) || 'home'}`}>
                  <Button
                    variant={location === item.href ? "secondary" : "ghost"}
                    size="sm"
                    className="font-medium"
                  >
                    {item.label}
                  </Button>
                </a>
              </Link>
            ))}
          </div>

          {/* User Section */}
          <div className="flex items-center gap-3">
            {/* Coins Display */}
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg bg-gold/10 border-2 border-gold/20">
              <img src={coinImage} alt="Coins" className="w-6 h-6" />
              <span className="font-mono font-bold text-lg text-white" data-testid="text-coin-balance">
                {user.coins}
              </span>
            </div>

            {/* User Menu */}
            <DropdownMenu dir="rtl">
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full" data-testid="button-user-menu">
                  <Avatar className="h-9 w-9">
                    {user.discordAvatar && (
                      <AvatarImage
                        src={`https://cdn.discordapp.com/avatars/${user.discordId}/${user.discordAvatar}.png`}
                        alt={user.username}
                      />
                    )}
                    <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                      {user.username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col gap-1">
                    <div className="font-bold text-base">{user.username}</div>
                    {user.discordUsername && (
                      <div className="text-xs text-muted-foreground font-normal">
                        {user.discordUsername}
                      </div>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                <div className="px-2 py-2 sm:hidden">
                  <div className="flex items-center gap-2 text-sm">
                    <CoinsIcon className="w-4 h-4 text-gold" />
                    <span className="font-mono font-bold text-white">
                      {user.coins}
                    </span>
                    <span className="text-muted-foreground">كوين</span>
                  </div>
                </div>
                <DropdownMenuSeparator className="sm:hidden" />

                <Link href="/purchases">
                  <DropdownMenuItem data-testid="link-purchases">
                    <UserIcon className="ml-2 h-4 w-4" />
                    <span>مشترياتي</span>
                  </DropdownMenuItem>
                </Link>

                {user.isAdmin && (
                  <Link href="/admin">
                    <DropdownMenuItem data-testid="link-admin">
                      <Shield className="ml-2 h-4 w-4" />
                      <span>لوحة التحكم</span>
                    </DropdownMenuItem>
                  </Link>
                )}

                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive" data-testid="button-logout">
                  <LogOut className="ml-2 h-4 w-4" />
                  <span>تسجيل الخروج</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}
