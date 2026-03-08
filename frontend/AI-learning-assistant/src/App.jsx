import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'; 
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoutes from './components/auth/ProtectedRoutes';
import DashboardPage from './pages/Dashboard/DashboardPage'
import DocumentListPage from './pages/Documents/DocumentListPage'
import DocumentDetailPage from './pages/Documents/DocumentDetailPage'
import FlashCardsListPage from './pages/Flashcards/FlashcardsListPage'
import FlashcardPage from './pages/Flashcards/FlashcardPage'
import QuizTakePage from './pages/Quizzes/QuizTakePage'
import QuizResultPage from './pages/Quizzes/QuizResultPage'
import ProfilePage from './pages/Profile/ProfilePage'
import { useAuth } from './context/AuthContext';

const App = () => {
  const { isAuthenticated, loading } = useAuth

  if(loading){
    return(
      <div className='flex items-center justify-center h-screen'> 
        <p>Loading...</p>
      </div>
    )
  }

  return(
    <BrowserRouter>
      <Routes>
        <Route 
          path="/"
          element = {isAuthenticated ? <Navigate to="/dashboard" replace/> : <Navigate to="/login" replace />}
        />
        <Route
          path='/login' 
          element = {<LoginPage/>}
        />
        <Route
          path='/register'
          element = {<RegisterPage/>}
        />

        {/* Protected Routes :  */}
        <Route element={<ProtectedRoutes/>}>
          <Route path='/dashboard' element={<DashboardPage/>}/>
          <Route path='/documents' element={<DocumentListPage/>}/>
          <Route path='/documents/:id' element={<DocumentDetailPage/>}/>
          <Route path='/flashcards' element={<FlashCardsListPage/>}/>
          <Route path='/documents/:id/flashcards' element={<FlashcardPage/>}/>
          <Route path='/quizzes/:quizId' element={<QuizTakePage/>}/>
          <Route path='/quizzes/:quizId/results' element={<QuizResultPage/>}/>
          <Route path='profile' element={<ProfilePage/>}/>
        </Route>

        <Route 
          path='*'
          element={<NotFoundPage/>}
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App


/*
yourapp.com/               -> Redirects based on login status
yourapp.com/login        -> LoginPage (public)
yourapp.com/register     -> RegisterPage (public)
yourapp.com/dashboard     -> DashboardPage (🔒 must be logged in)
yourapp.com/documents     -> DocumentListPage (🔒)
yourapp.com/documents/123 -> DocumentDetailPage (🔒) (123 = any doc ID)
yourapp.com/flashcards    -> FlashcardsListPage (🔒)
yourapp.com/documents/123/flashcards -> FlashcardPage (🔒)
yourapp.com/quizzes/456   -> QuizTakePage (🔒) (456 = any quiz ID)
yourapp.com/quizzes/456/results -> QuizResultPage (🔒)
yourapp.com/profile       -> ProfilePage (🔒)
yourapp.com/anything-else -> NotFoundPage
*/