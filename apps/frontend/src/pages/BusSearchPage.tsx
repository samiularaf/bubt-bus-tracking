import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronRight } from 'lucide-react';
import { Card } from '../components/Card';
import { EmptyState } from '../components/EmptyState';
import { mockSearchBuses, type MockBus } from '../features/buses/api';

export default function BusSearchPage() {
  const [query, setQuery] = useState('');
  const [buses, setBuses] = useState<MockBus[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    mockSearchBuses(query).then((results) => {
      setBuses(results);
      setIsLoading(false);
    });
  }, [query]);

  return (
    <div className="px-4 pt-5">
      <h1 className="text-xl font-bold text-textPrimary mb-4">Track a bus</h1>

      <div className="flex items-center gap-2 bg-surface border border-border rounded-card px-4 h-11 mb-5">
        <Search size={16} className="text-textSecondary shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by bus name, route, or stop"
          className="flex-1 text-sm outline-none bg-transparent placeholder:text-textSecondary/60"
        />
      </div>

      {isLoading && <p className="text-sm text-textSecondary">Searching...</p>}

      {!isLoading && buses.length === 0 && (
        <EmptyState
          icon={<Search size={22} />}
          title="No buses found"
          description="Try a different bus name, route, or stop."
        />
      )}

      <div className="flex flex-col gap-3">
        {buses.map((bus) => (
          <Link key={bus.id} to={`/buses/${bus.id}`}>
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-textPrimary">{bus.busNumber}</h3>
                  <p className="text-xs text-textSecondary mt-1 line-clamp-1">{bus.routeName}</p>
                </div>
                <ChevronRight size={16} className="text-textSecondary shrink-0" />
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
