export type AuthStackParamList = {
  Login: undefined;
};

export type AppTabParamList = {
  Catalog: undefined;
  Favourites: undefined;
};

// CatalogStackParamList exists because the Catalog tab needs its own internal
// navigation: tapping a product in the list pushes the Detail screen on top,
// but Favourites and the tab bar itself should stay visible/unaffected.
// This is "nested navigation" — a stack living inside a tab. The alternative
// (putting Detail at the top level, outside the tabs, as a modal-style screen)
// would hide the tab bar when viewing a product, which changes the UX.
export type CatalogStackParamList = {
  CatalogList: undefined;
  Detail: { productId: number };
};