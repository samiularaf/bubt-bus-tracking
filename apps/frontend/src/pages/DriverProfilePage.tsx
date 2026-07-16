import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, LogOut, Phone, Bus, Droplet } from 'lucide-react';
import { Avatar } from '../components/Avatar';
import { Card } from '../components/Card';
import { mockGetDriverContext, type DriverContext } from '../features/driver/api';

export default function DriverProfilePage() {
  const navigate = useNavigate();
  const [context, setContext] = useState<DriverContext | null>(null);

  useEffect(() => {
    mockGetDriverContext().then(setContext);
  }, []);

  if (!context) {
    return <p className="p-4 text-sm text-textSecondary">Loading...</p>;
  }

  return (
    <div className="px-4 pt-2 pb-6">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => navigate(-1)} aria-label="Back" className="text-textPrimary">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold text-textPrimary">Profile</h1>
      </div>

      <Card className="flex items-center gap-3 mb-4">
        <Avatar name={context.driverName} size={52} />
        <div>
          <h2 className="font-semibold text-textPrimary">{context.driverName}</h2>
          <p className="text-xs text-textSecondary">Assigned to {context.bus.busNumber}</p>
        </div>
      </Card>

      <div className="flex flex-col gap-2 mb-6">
        <Card className="flex items-center gap-3">
          <Bus size={18} className="text-textSecondary shrink-0" />
          <div>
            <p className="text-xs text-textSecondary">Route</p>
            <p className="text-sm text-textPrimary">{context.bus.routeName}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3">
          <Phone size={18} className="text-textSecondary shrink-0" />
          <div>
            <p className="text-xs text-textSecondary">Contact number</p>
            <p className="text-sm text-textPrimary">{context.bus.driverPhone}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3">
          <Droplet size={18} className="text-textSecondary shrink-0" />
          <div>
            <p className="text-xs text-textSecondary">Blood group</p>
            <p className="text-sm text-textPrimary">O+</p>
          </div>
        </Card>
      </div>

      <p className="text-xs text-textSecondary text-center mb-4">
        To update your profile details, contact your Transport Office Administrator.
      </p>

      <button
        onClick={() => navigate('/driver/login')}
        className="w-full flex items-center justify-center gap-2 text-sm font-medium text-danger py-3"
      >
        <LogOut size={16} />
        Log out
      </button>
    </div>
  );
}
