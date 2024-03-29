import { configureStore } from '@reduxjs/toolkit';
import accountSlice from './slices/accountSlice';
import createSagaMiddleware from 'redux-saga';
import metaSlice from './slices/metaSlice';
import rootSaga from './sagas/rootSaga';
import taskSlice from './slices/taskSlice';
import userSlice from './slices/userSlice';

// Define saga middleware
const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
  reducer: {
    user: userSlice,
    meta: metaSlice,
    task: taskSlice,
    account: accountSlice
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(sagaMiddleware)
});

// mounting middleware with store has to be after store definition
sagaMiddleware.run(rootSaga);
