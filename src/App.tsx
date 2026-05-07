/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Search from './pages/Search';
import Browse from './pages/Browse';
import TitleDetail from './pages/TitleDetail';
import Watch from './pages/Watch';
import Download from './pages/Download';
import About from './pages/About';
import MyList from './pages/MyList';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import DMCA from './pages/DMCA';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import NotFound from './pages/NotFound';

import { AuthProvider } from './lib/useAuth';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="search" element={<Search />} />
            <Route path="browse/:source" element={<Browse />} />
            <Route path="title/:source/:id" element={<TitleDetail />} />
            <Route path="watch/:source/:id/:episode" element={<Watch />} />
            <Route path="download/:source/:id" element={<Download />} />
            <Route path="about" element={<About />} />
            <Route path="mylist" element={<MyList />} />
            <Route path="settings" element={<Settings />} />
            <Route path="profile" element={<Profile />} />
            <Route path="dmca" element={<DMCA />} />
            <Route path="privacy" element={<Privacy />} />
            <Route path="terms" element={<Terms />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
