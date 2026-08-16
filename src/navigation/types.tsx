import type { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  Login: undefined;
};

export type CatalogStackParamList = {
  CatalogList: undefined;
  Detail: { productId: number };
};

export type AppTabParamList = {
  Catalog: NavigatorScreenParams<CatalogStackParamList>;
  Favourites: undefined;
};