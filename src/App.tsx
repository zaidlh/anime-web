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

export default function App() {
  return (
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
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
