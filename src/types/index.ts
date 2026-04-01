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
    type: 'direct' | 'indirect' | 'central_treasury' | 'patronage' | 'earning';
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
    createdAt: string;
    updatedAt: string;
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
    interInstitutionCode: string | null;
    sortCode: string | null;
    directDebitEnabled: boolean;
}

export interface BankAccountDetail {
    accountNumber: string;
    accountName: string;
    bankUUID: string;
    isValid: boolean;
}
export interface WardStats {
    wardSlotRemaining: number | 'unlimited';
    pricePerSlot: number;
    unlimitedSlotPrice: number;
}

export type Ward = User;

export interface PaginatedResult<T> {
    data: T[];
    meta: {
        totalItems: number;
        itemsPerPage: number;
        currentPage: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    };
}

export interface SchoolTerm {
    id: string;
    name: string;
}

export interface SchoolLevel {
    id: string;
    name: string;
}

export interface InfantSchoolFeeGroup {
    id: string;
    refNo: string;
    bank: string;
    accountNumber: string;
    user: {
        id: string;
        name: string;
        username: string;
        schoolUser?: {
            id: string;
            name: string;
        };
    };
}

export interface InfantSchoolFee {
    id: string;
    userId: string;
    amount: number;
    status: 'PENDING' | 'PAID' | 'REJECTED';
    accountNumber: string;
    bankName: string;
    schoolName: string;
    schoolClass: string;
    schoolTerm: string;
    createdAt: string;
    schoolTermRef?: SchoolTerm;
    schoolLevel?: SchoolLevel;
    infantSchoolFeeGroup?: InfantSchoolFeeGroup;
    user: {
        id: string;
        name: string;
        username: string;
    };
}

export interface WalletTransfer {
    id: string;
    senderWalletId: string;
    receiverWalletId: string;
    amount: number;
    reference: string | null;
    createdAt: string;
    updatedAt: string;
    senderWallet?: Wallet & {
        user: {
            id: string;
            name: string;
            transferId: string | null;
            pictureUrl: string | null;
        }
    };
    receiverWallet?: Wallet & {
        user: {
            id: string;
            name: string;
            transferId: string | null;
            pictureUrl: string | null;
        }
    };
}

export interface WithDrawal {
    id: string;
    userId: string | null;
    amount: string;
    bankName: string;
    accountNumber: string;
    isPaid: number;
    createdAt: string;
    updatedAt: string;
    oldBalance: string | null;
    newBalance: string | null;
    gkwthPrice: number | null;
    paystackRef: string | null;
    userType: 'customer' | 'admin' | string;
    userEmail: string | null;
    requestedAt: string | null;
    reference: string | null;
}

export interface EarningTransaction {
    id: number;
    amount: number;
    type: string;
    reference: string;
    walletId: number;
    narration: string;
    createdAt: string;
    updatedAt: string;
}

export interface WithdrawalRequest {
    id: string;
    amountRequested: number;
    amountToTransfer: number;
    walletId: string | null;
    oldBalance: string;
    newBalance: string;
    userType: 'customer' | 'sponsor' | 'influencer' | 'patron' | null;
    bankName: string;
    bankCode: string | null;
    accountNumber: string;
    gkwthAmount: number | null;
    gkwthValue: number | null;
    userEmail: string;
    status: 'pending' | 'being_processed';
    reference: string | null;
    createdAt: string;
    updatedAt: string;
}

export type WithdrawalRequestStatus = 'pending' | 'being_processed';

export type LoanStatus = 'pending' | 'granted' | 'rejected' | 'cancelled';

export interface Loan {
    id: string;
    userId: string;
    walletId: string | null;
    status: LoanStatus;
    cancellationReason: string | null;
    quantityRequested: number;
    quantityGranted: number;
    quantityRepaid: number;
    acceptedAt: string | null;
    rejectedAt: string | null;
    resolvedAt: string | null;
    createdAt: string;
    updatedAt: string;
    gkwthPrice: number | null;
    isPaid: boolean;
    wallet?: {
        type: Wallet['type'];
    };
}

export interface UpdateProfileRequest {
    name?: string;
    phone?: string;
}

export interface UpdateBankRequest {
    bank: string;
    accountNumber: string;
    currentPassword: string;
}
export interface Prize {
    id: string;
    name: string;
    url: string | null;
    type: 'awards' | string;
    position: number;
    location: string | null;
    createdAt?: string;
}

export interface UserAwards {
    rank: number;
    user: User;
    prizes: Prize[];
}
