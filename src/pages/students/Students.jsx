import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Download, Upload, Eye, Pencil, Trash2, GraduationCap, Filter } from 'lucide-react';
import { studentsAPI, departmentsAPI } from '../../api';
import {
  PageHeader, Card, Table, Badge, Button, SearchBar,
  Select, Avatar, ConfirmDialog, Pagination, StatCard, EmptyState
} from '../../components/ui';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const STATUS_BADGE = {
  active: 'success',
  passout: 'primary',
  detained: 'warning',
  dropped: 'danger',
};

export default function Students() {
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [semFilter, setSemFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const { isAdmin } = useAuthStore();
  const navigate = useNavigate();

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (search) params.search = search;
      if (deptFilter) params.department = deptFilter;
      if (semFilter) params.semester = semFilter;
      if (statusFilter) params.status = statusFilter;
      const { data } = await studentsAPI.getAll(params);
      setStudents(data.data);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch (err) {
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  }, [search, deptFilter, semFilter, statusFilter, page]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  useEffect(() => {
    departmentsAPI.getAll().then(({ data }) => setDepartments(data.data)).catch(() => {});
  }, []);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await studentsAPI.delete(deleteTarget._id);
      toast.success('Student deactivated');
      setDeleteTarget(null);
      fetchStudents();
    } catch {
      toast.error('Failed to deactivate');
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      header: 'Student',
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.name} size="sm" color="blue" />
          <div>
            <p className="font-semibold text-gray-900 text-sm">{row.name}</p>
            <p className="text-xs text-gray-400">{row.email}</p>
          </div>
        </div>
      )
    },
    { header: 'Roll No', render: (row) => <span className="font-mono text-sm font-semibold text-blue-700">{row.rollNo}</span> },
    { header: 'Department', render: (row) => <span className="text-sm">{row.department?.name || '—'}</span> },
    {
      header: 'Sem / Section',
      render: (row) => (
        <div className="text-sm">
          <span className="font-medium">Sem {row.semester}</span>
          {row.section && <span className="text-gray-400"> · {row.section}</span>}
        </div>
      )
    },
    { header: 'Course', render: (row) => <span className="text-sm text-gray-600">{row.course || 'B.Tech'}</span> },
    {
      header: 'Status',
      render: (row) => <Badge variant={STATUS_BADGE[row.status] || 'default'}>{row.status}</Badge>
    },
    {
      header: 'Actions',
      cellClass: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <button onClick={() => navigate(`/students/${row._id}`)}
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="View">
            <Eye size={15} />
          </button>
          {isAdmin() && (
            <>
              <button onClick={() => navigate(`/students/${row._id}/edit`)}
                className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors" title="Edit">
                <Pencil size={15} />
              </button>
              <button onClick={() => setDeleteTarget(row)}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Deactivate">
                <Trash2 size={15} />
              </button>
            </>
          )}
        </div>
      )
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Students"
        subtitle={`${total} students registered`}
        breadcrumb="Home / Students"
        actions={
          isAdmin() && (
            <div className="flex gap-2">
              <Button variant="secondary" icon={Upload} size="sm">Import CSV</Button>
              <Button variant="secondary" icon={Download} size="sm">Export</Button>
              <Button icon={Plus} onClick={() => navigate('/students/add')}>Add Student</Button>
            </div>
          )
        }
      />

      <div className="p-6 space-y-5">
        {/* Filters */}
        <Card padding={false}>
          <div className="p-4 flex flex-wrap gap-3 items-end">
            <SearchBar
              value={search} onChange={(v) => { setSearch(v); setPage(1); }}
              placeholder="Search by name, roll no, email..."
              className="flex-1 min-w-[220px]"
            />
            <Select value={deptFilter} onChange={e => { setDeptFilter(e.target.value); setPage(1); }} className="w-44">
              <option value="">All Departments</option>
              {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
            </Select>
            <Select value={semFilter} onChange={e => { setSemFilter(e.target.value); setPage(1); }} className="w-32">
              <option value="">All Sems</option>
              {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
            </Select>
            <Select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="w-32">
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="passout">Passout</option>
              <option value="detained">Detained</option>
              <option value="dropped">Dropped</option>
            </Select>
            {(search || deptFilter || semFilter || statusFilter) && (
              <Button variant="ghost" size="sm" onClick={() => { setSearch(''); setDeptFilter(''); setSemFilter(''); setStatusFilter('active'); setPage(1); }}>
                Clear filters
              </Button>
            )}
          </div>

          <Table columns={columns} data={students} loading={loading} emptyText="No students found" />
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </Card>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Deactivate Student"
        message={`Are you sure you want to deactivate ${deleteTarget?.name}? Their login access will be disabled.`}
      />
    </div>
  );
}