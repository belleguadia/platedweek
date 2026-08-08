import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedLayout from './components/ProtectedLayout'
import Home from './pages/Home'
import Calendar from './pages/Calendar'
import DayView from './pages/DayView'
import DayGrocery from './pages/DayGrocery'
import MealDetail from './pages/MealDetail'
import CookView from './pages/CookView'
import RecipeLibrary from './pages/RecipeLibrary'
import RecipeView from './pages/RecipeView'
import Welcome from './pages/Welcome'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/welcome" element={<Welcome />} />
          <Route element={<ProtectedLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/day/:date/grocery" element={<DayGrocery />} />
            <Route path="/day/:date/meal/:mealId/cook" element={<CookView />} />
            <Route path="/day/:date/meal/:mealId" element={<MealDetail />} />
            <Route path="/day/:date/:mealType/new" element={<MealDetail />} />
            <Route path="/day/:date" element={<DayView />} />
            <Route path="/recipes/:recipeId" element={<RecipeView />} />
            <Route path="/recipes" element={<RecipeLibrary />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
