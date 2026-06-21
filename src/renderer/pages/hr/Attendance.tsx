import { useState, useEffect } from 'react';
import api from '../../api/client';
import { PageHeader } from '../../components/PageHeader';
import toast from 'react-hot-toast';
import { Clock, LogIn, LogOut, Calendar } from 'lucide-react';

interface Employee {
  id: string;
  employee_code: string;
  full_name: string;
}

interface AttendanceRecord {
  id: string;
  employee_id: string;
  date: string;
  clock_in: string;
  clock_out: string;
  total_hours: number;
  employee_name?: string;
  employee_code?: string;
}

export function Attendance() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);
  const [clocking, setClocking] = useState<string | null>(null);

  useEffect(() => { loadEmployees(); }, []);
  useEffect(() => { loadAttendance(); }, [selectedEmployee, dateFrom, dateTo]);

  const loadEmployees = async () => {
    try {
      const res = await api.get('/hr/employees', { params: { status: 'active', limit: 100 } });
      setEmployees(res.data?.data || res.data || []);
    } catch (_) {
      setEmployees([]);
    }
  };

  const loadAttendance = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (selectedEmployee) params.employeeId = selectedEmployee;
      params.from = dateFrom;
      params.to = dateTo;
      const res = await api.get('/hr/attendance', { params });
      const data = res.data?.data || res.data || [];
      setRecords(Array.isArray(data) ? data : []);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to load attendance');
    } finally {
      setLoading(false);
    }
  };

  const clockIn = async (employeeId: string) => {
    setClocking(employeeId);
    try {
      await api.post('/hr/attendance', {
        employeeId,
        date: new Date().toISOString().split('T')[0],
        type: 'in',
      });
      toast.success('Clocked in successfully');
      loadAttendance();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to clock in');
    } finally {
      setClocking(null);
    }
  };

  const clockOut = async (employeeId: string) => {
    setClocking(employeeId);
    try {
      await api.post('/hr/attendance', {
        employeeId,
        date: new Date().toISOString().split('T')[0],
        type: 'out',
      });
      toast.success('Clocked out successfully');
      loadAttendance();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to clock out');
    } finally {
      setClocking(null);
    }
  };

  const getEmployeeName = (id: string) => {
    const emp = employees.find((e) => e.id === id);
    return emp ? `${emp.employee_code} - ${emp.full_name}` : id;
  };

  const formatTime = (t: string) => {
    if (!t) return '-';
    return new Date(t).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance"
        subtitle="Track employee clock-in/out and work hours"
      />

      {/* Quick clock buttons */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Clock In/Out</h3>
        <div className="flex flex-wrap gap-2">
          {employees.slice(0, 10).map((emp) => {
            const todayRecord = records.find(
              (r) => r.employee_id === emp.id && r.date?.startsWith(todayStr)
            );
            const hasClockedIn = !!todayRecord?.clock_in;
            const hasClockedOut = !!todayRecord?.clock_out;
            return (
              <div key={emp.id} className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2">
                <span className="text-sm font-medium text-gray-700">{emp.full_name}</span>
                {!hasClockedIn ? (
                  <button onClick={() => clockIn(emp.id)} disabled={clocking === emp.id}
                    className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg disabled:opacity-50" title="Clock In">
                    <LogIn className="w-4 h-4" />
                  </button>
                ) : !hasClockedOut ? (
                  <button onClick={() => clockOut(emp.id)} disabled={clocking === emp.id}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50" title="Clock Out">
                    <LogOut className="w-4 h-4" />
                  </button>
                ) : (
                  <span className="text-xs text-green-600 font-medium">Done</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-end gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
          <select value={selectedEmployee} onChange={(e) => setSelectedEmployee(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
            <option value="">All employees</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>{e.employee_code} - {e.full_name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
        </div>
      </div>

      {/* Attendance table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent mx-auto" />
          </div>
        ) : records.length === 0 ? (
          <div className="p-12 text-center">
            <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No attendance records found</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Employee</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Clock In</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Clock Out</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Hours</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {r.employee_name || getEmployeeName(r.employee_id)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{r.date}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{formatTime(r.clock_in)}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{formatTime(r.clock_out)}</td>
                  <td className="px-4 py-3 text-sm text-right text-gray-900">
                    {r.total_hours ? `${r.total_hours.toFixed(1)}h` : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
