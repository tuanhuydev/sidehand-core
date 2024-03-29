import { Meta, RootState } from 'scripts/utils/interfaces';
import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { useSelector } from 'react-redux';

const initialState: Meta = {
  openSidebar: true
};

export const metaSlice = createSlice({
  name: 'meta',
  initialState,
  reducers: {
    setOpenSidebar(state, action: PayloadAction<Meta>) {
      state.openSidebar = action.payload.openSidebar;
    }
  }
});

// Actions
export const { setOpenSidebar } = metaSlice.actions;

// Selectors
export const selectOpenSidebar = () => useSelector((state: RootState) => state.meta.openSidebar);

export default metaSlice.reducer;
