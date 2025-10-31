import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { User, Truck } from 'lucide-react';

const Navigation = () => {
  const location = useLocation();

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-card/80 backdrop-blur-lg border border-border/50 rounded-full px-6 py-3 shadow-elegant">
        <div className="flex items-center gap-4">
          <Button
            asChild
            variant={location.pathname === '/' ? 'default' : 'ghost'}
            size="sm"
            className={location.pathname === '/' ? 'bg-gradient-primary' : ''}
          >
            <Link to="/" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Customer
            </Link>
          </Button>
          <Button
            asChild
            variant={location.pathname === '/delivery' ? 'default' : 'ghost'}
            size="sm"
            className={location.pathname === '/delivery' ? 'bg-gradient-primary' : ''}
          >
            <Link to="/delivery" className="flex items-center gap-2">
              <Truck className="w-4 h-4" />
              Delivery
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Navigation;