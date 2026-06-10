import React, { useState, useEffect } from 'react';
import { Plus, Briefcase, Building2, MapPin, Calendar, Users } from 'lucide-react';
import { placementsAPI, departmentsAPI } from '../../api';
import { PageHeader, Card, Button, Badge, Select, Modal, Input, Textarea, StatCard } from '../../components/ui';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const STATUS_COLORS = { upcoming: 'warning', open: 'success', closed: 'default', completed: 'primary' };

export default function Placements() {
  const [placements, setPlacements] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [form, setForm] = useState({
    companyName: '', type: 'placement', role: '', package: '', stipend: '',
    minCGPA: '6.0', description: '', driveDate: '', lastApplyDate: '', location: '',
    status: 'upcoming', eligibleDepartments: [],
  });
  const { user } = useAuthStore();
  const canPost = ['super_admin','college_admin','placement_officer'].includes(user?.role);

  const fetchPlacements = () => {
    const params = {};
    if (typeFilter) params.type = typeFilter;
    if (statusFilter) params.status = statusFilter;
    placementsAPI.getAll(params).then(({ data }) => setPlacements(data.data)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { departmentsAPI.getAll().then(({ data }) => setDepartments(data.data)).catch(() => {}); }, []);
  useEffect(() => { fetchPlacements(); }, [typeFilter, statusFilter]);

  const handleCreate = async () => {
    if (!form.companyName || !form.role) return toast.error('Company name and role required');
    setSaving(true);
    try {
      await placementsAPI.create(form);
      toast.success('Placement drive added');
      setShowModal(false);
      setForm({ companyName:'', type:'placement', role:'', package:'', stipend:'', minCGPA:'6.0', description:'', driveDate:'', lastApplyDate:'', location:'', status:'upcoming', eligibleDepartments:[] });
      fetchPlacements();
    } catch { toast.error('Failed to create'); }
    finally { setSaving(false); }
  };

  const totalPlaced = placements.filter(p => p.type === 'placement' && p.status === 'completed')
    .reduce((a, p) => a + (p.selectedStudents?.length || 0), 0);
  const openDrives = placements.filter(p => p.status === 'open').length;
  const internships = placements.filter(p => p.type === 'internship').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title="Placements & Internships" subtitle="Manage campus recruitment drives" breadcrumb="Home / Placements"
        actions={canPost && <Button icon={Plus} onClick={() => setShowModal(true)}>Add Drive</Button>}
      />
      <div className="p-6 space-y-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard title="Total Placed" value={totalPlaced} icon={Users} color="green" />
          <StatCard title="Open Drives" value={openDrives} icon={Briefcase} color="blue" />
          <StatCard title="Internships" value={internships} icon={Building2} color="purple" />
          <StatCard title="Companies" value={[...new Set(placements.map(p => p.companyName))].length} icon={Building2} color="teal" />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <Select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="w-36">
            <option value="">All Types</option>
            <option value="placement">Placement</option>
            <option value="internship">Internship</option>
          </Select>
          <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-36">
            <option value="">All Status</option>
            <option value="upcoming">Upcoming</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
            <option value="completed">Completed</option>
          </Select>
        </div>

        {/* Cards grid */}
        {loading ? (
          <div className="flex items-center justify-center py-16"><div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>
        ) : placements.length === 0 ? (
          <Card>
            <div className="flex flex-col items-center py-12 text-gray-400">
              <Briefcase size={40} strokeWidth={1} className="mb-3 text-gray-300" />
              <p className="font-medium">No placement drives added yet</p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {placements.map((p) => (
              <Card key={p._id} className="hover:shadow-md transition-all hover:-translate-y-0.5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                      <Building2 size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm">{p.companyName}</h3>
                      <Badge variant={p.type === 'placement' ? 'primary' : 'purple'} size="xs">{p.type}</Badge>
                    </div>
                  </div>
                  <Badge variant={STATUS_COLORS[p.status] || 'default'}>{p.status}</Badge>
                </div>

                <p className="text-base font-semibold text-gray-800 mb-3">{p.role}</p>

                <div className="space-y-1.5 mb-4">
                  {p.type === 'placement' && p.package && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-400">💰</span>
                      <span className="font-bold text-emerald-600">₹{p.package} LPA</span>
                    </div>
                  )}
                  {p.type === 'internship' && p.stipend && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-400">💰</span>
                      <span className="font-bold text-emerald-600">₹{p.stipend?.toLocaleString()}/month</span>
                    </div>
                  )}
                  {p.location && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <MapPin size={13} className="text-gray-400" />
                      <span>{p.location}</span>
                    </div>
                  )}
                  {p.driveDate && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar size={13} className="text-gray-400" />
                      <span>Drive: {new Date(p.driveDate).toLocaleDateString('en-IN')}</span>
                    </div>
                  )}
                  {p.minCGPA && (
                    <div className="text-sm text-gray-500">Min CGPA: <strong>{p.minCGPA}</strong></div>
                  )}
                </div>

                {p.description && <p className="text-xs text-gray-500 line-clamp-2 mb-3">{p.description}</p>}

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-400">
                    {p.appliedStudents?.length || 0} applied · {p.selectedStudents?.length || 0} selected
                  </span>
                  {p.lastApplyDate && (
                    <span className="text-xs text-red-500 font-medium">
                      Apply by: {new Date(p.lastApplyDate).toLocaleDateString('en-IN')}
                    </span>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add Placement Drive" size="lg">
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Company Name" required value={form.companyName} onChange={e => setForm(f => ({ ...f, companyName: e.target.value }))} placeholder="e.g. Infosys, TCS..." />
            <Input label="Role / Position" required value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} placeholder="e.g. Software Engineer" />
            <Select label="Type" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
              <option value="placement">Placement</option>
              <option value="internship">Internship</option>
            </Select>
            <Select label="Status" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
              {['upcoming','open','closed','completed'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
            </Select>
            {form.type === 'placement' && (
              <Input label="Package (LPA)" type="number" value={form.package} onChange={e => setForm(f => ({ ...f, package: e.target.value }))} placeholder="e.g. 6.5" prefix="₹" />
            )}
            {form.type === 'internship' && (
              <Input label="Stipend (per month)" type="number" value={form.stipend} onChange={e => setForm(f => ({ ...f, stipend: e.target.value }))} placeholder="e.g. 15000" prefix="₹" />
            )}
            <Input label="Location" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Bengaluru / Remote..." />
            <Input label="Min CGPA" type="number" value={form.minCGPA} onChange={e => setForm(f => ({ ...f, minCGPA: e.target.value }))} step="0.1" />
            <Input label="Drive Date" type="date" value={form.driveDate} onChange={e => setForm(f => ({ ...f, driveDate: e.target.value }))} />
            <Input label="Last Apply Date" type="date" value={form.lastApplyDate} onChange={e => setForm(f => ({ ...f, lastApplyDate: e.target.value }))} />
          </div>
          <Textarea label="Job Description" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Role description, skills required..." />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleCreate} loading={saving} icon={Plus}>Add Drive</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}