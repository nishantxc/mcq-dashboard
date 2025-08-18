import { combineReducers, configureStore } from '@reduxjs/toolkit'
import userProfileReducer from './slices/userSlice'
import quizReducer from './slices/quizSlice'
import localStorage from 'redux-persist/lib/storage'
import { persistReducer, persistStore } from 'redux-persist'

const persistConfig = {
  key:'root',
  storage:localStorage,
  whitelist: ['userProfile'],
}

const rootReducer = combineReducers({
    userProfile: userProfileReducer,
    quiz: quizReducer,
})

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE']
      },
    }),
})

export const persistor = persistStore(store)

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>

// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch