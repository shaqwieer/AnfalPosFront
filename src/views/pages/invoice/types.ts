export interface MenuItem {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    available: number;
    sold: number;
    category: 'appetizer' | 'main' | 'dessert' | 'beverage';
  }
  
  export interface OrderItem {
    menuItem: MenuItem;
    quantity: number;
  }
  
  export interface Order {
    id: string;
    customerName: string;
    status: 'cancelled' | 'ready' | 'waiting' | 'completed';
    time: string;
    table: string;
  }
  
  export interface Customer {
    id: string;
    name: string;
    address: string;
  }