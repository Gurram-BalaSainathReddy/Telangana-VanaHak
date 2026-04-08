import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useSettings } from '@/lib/SettingsContext';
import { FileText, CheckCircle, XCircle, Clock, Trees, Users, Map, BarChart2, Bot, UserCog, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import StatCard from '../components/dashboard/StatCard';
import ClaimStatusChart from '../components/dashboard/ClaimStatusChart';
import DistrictBarChart from '../components/dashboard/DistrictBarChart';
import DistrictTable from '../components/dashboard/DistrictTable';

const NAV_ITEMS = [
  { label: 'Map View', path: '/MapView', icon: Map, color: 'bg-blue-50 text-blue-600 border-blue-100', desc: 'Interactive GIS map' },
  { label: 'Claims', path: '/Claims', icon: FileText, color: 'bg-green-50 text-green-600 border-green-100', desc: 'Manage FRA claims' },
  { label: 'Analytics', path: '/Analytics', icon: BarChart2, color: 'bg-purple-50 text-purple-600 border-purple-100', desc: 'Charts & insights' },
  { label: 'AI Assistant', path: '/AIAssistant', icon: Bot, color: 'bg-amber-50 text-amber-600 border-amber-100', desc: 'Ask questions about data' },
  { label: 'User Management', path: '/UserManagement', icon: UserCog, color: 'bg-rose-50 text-rose-600 border-rose-100', desc: 'Manage users & roles' },
];

export default function Dashboard() {
  const { settings } = useSettings();
  const refetchInterval = settings.autoRefresh ? 5 * 60 * 1000 : false;

  const { data: districts = [], isLoading: loadingDistricts } = useQuery({
    queryKey: ['districts'],
    queryFn: () => base44.entities.District.list(),
    refetchInterval,
  });

  const { data: claims = [], isLoading: loadingClaims } = useQuery({
    queryKey: ['claims'],
    queryFn: () => base44.entities.FRAClaim.list('-created_date', 500),
    refetchInterval,
  });

  const totalFiled = districts.reduce((s, d) => s + (d.total_claims_filed || 0), 0);
  const totalApproved = districts.reduce((s, d) => s + (d.claims_approved || 0), 0);
  const totalRejected = districts.reduce((s, d) => s + (d.claims_rejected || 0), 0);
  const totalPending = districts.reduce((s, d) => s + (d.claims_pending || 0), 0);
  const totalLand = districts.reduce((s, d) => s + (d.total_land_distributed_acres || 0), 0);
  const totalTribal = districts.reduce((s, d) => s + (d.tribal_population || 0), 0);

  const isLoading = loadingDistricts || loadingClaims;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">FRA Implementation Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Forest Rights Act monitoring across Telangana state
        </p>
      </div>

      {/* Quick Navigation */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {NAV_ITEMS.map(({ label, path, icon: Icon, color, desc }) => (
          <Link
            key={path}
            to={path}
            className={`flex items-center gap-3 p-4 rounded-xl border bg-card hover:shadow-md transition-all group`}
          >
            <div className={`w-9 h-9 rounded-lg border flex items-center justify-center flex-shrink-0 ${color}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{label}</p>
              <p className="text-xs text-muted-foreground truncate">{desc}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <StatCard title="Total Claims" value={totalFiled.toLocaleString()} icon={FileText} trend="12.5%" trendUp />
            <StatCard title="Approved" value={totalApproved.toLocaleString()} icon={CheckCircle} subtitle={`${totalFiled > 0 ? ((totalApproved / totalFiled) * 100).toFixed(1) : 0}% rate`} />
            <StatCard title="Rejected" value={totalRejected.toLocaleString()} icon={XCircle} />
            <StatCard title="Pending" value={totalPending.toLocaleString()} icon={Clock} />
            <StatCard title="Land Distributed" value={`${totalLand.toLocaleString()} ac`} icon={Trees} />
            <StatCard title="Tribal Pop." value={totalTribal.toLocaleString()} icon={Users} />
          </div>

          {/* Charts Row */}
          <div className="grid lg:grid-cols-5 gap-6">
            <div className="lg:col-span-2 bg-card rounded-xl border border-border p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4">Claim Status Distribution</h3>
              <ClaimStatusChart claims={claims} />
            </div>
            <div className="lg:col-span-3 bg-card rounded-xl border border-border p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4">District-wise Claims</h3>
              <DistrictBarChart districts={districts} />
            </div>
          </div>

          {/* District Table */}
          <div className="bg-card rounded-xl border border-border">
            <div className="p-5 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground">District Performance</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Detailed breakdown by district</p>
            </div>
            <DistrictTable districts={districts} />
          </div>
        </>
      )}
    </div>
  );
}