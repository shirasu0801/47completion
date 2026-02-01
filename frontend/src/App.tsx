import { Routes, Route, NavLink } from 'react-router-dom'
import MapPage from './pages/MapPage'
import TripPlanPage from './pages/TripPlanPage'

function App() {
  return (
    <>
      <header className="header">
        <div className="container">
          <h1>47都道府県 旅行記録&計画</h1>
          <nav>
            <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>
              地図
            </NavLink>
            <NavLink to="/trips" className={({ isActive }) => isActive ? 'active' : ''}>
              旅行計画
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="container">
        <Routes>
          <Route path="/" element={<MapPage />} />
          <Route path="/trips" element={<TripPlanPage />} />
        </Routes>
      </main>
    </>
  )
}

export default App
