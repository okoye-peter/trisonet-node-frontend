export type Partner = {
    name?: string;
    email?: string;
    status?: boolean;
    activatedAt?: string | null;
    isUnitLeader?: boolean;
    createdAt?: string;
};

export type Wallet = {
    id?: number
    type: 'direct' | 'indirect' | 'central_treasury' | 'patronage';
    amount: number;
    createdAt?: string;
    updatedAt?: string;
    userId?: number
};

export interface Region {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    max: number;
}

export interface DashboardStats {
    totalSales: number;
    wallets: Wallet[];
    region: Region;
    regionTotalUsers: number;
    assetDepot: number;
}

export interface User {
    id: string;
    patronId: string | null;
    name: string;
    username: string;
    email: string;
    phone: string;
    pictureUrl: string | null;
    cloudinaryPublicId: string | null;
    regionId: string;
    role: number;
    accountState: number;
    country: string;
    emailVerificationCodeSentAt: string | null;
    emailVerifiedAt: string | null;
    status: boolean;
    bank: string | null;
    accountNumber: string | null;
    isInfant: boolean;
    birthDate: string | null;
    birthPlace: string | null;
    birthCertificate: string | null;
    lastSeen: string | null;
    activatedAt: string | null;
    isOnline: boolean;
    isSponsorAccount: boolean | null;
    accountActivationAcknowledgedAt: string | null;
    isUnitLeader: boolean;
    transferId: string | null;
    pimId: string | null;
    unblockingCode: string | null;
}

export interface UpdatePasswordRequest {
    currentPassword: string;
    password: string;
    confirmPassword: string;
}

export type VtuNetwork = 'MTN' | 'GLO' | 'AIRTEL' | '9MOBILE';

export interface VtuDataBundle {
    service_id: string;
    variation_id: number;
    service_name: string;
    data_plan: string;
    price: string;
    reseller_price: string;
    availability: string;
}

export interface VtuCablePackage {
    service_id: string;
    variation_id: number;
    service_name: string;
    package_bouquet: string;
    price: string;
    reseller_price: string;
    availability: string;
}

export interface VtuDataResponse {
    networks: string[];
    data_bundles: Record<string, VtuDataBundle[]>;
    wallets: Wallet[];
    packages: Record<string, VtuCablePackage[]>;
    providers: string[];
}

export interface BuyAirtimeRequest {
    amount: number;
    network: string;
    airtime_phone_no: string;
    airtime_wallet: string;
    withdrawal_pin: string;
}

export interface BuyDataRequest {
    data_bundle: string;
    data_network: string;
    data_phone_no: string;
    data_wallet: string;
    data_amount: number;
    withdrawal_pin: string;
}

export interface SubCableRequest {
    package: string;
    cabletv: string;
    dish_number: string;
    cable_amount: number;
    cable_wallet: string;
    withdrawal_pin: string;
}


export interface Bank {
    name: string;
    uuid: string;
    interInstitutionCode: string;
    sortCode: string;
    directDebitEnabled: boolean;
}

export interface BankAccountDetail {
    accountNumber: string;
    accountName: string;
    bankUUID: string;
    isValid: boolean;
}