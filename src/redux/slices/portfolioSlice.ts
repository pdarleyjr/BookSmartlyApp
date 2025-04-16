import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface PortfolioState {
  selectedCategory: string;
  selectedImage: string | null;
}

const initialState: PortfolioState = {
  selectedCategory: 'portraits',
  selectedImage: null,
};

export const portfolioSlice = createSlice({
  name: 'portfolio',
  initialState,
  reducers: {
    setSelectedCategory: (state, action: PayloadAction<string>) => {
      state.selectedCategory = action.payload;
    },
    setSelectedImage: (state, action: PayloadAction<string | null>) => {
      state.selectedImage = action.payload;
    },
  },
});

export const { setSelectedCategory, setSelectedImage } = portfolioSlice.actions;

export default portfolioSlice.reducer;