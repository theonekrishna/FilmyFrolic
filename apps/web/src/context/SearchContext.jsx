import { createContext, useContext, useState } from "react";

// ────────────── Search Context ──────────────
const SearchCtx = createContext({
  searchOpen: false,
  openSearch: () => {},
  closeSearch: () => {},
});

export function SearchProvider({ children }) {
  const [searchOpen, setSearchOpen] = useState(false);

  const openSearch = () => setSearchOpen(true);
  const closeSearch = () => setSearchOpen(false);

  return (
    <SearchCtx.Provider value={{ searchOpen, openSearch, closeSearch }}>
      {children}
    </SearchCtx.Provider>
  );
}

// ────────────── Custom Hook ──────────────
export function useMobileSearch() {
  return useContext(SearchCtx);
}
