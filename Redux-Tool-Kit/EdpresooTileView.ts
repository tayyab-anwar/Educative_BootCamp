import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import shotTilesView from 'constants/tilesView';

const initialState = {
  currentTileView: shotTilesView.SHOT_DEFAULT,
};

const slice = createSlice({
  name: 'EdpresooTileView',
  initialState,
  reducers: {
    changeTileView(state, { payload }: PayloadAction<typeof initialState>) {
      console.log(state.currentTileView);
      //console.log(JSON.stringify(state));
      return { ...state, ...payload };
    },
  },
});

export default slice.reducer;
export const EdpresooTileViewActions = slice.actions;
