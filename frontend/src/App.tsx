import React from 'react';
import AppointmentBooking from './components/AppointmentBooking';
import './App.css';

const App: React.FC = () => {
  return (
    <div className="App">
      <div className="container">
        <AppointmentBooking />
      </div>
    </div>
  );
};

export default App;
