import React, { useState, useEffect } from 'react';
import { CreditCard, Download, Printer, Search } from 'lucide-react';
import { studentsAPI, teachersAPI, departmentsAPI } from '../../api';
import { PageHeader, Card, SearchBar, Select, Button, Badge, Modal } from '../../components/ui';
import toast from 'react-hot-toast';

const COLLEGE = { name: 'Skiller College of Engineering', short: 'SCET', year: '2024-25', address: 'Indore, Madhya Pradesh - 452001', phone: '+91-731-XXXXXXX', website: 'www.skillertech.edu.in' };

function StudentIDCard({ student, dept }) {
  const initials = student?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div style={{ width: 340, fontFamily: 'sans-serif' }} id="id-card-print">
      {/* Card */}
      <div style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', border: '2px solid #1D4ED8', boxShadow: '0 8px 32px rgba(29,78,216,0.15)' }}>
        {/* Header strip */}
        <div style={{ background: 'linear-gradient(135deg, #1D4ED8, #1E40AF)', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ color: '#fff', fontWeight: 800, fontSize: 13, letterSpacing: 0.5 }}>{COLLEGE.name}</div>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 10, marginTop: 2 }}>STUDENT IDENTITY CARD</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 8, padding: '6px 10px', border: '1px solid rgba(255,255,255,0.3)' }}>
            <span style={{ color: '#fff', fontWeight: 800, fontSize: 16 }}>{COLLEGE.short}</span>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '16px 20px', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
          {/* Photo */}
          <div style={{ flexShrink: 0 }}>
            <div style={{ width: 80, height: 96, background: '#1D4ED8', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid #BFDBFE' }}>
              <span style={{ color: '#fff', fontSize: 24, fontWeight: 800 }}>{initials}</span>
            </div>
          </div>
          {/* Info */}
          <div style={{ flex: 1, fontSize: 12 }}>
            <div style={{ fontWeight: 800, fontSize: 15, color: '#0F172A', marginBottom: 6 }}>{student?.name}</div>
            {[
              ['Roll No', student?.rollNo],
              ['Course', student?.course || 'B.Tech'],
              ['Department', dept?.name || student?.department?.name],
              ['Semester', `${student?.semester}th Sem`],
              ['Section', student?.section || '—'],
            ].map(([l, v]) => (
              <div key={l} style={{ display: 'flex', marginBottom: 3 }}>
                <span style={{ color: '#64748B', width: 80, flexShrink: 0 }}>{l}:</span>
                <span style={{ color: '#1E293B', fontWeight: 600 }}>{v}</span>
              </div>
            ))}
            <div style={{ marginTop: 8, padding: '4px 10px', background: '#EFF6FF', borderRadius: 20, display: 'inline-block', border: '1px solid #BFDBFE' }}>
              <span style={{ color: '#1D4ED8', fontWeight: 700, fontSize: 11 }}>Valid: {COLLEGE.year}</span>
            </div>
          </div>
        </div>

        {/* QR + bottom */}
        <div style={{ borderTop: '1px solid #E2E8F0', padding: '10px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC' }}>
          {/* QR */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8,6px)', gap: 1 }}>
            {Array.from({ length: 64 }, (_, i) => (
              <div key={i} style={{ width: 6, height: 6, borderRadius: 1, background: Math.random() > 0.45 ? '#1D4ED8' : '#EFF6FF' }} />
            ))}
          </div>
          <div style={{ textAlign: 'right', fontSize: 10, color: '#64748B' }}>
            <div style={{ fontWeight: 700 }}>{COLLEGE.website}</div>
            <div>{COLLEGE.phone}</div>
            <div style={{ marginTop: 4, color: '#94A3B8' }}>{COLLEGE.address}</div>
          </div>
        </div>

        {/* Emergency strip */}
        <div style={{ background: '#1D4ED8', padding: '6px 16px', display: 'flex', justifyContent: 'space-between', fontSize: 9, color: 'rgba(255,255,255,0.75)' }}>
          <span>If found, please return to: {COLLEGE.name}</span>
          <span>{COLLEGE.phone}</span>
        </div>
      </div>
    </div>
  );
}

export default function DigitalIDCard() {
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [semFilter, setSemFilter] = useState('');
  const [selected, setSelected] = useState(null);
  const [showBulk, setShowBulk] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => { departmentsAPI.getAll().then(({ data }) => setDepartments(data.data)).catch(() => {}); }, []);

  const searchStudents = async q => {
    if (q.length < 2) return setStudents([]);
    try { const { data } = await studentsAPI.getAll({ search: q, limit: 10 }); setStudents(data.data); } catch {}
  };

  const loadBulk = async () => {
    setLoading(true);
    try {
      const params = { limit: 50 };
      if (deptFilter) params.department = deptFilter;
      if (semFilter) params.semester = semFilter;
      const { data } = await studentsAPI.getAll(params);
      setStudents(data.data);
      setShowBulk(true);
    } catch { toast.error('Failed'); }
    finally { setLoading(false); }
  };

  const selectedDept = departments.find(d => d._id === (selected?.department?._id || selected?.department));

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title="Digital ID Card" subtitle="Generate and print student identity cards" breadcrumb="Home / Students / ID Card"
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={loadBulk} loading={loading}>Bulk Generate</Button>
            {selected && <Button icon={Printer} onClick={() => window.print()}>Print</Button>}
            {selected && <Button icon={Download}>Download</Button>}
          </div>
        }
      />
      <div className="p-6 space-y-5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left - Search */}
          <div className="space-y-4">
            <Card>
              <h3 className="text-sm font-bold text-gray-700 mb-3">Search Individual Student</h3>
              <div className="relative">
                <SearchBar value={search} onChange={v => { setSearch(v); searchStudents(v); setSelected(null); }} placeholder="Search student by name or roll no..." />
                {students.length > 0 && !selected && (
                  <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
                    {students.map(s => (
                      <button key={s._id} onClick={() => { setSelected(s); setStudents([]); setSearch(s.name); }}
                        className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-gray-50 last:border-0">
                        <p className="font-semibold text-sm">{s.name}</p>
                        <p className="text-xs text-gray-400">{s.rollNo} · {s.department?.name}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {selected && (
                <div className="mt-3 flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <div>
                    <p className="font-semibold text-blue-900 text-sm">{selected.name}</p>
                    <p className="text-xs text-blue-600">{selected.rollNo}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => { setSelected(null); setSearch(''); }}>Clear</Button>
                </div>
              )}
            </Card>

            <Card>
              <h3 className="text-sm font-bold text-gray-700 mb-3">Bulk Generate by Class</h3>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <Select value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
                  <option value="">All Departments</option>
                  {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                </Select>
                <Select value={semFilter} onChange={e => setSemFilter(e.target.value)}>
                  <option value="">All Semesters</option>
                  {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Sem {s}</option>)}
                </Select>
              </div>
              <Button onClick={loadBulk} loading={loading} className="w-full" icon={CreditCard}>
                Load & Preview IDs
              </Button>
            </Card>
          </div>

          {/* Right - Preview */}
          <div>
            <Card>
              <h3 className="text-sm font-bold text-gray-700 mb-4">ID Card Preview</h3>
              {selected ? (
                <div className="flex justify-center">
                  <StudentIDCard student={selected} dept={selectedDept} />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <CreditCard size={48} strokeWidth={1} className="text-gray-300 mb-3" />
                  <p className="font-medium">Search a student to preview their ID card</p>
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Bulk preview */}
        {showBulk && students.length > 0 && (
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900">{students.length} ID Cards</h3>
              <div className="flex gap-2">
                <Button variant="secondary" icon={Printer}>Print All</Button>
                <Button icon={Download}>Download All</Button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {students.slice(0, 9).map(s => (
                <StudentIDCard key={s._id} student={s} dept={departments.find(d => d._id === (s.department?._id || s.department))} />
              ))}
            </div>
            {students.length > 9 && (
              <p className="text-center text-sm text-gray-400 mt-4">Showing 9 of {students.length} — Download All to get complete set</p>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}