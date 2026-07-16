import { Outlet } from 'react-router-dom';
import { BottomTabBar } from '../../../components/BottomTabBar';

export function UserLayout() {
  return (
    <div className="min-h-screen max-w-app mx-auto bg-background pb-20">
      <Outlet />
      <BottomTabBar />
    </div>
  );
}
