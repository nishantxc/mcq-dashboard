import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../../store/store'
import { User } from '../../types/types'
import { clear } from 'console';


const initialState: User = { 
  id: '',
  username: '', 
  avatar: '', 
  user_id: '', }

export const userProfileSlice = createSlice({
  name: 'userProfile',
  initialState,
  reducers: {
    adduserProfile: (state, action: PayloadAction<User>) => {
      return action.payload;
    },
    clearuserProfile: () => {
      return initialState;
    },
  },
});

export const { adduserProfile, clearuserProfile } = userProfileSlice.actions;

export default userProfileSlice.reducer;