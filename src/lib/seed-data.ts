import type { Institution, Budget, User } from './types';

export const seedData = {
    sampleInstitution: {
        name: 'Clarity University',
    } as Omit<Institution, 'id'>,

    sampleReviewer: {
        name: 'Dr. Evelyn Reed',
        role: 'Reviewer',
    } as Omit<User, 'id' | 'institutionId' | 'email'>,
    
    sampleBudgets: [
        { title: 'Annual Library Fund', allocated: 500000, department: 'Library' },
        { title: 'University Sports Budget', allocated: 1200000, department: 'Sports' },
        { title: 'Campus Food Services', allocated: 800000, department: 'Food' },
        { title: 'Lab Equipment & Supplies', allocated: 2500000, department: 'Lab' },
        { title: 'Annual Tech Fest "Innovate"', allocated: 750000, department: 'Events' },
        { title: 'New Building Construction Phase 1', allocated: 50000000, department: 'Infrastructure & Construction' },
        { title: 'Faculty Development Programs', allocated: 600000, department: 'Academics' },
        { title: 'Administrative Overhead', allocated: 1500000, department: 'Administration' },
    ] as Omit<Budget, 'id' | 'institutionId'>[],
};
