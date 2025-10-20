export interface ProfileModel {
    id: string;
    created_at: string;
    updated_at: string;
    passwordHash: string | null;
    avatar_url: string | null;
    email: string;
    full_name: string;
    phone: string | null;
    role: string;
    account_status: 'ACTIVE' | 'LOCKED';
}