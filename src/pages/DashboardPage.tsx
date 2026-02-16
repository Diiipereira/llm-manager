import { StatusCard } from '../components/dashboard/StatusCard';
import { ServiceButton } from '../components/dashboard/ServiceButton';
import { ModelInput } from '../components/dashboard/ModelInput';

export function DashboardPage() {
  return (
    <div className="flex flex-col items-center h-full w-full px-5 py-4 fade-in">
      <div className="flex flex-col items-center w-full max-w-sm flex-1">
        <div className="flex-1 flex flex-col justify-center w-full -mt-16">
          <StatusCard />

          <div className="mt-8 flex justify-center">
            <ServiceButton />
          </div>
        </div>
      </div>

      <div className="w-full max-w-sm pb-2">
        <ModelInput />
      </div>
    </div>
  );
}
