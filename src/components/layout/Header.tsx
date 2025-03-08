
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, LineChart, Wallet, Menu, X } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { useCrypto } from '@/context/CryptoContext';
import { formatCurrency } from '@/utils/formatters';

const Header = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const { portfolioValue } = useCrypto();
  
  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Markets', href: '/markets', icon: LineChart },
    { name: 'Portfolio', href: '/#portfolio', icon: Wallet },
  ];
  
  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };
  
  const renderNavLinks = () => (
    <>
      {navigation.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.href);
        
        return (
          <Link to={item.href} key={item.name}>
            <Button
              variant={active ? 'default' : 'ghost'}
              className="justify-start"
              size={isMobile ? 'default' : 'sm'}
            >
              <Icon className="h-4 w-4 mr-2" />
              {item.name}
            </Button>
          </Link>
        );
      })}
    </>
  );
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-2 md:gap-4">
          <Link to="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl inline-block">
              Crypto<span className="text-primary">Dash</span>
            </span>
          </Link>
          
          {!isMobile && (
            <nav className="flex items-center gap-1 md:gap-2">
              {renderNavLinks()}
            </nav>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {portfolioValue > 0 && (
            <div className="hidden md:flex items-center mr-2 text-sm">
              <span className="text-muted-foreground mr-1">Portfolio:</span>
              <span className="font-medium">{formatCurrency(portfolioValue)}</span>
            </div>
          )}
          
          {isMobile && (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <div className="px-2 py-6">
                  <Link to="/" className="flex items-center gap-2 mb-8">
                    <span className="font-bold text-xl">
                      Crypto<span className="text-primary">Dash</span>
                    </span>
                  </Link>
                  <nav className="flex flex-col gap-2">
                    {renderNavLinks()}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
