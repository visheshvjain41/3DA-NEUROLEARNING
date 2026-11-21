/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppDataProvider, useAppData } from './context/AppDataContext';
import { DemoLoginView } from './components/DemoLoginView';
import { LandingPage } from './components/LandingPage';
import { ParentPortal } from './components/parent/ParentPortal';
import { SchoolPortal } from './components/school/SchoolPortal';
import { StudentPortal } from './components/student/StudentPortal';

const AppRouter: React.FC = () => {
  const { route, activeRole } = useAppData();

  if (route === 'landing') {
    return <LandingPage />;
  }

  if (route === 'login') {
    return <DemoLoginView />;
  }

  if (activeRole === 'school') {
    return <SchoolPortal />;
  }

  if (activeRole === 'parent') {
    return <ParentPortal />;
  }

  return <StudentPortal />;
};

export default function App() {
  return (
    <AppDataProvider>
      <AppRouter />
    </AppDataProvider>
  );
}
