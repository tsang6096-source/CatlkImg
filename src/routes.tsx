import type { ReactNode } from 'react';
import Home from './pages/Home';

interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
}

const routes: RouteConfig[] = [
  {
    name: 'CATLK - Image Compressor',
    path: '/',
    element: <Home />,
  },
];

export default routes;
