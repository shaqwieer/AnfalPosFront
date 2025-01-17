export interface MenuItem {
    id: string;
    barcode: string;
    name: string;
    price: number;
    image: string;
    totalStock: number;
    sapItem: string;
    sapPlant: string;
    itemGroup: string;
    isEmpty: boolean;
}
export interface Invoice {
    id?: string | null;
    customer: Customer;
    items: OrderItem[];
    total?: number | null;
    time?: string | null;
}

export interface OrderItem {
    id: string;
    itemName: string;
    finalDiscountAmount: number;
    existpercentage: number;
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
    name: string;
    address: string;
    email: string;
    primaryPhone: string;
    secondaryPhone: string;
    creditBalance: number;
    sapCustomer: string;
    vatNumber: string;
    isBusinessPartner: boolean;
}
