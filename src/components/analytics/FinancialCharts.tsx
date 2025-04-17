import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

type FinancialData = {
  id: string | number;
  name: string;
  revenue: number;
};

type FinancialAnalyticsData = {
  totalRevenue: number;
  byLocation: FinancialData[];
  byUser: FinancialData[];
  period: {
    startDate: string;
    endDate: string;
  };
};

/**
 * Revenue by Location Bar Chart
 */
export function RevenueByLocationChart({ data }: { data: FinancialData[] }) {
  // Sort data by revenue (descending)
  const sortedData = [...data].sort((a, b) => b.revenue - a.revenue);
  
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={sortedData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip 
          formatter={(value) => [`$${value}`, 'Revenue']}
          labelFormatter={(name) => `Location: ${name}`}
        />
        <Bar dataKey="revenue" fill="#0088FE" />
      </BarChart>
    </ResponsiveContainer>
  );
}

/**
 * Revenue by User Bar Chart
 */
export function RevenueByUserChart({ data }: { data: FinancialData[] }) {
  // Sort data by revenue (descending)
  const sortedData = [...data].sort((a, b) => b.revenue - a.revenue);
  
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={sortedData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip 
          formatter={(value) => [`$${value}`, 'Revenue']}
          labelFormatter={(name) => `User: ${name}`}
        />
        <Bar dataKey="revenue" fill="#00C49F" />
      </BarChart>
    </ResponsiveContainer>
  );
}

/**
 * Revenue Distribution Pie Chart
 */
export function RevenueDistributionChart({ data }: { data: FinancialData[] }) {
  // Filter out items with zero revenue
  const filteredData = data.filter(item => item.revenue > 0);
  
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={filteredData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={100}
          fill="#8884d8"
          dataKey="revenue"
          nameKey="name"
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
        >
          {filteredData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

/**
 * Financial Analytics Dashboard
 */
export function FinancialAnalyticsDashboard({ data }: { data: FinancialAnalyticsData }) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-2">Total Revenue</h3>
          <p className="text-3xl font-bold">${data.totalRevenue.toFixed(2)}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {data.period.startDate} - {data.period.endDate}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-2">Locations</h3>
          <p className="text-3xl font-bold">{data.byLocation.length}</p>
          <p className="text-sm text-muted-foreground mt-1">With revenue data</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-2">Users</h3>
          <p className="text-3xl font-bold">{data.byUser.length}</p>
          <p className="text-sm text-muted-foreground mt-1">With revenue data</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">Revenue by Location</h3>
        <RevenueByLocationChart data={data.byLocation} />
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">Revenue by User</h3>
        <RevenueByUserChart data={data.byUser} />
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">Revenue Distribution</h3>
        <RevenueDistributionChart data={[...data.byLocation]} />
      </div>
    </div>
  );
}