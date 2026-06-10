import React, { useState, useEffect } from 'react';
import { Plus, BookOpen, Search, RotateCcw, AlertCircle } from 'lucide-react';
import { PageHeader, Card, Table, Badge, Button, SearchBar, Select, Modal, Input, StatCard } from '../../components/ui';
import toast from 'react-hot-toast';

const SAMPLE_BOOKS = [
  { _id: '1', title: 'Data Structures and Algorithms', author: 'Thomas H. Cormen', isbn: '978-0262033848', category: 'CS', total: 10, available: 4, edition: '3rd' },
  { _id: '2', title: 'Database System Concepts', author: 'Abraham Silberschatz', isbn: '978-0078022159', category: 'CS', total: 8, available: 2, edition: '7th' },
  { _id: '3', title: 'Computer Networks', author: 'Andrew Tanenbaum', isbn: '978-0132126953', category: 'CS', total: 6, available: 6, edition: '5th' },
  { _id: '4', title: 'Operating System Concepts', author: 'Abraham Silberschatz', isbn: '978-1118063330', category: 'CS', total: 10, available: 0, edition: '9th' },
  { _id: '5', title: 'Fluid Mechanics', author: 'Frank White', isbn: '978-0073398273', category: 'ME', total: 5, available: 3, edition: '8th' },
  { _id: '6', title: 'Engineering Mathematics', author: 'B.S. Grewal', isbn: '978-8174091955', category: 'MATH', total: 15, available: 9, edition: '44th' },
];

const SAMPLE_ISSUED = [
  { _id: 'i1', book: 'Data Structures and Algorithms', studentName: 'Rahul Sharma', rollNo: 'CS21B042', issueDate: '2025-06-01', dueDate: '2025-06-15', status: 'issued', fine: 0 },
  { _id: 'i2', book: 'Operating System Concepts', studentName: 'Priya Patel', rollNo: 'CS21B012', issueDate: '2025-05-20', dueDate: '2025-06-03', status: 'overdue', fine: 50 },
  { _id: 'i3', book: 'DBMS', studentName: 'Arjun Singh', rollNo: 'CS21B023', issueDate: '2025-05-25', dueDate: '2025-06-08', status: 'returned', fine: 0 },
];

export default function Library() {
  const [activeTab, setActiveTab] = useState('books');
  const [books, setBooks] = useState(SAMPLE_BOOKS);
  const [issued, setIssued] = useState(SAMPLE_ISSUED);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [showAddBook, setShowAddBook] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(null);
  const [form, setForm] = useState({ title: '', author: '', isbn: '', category: 'CS', total: '', edition: '' });
  const [issueForm, setIssueForm] = useState({ studentName: '', rollNo: '', dueDate: '' });

  const filteredBooks = books.filter(b =>
    (!search || b.title.toLowerCase().includes(search.toLowerCase()) || b.author.toLowerCase().includes(search.toLowerCase()) || b.isbn.includes(search)) &&
    (!catFilter || b.category === catFilter)
  );

  const totalBooks = books.reduce((a, b) => a + b.total, 0);
  const totalIssued = books.reduce((a, b) => a + (b.total - b.available), 0);
  const overdueCount = issued.filter(i => i.status === 'overdue').length;
  const totalFine = issued.filter(i => i.status === 'overdue').reduce((a, i) => a + i.fine, 0);

  const handleAddBook = () => {
    if (!form.title || !form.author) return toast.error('Title and author required');
    setBooks(prev => [...prev, { ...form, _id: Date.now().toString(), total: Number(form.total), available: Number(form.total) }]);
    toast.success('Book added to library');
    setShowAddBook(false);
    setForm({ title: '', author: '', isbn: '', category: 'CS', total: '', edition: '' });
  };

  const handleIssue = () => {
    if (!issueForm.studentName || !issueForm.rollNo || !issueForm.dueDate) return toast.error('Fill all fields');
    const book = books.find(b => b._id === showIssueModal._id);
    if (book.available === 0) return toast.error('No copies available');
    setBooks(prev => prev.map(b => b._id === book._id ? { ...b, available: b.available - 1 } : b));
    setIssued(prev => [...prev, {
      _id: Date.now().toString(),
      book: book.title,
      ...issueForm,
      issueDate: new Date().toISOString().split('T')[0],
      status: 'issued',
      fine: 0
    }]);
    toast.success('Book issued successfully');
    setShowIssueModal(null);
    setIssueForm({ studentName: '', rollNo: '', dueDate: '' });
  };

  const handleReturn = (id) => {
    const record = issued.find(i => i._id === id);
    setIssued(prev => prev.map(i => i._id === id ? { ...i, status: 'returned' } : i));
    setBooks(prev => prev.map(b => b.title === record.book ? { ...b, available: b.available + 1 } : b));
    toast.success('Book returned');
  };

  const bookColumns = [
    { header: 'Book', render: r => <div className="flex items-center gap-3"><div className="w-10 h-12 bg-blue-50 border border-blue-100 rounded flex items-center justify-center text-blue-600"><BookOpen size={18} /></div><div><p className="font-semibold text-sm">{r.title}</p><p className="text-xs text-gray-400">{r.author} · {r.edition}</p></div></div> },
    { header: 'ISBN', render: r => <span className="font-mono text-xs">{r.isbn}</span> },
    { header: 'Category', render: r => <Badge variant="primary">{r.category}</Badge> },
    { header: 'Availability', render: r => <div><p className={`font-bold text-sm ${r.available === 0 ? 'text-red-500' : r.available <= 2 ? 'text-amber-500' : 'text-emerald-600'}`}>{r.available}/{r.total}</p><p className="text-xs text-gray-400">available</p></div> },
    { header: 'Status', render: r => <Badge variant={r.available === 0 ? 'danger' : r.available <= 2 ? 'warning' : 'success'}>{r.available === 0 ? 'Out of stock' : r.available <= 2 ? 'Low stock' : 'Available'}</Badge> },
    { header: 'Action', render: r => <Button size="sm" variant={r.available === 0 ? 'secondary' : 'primary'} disabled={r.available === 0} onClick={() => setShowIssueModal(r)}>Issue</Button> },
  ];

  const issuedColumns = [
    { header: 'Book', render: r => <p className="font-medium text-sm">{r.book}</p> },
    { header: 'Student', render: r => <div><p className="font-semibold text-sm">{r.studentName}</p><p className="font-mono text-xs text-gray-400">{r.rollNo}</p></div> },
    { header: 'Issue Date', render: r => <span className="text-sm">{r.issueDate}</span> },
    { header: 'Due Date', render: r => <span className={`text-sm font-medium ${r.status === 'overdue' ? 'text-red-500' : ''}`}>{r.dueDate}</span> },
    { header: 'Fine', render: r => <span className={`font-bold ${r.fine > 0 ? 'text-red-500' : 'text-gray-400'}`}>{r.fine > 0 ? `₹${r.fine}` : '—'}</span> },
    { header: 'Status', render: r => <Badge variant={r.status === 'issued' ? 'primary' : r.status === 'overdue' ? 'danger' : 'success'}>{r.status}</Badge> },
    { header: 'Action', render: r => r.status !== 'returned' ? <Button size="sm" variant="secondary" icon={RotateCcw} onClick={() => handleReturn(r._id)}>Return</Button> : <span className="text-xs text-gray-400">Returned</span> },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title="Library Management" subtitle="Books, issue, return, and fine management" breadcrumb="Home / Library"
        actions={<Button icon={Plus} onClick={() => setShowAddBook(true)}>Add Book</Button>}
      />
      <div className="p-6 space-y-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard title="Total Books" value={totalBooks} icon={BookOpen} color="blue" />
          <StatCard title="Currently Issued" value={totalIssued} icon={BookOpen} color="orange" />
          <StatCard title="Overdue Books" value={overdueCount} icon={AlertCircle} color="red" />
          <StatCard title="Total Fine" value={`₹${totalFine}`} icon={AlertCircle} color="purple" />
        </div>

        <div className="flex gap-2">
          {[['books', 'Book Catalog'], ['issued', 'Issued Books']].map(([k, l]) => (
            <button key={k} onClick={() => setActiveTab(k)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === k ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{l}
            </button>
          ))}
        </div>

        {activeTab === 'books' && (
          <Card padding={false}>
            <div className="p-4 flex flex-wrap gap-3 border-b border-gray-100">
              <SearchBar value={search} onChange={setSearch} placeholder="Search by title, author, ISBN..." className="flex-1 min-w-[200px]" />
              <Select value={catFilter} onChange={e => setCatFilter(e.target.value)} className="w-32">
                <option value="">All Categories</option>
                {[...new Set(books.map(b => b.category))].map(c => <option key={c} value={c}>{c}</option>)}
              </Select>
            </div>
            <Table columns={bookColumns} data={filteredBooks} emptyText="No books found" />
          </Card>
        )}

        {activeTab === 'issued' && (
          <Card padding={false}>
            <Table columns={issuedColumns} data={issued} emptyText="No issued records" />
          </Card>
        )}
      </div>

      {/* Add Book Modal */}
      <Modal open={showAddBook} onClose={() => setShowAddBook(false)} title="Add New Book">
        <div className="p-6 space-y-4">
          <Input label="Book Title" required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Introduction to Algorithms" />
          <Input label="Author" required value={form.author} onChange={e => setForm(f => ({ ...f, author: e.target.value }))} placeholder="e.g. Thomas H. Cormen" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="ISBN" value={form.isbn} onChange={e => setForm(f => ({ ...f, isbn: e.target.value }))} placeholder="978-..." />
            <Input label="Edition" value={form.edition} onChange={e => setForm(f => ({ ...f, edition: e.target.value }))} placeholder="3rd" />
            <Select label="Category" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
              {['CS','ME','EE','CE','IT','EC','MATH','PHYSICS','MBA','GENERAL'].map(c => <option key={c} value={c}>{c}</option>)}
            </Select>
            <Input label="Total Copies" type="number" required value={form.total} onChange={e => setForm(f => ({ ...f, total: e.target.value }))} placeholder="10" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowAddBook(false)}>Cancel</Button>
            <Button onClick={handleAddBook}>Add Book</Button>
          </div>
        </div>
      </Modal>

      {/* Issue Book Modal */}
      <Modal open={!!showIssueModal} onClose={() => setShowIssueModal(null)} title={`Issue: ${showIssueModal?.title}`} size="sm">
        {showIssueModal && (
          <div className="p-6 space-y-4">
            <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
              <p className="font-semibold">{showIssueModal.title}</p>
              <p className="text-xs mt-0.5">{showIssueModal.available} copies available</p>
            </div>
            <Input label="Student Name" required value={issueForm.studentName} onChange={e => setIssueForm(f => ({ ...f, studentName: e.target.value }))} />
            <Input label="Roll Number" required value={issueForm.rollNo} onChange={e => setIssueForm(f => ({ ...f, rollNo: e.target.value }))} />
            <Input label="Return Due Date" type="date" required value={issueForm.dueDate} onChange={e => setIssueForm(f => ({ ...f, dueDate: e.target.value }))}
              min={new Date().toISOString().split('T')[0]} />
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => setShowIssueModal(null)}>Cancel</Button>
              <Button onClick={handleIssue}>Issue Book</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}