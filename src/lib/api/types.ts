export type Product = {
    id: number;
    title: string;
    description: string;
    price: number;
    brand?: string;
    category: string;
    thumbnail: string;
    images: string[];
};

export type ProductListResponse = {
    products: Product[];
    total: number;
    skip: number;
    limit: number;
};

export type LoginResponse = {
    id: number;
    username: string;
    email: string;
    accessToken: string;
    refreshToken: string;
};

export type RefreshTokenResponse = {
    accessToken: string;
    refreshToken: string;
};