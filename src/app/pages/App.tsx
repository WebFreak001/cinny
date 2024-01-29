import React, { Suspense } from 'react';
import { Provider as JotaiProvider } from 'jotai';
import {
  Route,
  RouterProvider,
  createBrowserRouter,
  createHashRouter,
  createRoutesFromElements,
  redirect,
  useLoaderData,
} from 'react-router-dom';

import { ClientConfigLoader } from '../components/ClientConfigLoader';
import { ClientConfig, ClientConfigProvider } from '../hooks/useClientConfig';
import { AuthLayout, Login, Register, ResetPassword, authLayoutLoader } from './auth';
import { LOGIN_PATH, REGISTER_PATH, RESET_PASSWORD_PATH, ROOT_PATH } from './paths';
import { isAuthenticated } from '../../client/state/auth';
import Client from '../templates/client/Client';
import { getLoginPath } from './pathUtils';
import { ConfigConfigError, ConfigConfigLoading } from './ConfigConfig';
import { FeatureCheck } from './FeatureCheck';
import Welcome from '../organisms/welcome/Welcome';
import { RoomBaseView } from '../organisms/room/Room';
import ErrorPage from './Error';
import { Loading } from '../templates/client/Loading';
import initMatrix from '../../client/initMatrix';

const createRouter = (clientConfig: ClientConfig) => {
  const { hashRouter } = clientConfig;

  const routes = createRoutesFromElements(
    <Route errorElement={<ErrorPage />}>
      <Route
        path={ROOT_PATH}
        loader={() => {
          if (isAuthenticated()) return redirect('/home');
          return redirect(getLoginPath());
        }}
      />
      <Route loader={authLayoutLoader} element={<AuthLayout />}>
        <Route path={LOGIN_PATH} element={<Login />} />
        <Route path={REGISTER_PATH} element={<Register />} />
        <Route path={RESET_PASSWORD_PATH} element={<ResetPassword />} />
      </Route>

      <Route
        path="/"
        loader={() => {
          if (!isAuthenticated()) return redirect(getLoginPath());
          return null;
        }}
        element={<Suspense fallback={<Loading />}>
            <Client />
          </Suspense>}
        errorElement={<ErrorPage />}
      >
        <Route path="home" element={<Welcome />} />
        <Route
          path=":rId"
          loader={async ({ params }) => {
            const mx = await initMatrix.initAndLoad();

            let rId = params.rId;
            const r = mx.getRoom(rId);
            if (!r)
              return redirect('/home');
            return {
              room: r,
              eventId: null
            };
          }}
          element={<RoomBaseView />} />
        <Route
          path=":rId/:eventId"
          loader={async ({ params }) => {
            const mx = await initMatrix.initAndLoad();

            let rId = params.rId;
            let eventId = params.eventId;
            const r = mx.getRoom(rId);
            if (!r)
              return redirect('/home');
            return {
              room: r,
              eventId: eventId ?? null
            };
          }}
          element={<RoomBaseView />} />
        {/* <Route path="/direct" element={<p>direct</p>} />
        <Route path="/explore" element={<p>explore</p>} /> */}
      </Route>
    </Route>
  );

  if (hashRouter?.enabled) {
    return createHashRouter(routes, { basename: hashRouter.basename });
  }
  return createBrowserRouter(routes, {
    basename: import.meta.env.BASE_URL,
  });
};

// TODO: app crash boundary
function App() {
  return (
    <FeatureCheck>
      <ClientConfigLoader
        fallback={() => <ConfigConfigLoading />}
        error={(err, retry, ignore) => (
          <ConfigConfigError error={err} retry={retry} ignore={ignore} />
        )}
      >
        {(clientConfig) => (
          <ClientConfigProvider value={clientConfig}>
            <JotaiProvider>
              <RouterProvider router={createRouter(clientConfig)} />
            </JotaiProvider>
          </ClientConfigProvider>
        )}
      </ClientConfigLoader>
    </FeatureCheck>
  );
}

export default App;
