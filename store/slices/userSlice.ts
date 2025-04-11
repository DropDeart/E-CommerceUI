import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  userId: string | null;
  userName: string | null;
  userMail: string | null;
}

const initialState: UserState = {
  userId: null,
  userName: null,
  userMail: null
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<{ userId: string; userName: string, userMail: string }>) => {
      state.userId = action.payload.userId;
      state.userName = action.payload.userName;
      state.userMail = action.payload.userMail
    },
    clearUser: (state) => {
      state.userId = null;
      state.userName = null;
      state.userMail = null;
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;

export default userSlice.reducer;