// ============================================================
// Timetable.jsx
// ============================================================
import React, { useState, useEffect } from 'react';
import { Plus, Calendar } from 'lucide-react';
import { timetableAPI, departmentsAPI } from '../../api';
import { PageHeader, Card, Select, Button, Badge, Modal, Input, Textarea } from '../../components/ui';
import toast from 'react-hot-toast';

const DAYS = ['monday','tuesday','wednesday','thursday','friday','saturday'];
const COLORS = ['bg-blue-100 text-blue-800 border-blue-200','bg-emerald-100 text-emerald-800 border-emerald-200','bg-purple-100 text-purple-800 border-purple-200','bg-orange-100 text-orange-800 border-orange-200','bg-teal-100 text-teal-800 border-teal-200','bg-pink-100 text-pink-800 border-pink-200'];

export function Timetable() {
  const [timetable, setTimetable] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [filters, setFilters] = useState({ department: '', semester: '', section: '' });
  const [activeDay, setActiveDay] = useState('monday');
  const [loading, setLoading] = useState(false);

  useEffect(() => { departmentsAPI.getAll().then(({ data }) => setDepartments(data.data)).catch(() => {}); }, []);

  useEffect(() => {
    if (!filters.department || !filters.semester) return;
    setLoading(true);
    timetableAPI.get({ ...filters, day: activeDay })
      .then(({ data }) => setTimetable(data.data))
      .catch(() => setTimetable([]))
      .finally(() => setLoading(false));
  }, [filters, activeDay]);

  const dayData = timetable.find(t => t.day === activeDay);

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title="Timetable" subtitle="View and manage class schedules" breadcrumb="Home / Timetable"
        actions={<Button icon={Plus}>Add Schedule</Button>}
      />
      <div className="p-6 space-y-5">
        <Card>
          <div className="flex flex-wrap gap-3 mb-5">
            <Select value={filters.department} onChange={e => setFilters(f => ({ ...f, department: e.target.value }))} className="w-48">
              <option value="">Select Department</option>
              {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
            </Select>
            <Select value={filters.semester} onChange={e => setFilters(f => ({ ...f, semester: e.target.value }))} className="w-32">
              <option value="">Semester</option>
              {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Sem {s}</option>)}
            </Select>
            <Select value={filters.section} onChange={e => setFilters(f => ({ ...f, section: e.target.value }))} className="w-28">
              <option value="">All Sec</option>
              {['A','B','C','D'].map(s => <option key={s} value={s}>Sec {s}</option>)}
            </Select>
          </div>

          {/* Day tabs */}
          <div className="flex gap-1 mb-5 overflow-x-auto pb-1">
            {DAYS.map(day => (
              <button key={day} onClick={() => setActiveDay(day)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-colors whitespace-nowrap ${activeDay === day ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {day.slice(0,3).toUpperCase()}
              </button>
            ))}
          </div>

          {/* Periods */}
          {!filters.department || !filters.semester ? (
            <div className="flex flex-col items-center py-12 text-gray-400">
              <Calendar size={40} strokeWidth={1} className="mb-3 text-gray-300" />
              <p>Select department and semester to view timetable</p>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center py-12"><div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>
          ) : dayData?.periods?.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dayData.periods.map((p, i) => (
                <div key={i} className={`border rounded-xl p-4 ${COLORS[i % COLORS.length]}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider opacity-60">Period {p.periodNo}</span>
                    <Badge variant={p.type === 'lab' ? 'purple' : 'primary'} size="xs">{p.type}</Badge>
                  </div>
                  <p className="font-bold text-base">{p.subject?.name || 'Free Period'}</p>
                  <p className="text-xs mt-1 opacity-70">{p.teacher?.name || '—'}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs font-semibold">{p.startTime} – {p.endTime}</span>
                    {p.room && <span className="text-xs opacity-60">📍 {p.room}</span>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <p>No schedule for {activeDay.charAt(0).toUpperCase() + activeDay.slice(1)}</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

export default Timetable;