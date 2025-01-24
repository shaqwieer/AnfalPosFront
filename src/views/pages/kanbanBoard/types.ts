export interface Technician {
    id: string;
    name: string;
    avatar: string;
    initials: string;
    color: string;
}

export interface ServiceArea {
    id: string;
    name: string;
    description: string;
}

export interface Service {
    name: string;
    status: 'pending' | 'in_progress' | 'completed';
    startTime?: string;
    endTime?: string;
    technicians: Technician[];
    serviceArea?: ServiceArea;
}

export interface ServiceCard {
    id: string;
    customer: string;
    plate: string;
    vehicle: string;
    expectedCompletion: string;
    services: Service[];
    priority: 'urgent' | 'medium' | 'low';
    timeSpent: string;
    status: string;
    amount: string;
    progress: string;
    flags?: string;
    assignees?: string;
    technicians: Technician[];
}

export interface Column {
    title: string;
    items: ServiceCard[];
    color: string;
}
export interface Technician {
    id: string;
    name: string;
    avatar: string;
    initials: string;
    color: string;
}

export interface ServiceArea {
    id: string;
    name: string;
    description: string;
}

export interface Service {
    name: string;
    status: 'pending' | 'in_progress' | 'completed';
    startTime?: string;
    endTime?: string;
    technicians: Technician[];
    serviceArea?: ServiceArea;
}

export interface ServiceCard {
    id: string;
    customer: string;
    plate: string;
    vehicle: string;
    expectedCompletion: string;
    services: Service[];
    priority: 'urgent' | 'medium' | 'low';
    timeSpent: string;
    status: string;
    amount: string;
    progress: string;
    flags?: string;
    assignees?: string;
    technicians: Technician[];
}

export interface Column {
    title: string;
    items: ServiceCard[];
    color: string;
}