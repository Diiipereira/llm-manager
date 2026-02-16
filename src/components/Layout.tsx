import { Outlet } from 'react-router-dom';
import { TitleBar } from './TitleBar';
import { BottomNav } from './BottomNav';

export function Layout() {
  return (
    <div className="h-full flex flex-col bg-app overflow-hidden font-quicksand">
      <TitleBar />

      <main className="flex-1 overflow-hidden flex flex-col min-h-0">
        <Outlet />
      </main>

      <BottomNav />
    </div>
  );
}
