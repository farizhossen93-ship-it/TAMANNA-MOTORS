import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Shield, 
  MapPin, 
  X, 
  Key, 
  Lock, 
  Mail, 
  Phone, 
  Edit3, 
  Trash2, 
  CheckCircle, 
  AlertTriangle,
  UserCheck,
  UserX,
  Sparkles
} from 'lucide-react';
import { DataTable, Column } from './DataTable';
import { Language, TRANSLATIONS } from '../i18n/translations';
import { AuthUser, UserRole } from '../types';

interface UserManagementViewProps {
  users: AuthUser[];
  onUpdateUsers: (users: AuthUser[]) => void;
  currentUser: AuthUser | null;
  lang?: Language;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  users,
  onUpdateUsers,
  currentUser,
  lang = 'en'
}) => {
  const t = TRANSLATIONS[lang];
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AuthUser | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<AuthUser | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('cashier');
  const [location, setLocation] = useState('Dhaka Central Showroom');
  const [status, setStatus] = useState<'Active' | 'Suspended'>('Active');

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const openAddModal = () => {
    setEditingUser(null);
    setName('');
    setEmail('');
    setUsername('');
    setPassword('password123');
    setPhone('');
    setRole('cashier');
    setLocation('Dhaka Central Showroom');
    setStatus('Active');
    setIsModalOpen(true);
  };

  const openEditModal = (user: AuthUser) => {
    setEditingUser(user);
    setName(user.name);
    setEmail(user.email);
    setUsername(user.username);
    setPassword(user.password || 'password123');
    setPhone(user.phone || '');
    setRole(user.role);
    setLocation(user.businessLocation);
    setStatus(user.status);
    setIsModalOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !username.trim()) {
      return;
    }

    if (editingUser) {
      // Update existing user
      const updatedList = users.map(u => {
        if (u.id === editingUser.id) {
          return {
            ...u,
            name: name.trim(),
            email: email.trim(),
            username: username.trim(),
            password: password.trim() || u.password,
            phone: phone.trim(),
            role,
            businessLocation: location,
            status
          };
        }
        return u;
      });
      onUpdateUsers(updatedList);
      showNotification(lang === 'bn' ? 'স্টাফের তথ্য সফলভাবে আপডেট করা হয়েছে' : 'Staff information updated successfully');
    } else {
      // Create new user
      const newUser: AuthUser = {
        id: `usr-${Date.now()}`,
        name: name.trim(),
        email: email.trim() || `${username.trim().toLowerCase()}@tamannamotors.com`,
        username: username.trim().toLowerCase(),
        password: password.trim() || 'password123',
        phone: phone.trim() || '+880 1700-000000',
        role,
        businessLocation: location,
        status,
        lastLogin: 'Never'
      };
      onUpdateUsers([newUser, ...users]);
      showNotification(lang === 'bn' ? 'নতুন স্টাফ অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে' : 'New staff account created successfully');
    }

    setIsModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (!deleteCandidate) return;

    if (deleteCandidate.id === currentUser?.id) {
      showNotification(lang === 'bn' ? 'বর্তমান সক্রিয় লগইন করা অ্যাকাউন্ট মোছা যাবে না!' : 'Cannot delete currently active logged in account!');
      setDeleteCandidate(null);
      return;
    }

    const remainingAdmins = users.filter(u => (u.role === 'super_admin' || u.role === 'admin') && u.id !== deleteCandidate.id);
    if (remainingAdmins.length === 0) {
      showNotification(lang === 'bn' ? 'কমপক্ষে একজন অ্যাডমিন অ্যাকাউন্ট থাকতে হবে!' : 'At least one admin account must exist!');
      setDeleteCandidate(null);
      return;
    }

    onUpdateUsers(users.filter(u => u.id !== deleteCandidate.id));
    showNotification(lang === 'bn' ? `${deleteCandidate.name} এর অ্যাকাউন্ট মুছে ফেলা হয়েছে` : `User ${deleteCandidate.name} deleted`);
    setDeleteCandidate(null);
  };

  const handleToggleStatus = (targetUser: AuthUser) => {
    const updatedStatus = targetUser.status === 'Active' ? 'Suspended' : 'Active';
    const updatedList = users.map(u => 
      u.id === targetUser.id ? { ...u, status: updatedStatus as 'Active' | 'Suspended' } : u
    );
    onUpdateUsers(updatedList);
    showNotification(
      lang === 'bn'
        ? `${targetUser.name} এখন ${updatedStatus === 'Active' ? 'সক্রিয়' : 'স্থগিত'}`
        : `${targetUser.name} is now ${updatedStatus}`
    );
  };

  const getRoleBadge = (userRole: UserRole) => {
    switch (userRole) {
      case 'super_admin':
        return {
          label: lang === 'bn' ? 'মালিক / সুপার অ্যাডমিন' : 'Super Admin (Owner)',
          className: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800'
        };
      case 'admin':
        return {
          label: lang === 'bn' ? 'শাখা অ্যাডমিন' : 'Branch Admin',
          className: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
        };
      case 'manager':
        return {
          label: lang === 'bn' ? 'শোরুম ম্যানেজার' : 'Showroom Manager',
          className: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800'
        };
      case 'cashier':
      default:
        return {
          label: lang === 'bn' ? 'ক্যাশিয়ার / পিওএস' : 'Cashier / POS',
          className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
        };
    }
  };

  const columns: Column<AuthUser>[] = [
    {
      header: lang === 'bn' ? 'স্টাফ ও ক্রেডেনশিয়াল' : 'Staff Member & Credential',
      accessorKey: 'name',
      cell: (row) => {
        const isCurrent = row.id === currentUser?.id;
        return (
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black text-xs">
              {row.name.charAt(0)}
            </div>
            <div>
              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                {row.name}
                {isCurrent && (
                  <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                    {lang === 'bn' ? 'আপনি' : 'You'}
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-500 flex items-center gap-2">
                <span>@{row.username}</span>
                <span>·</span>
                <span className="truncate max-w-[150px]">{row.email}</span>
              </div>
            </div>
          </div>
        );
      }
    },
    {
      header: lang === 'bn' ? 'পদবী ও অনুমতি' : 'Role & Permissions',
      accessorKey: 'role',
      cell: (row) => {
        const badge = getRoleBadge(row.role);
        return (
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold border ${badge.className}`}>
            <Shield className="h-3 w-3" />
            {badge.label}
          </span>
        );
      }
    },
    {
      header: lang === 'bn' ? 'মোবাইল ও শাখা' : 'Phone & Location',
      accessorKey: 'businessLocation',
      cell: (row) => (
        <div>
          <div className="text-slate-800 dark:text-slate-200 flex items-center gap-1 text-xs font-medium">
            <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
            <span>{row.businessLocation}</span>
          </div>
          {row.phone && (
            <div className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
              <Phone className="h-2.5 w-2.5 text-slate-400 shrink-0" />
              <span>{row.phone}</span>
            </div>
          )}
        </div>
      )
    },
    {
      header: lang === 'bn' ? 'লগইন পাসওয়ার্ড' : 'Login Password',
      accessorKey: 'password',
      cell: (row) => (
        <div className="flex items-center gap-1 font-mono text-[11px] text-slate-500">
          <Key className="h-3 w-3 text-amber-500 shrink-0" />
          <span>{row.password || 'password123'}</span>
        </div>
      )
    },
    {
      header: lang === 'bn' ? 'অবস্থা' : 'Status',
      accessorKey: 'status',
      cell: (row) => {
        const isActive = row.status === 'Active';
        return (
          <button
            onClick={() => handleToggleStatus(row)}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold cursor-pointer transition-colors ${
              isActive 
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 hover:bg-emerald-100' 
                : 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-400 hover:bg-red-100'
            }`}
            title="Click to toggle status"
          >
            {isActive ? <UserCheck className="h-3 w-3" /> : <UserX className="h-3 w-3" />}
            <span>{isActive ? (lang === 'bn' ? 'সক্রিয়' : 'Active') : (lang === 'bn' ? 'স্থগিত' : 'Suspended')}</span>
          </button>
        );
      }
    },
    {
      header: lang === 'bn' ? 'সর্বশেষ লগইন' : 'Last Login',
      accessorKey: 'lastLogin',
      cell: (row) => <span className="font-mono text-[11px] text-slate-500">{row.lastLogin || 'Never'}</span>
    }
  ];

  return (
    <div className="space-y-5">
      {/* Top Banner Notice */}
      {notification && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 p-3 text-xs font-bold text-emerald-800 dark:text-emerald-300 animate-in fade-in">
          <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Main Staff Table */}
      <DataTable
        title={lang === 'bn' ? 'স্টাফ ও ব্যবহারকারী একাউন্ট ব্যবস্থাপনা' : 'Staff & User Account Management'}
        subtitle={lang === 'bn' ? 'তামান্না মোটরসের শোরুম ম্যানেজার, ক্যাশিয়ার ও পার্টস অপারেটরদের লগইন অ্যাকাউন্ট ও পদবী নিয়ন্ত্রণ।' : 'Manage system users, login credentials, store branches, and staff security roles.'}
        data={users}
        columns={columns}
        addNewLabel={lang === 'bn' ? 'নতুন স্টাফ যোগ করুন' : 'Add Staff Member'}
        onAddNew={openAddModal}
        onEdit={openEditModal}
        onDelete={(row) => setDeleteCandidate(row)}
        lang={lang}
      />

      {/* Add / Edit Staff Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl transition-colors">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {editingUser
                    ? (lang === 'bn' ? 'স্টাফ অ্যাকাউন্ট সম্পাদনা' : 'Edit Staff Account')
                    : (lang === 'bn' ? 'নতুন স্টাফ অ্যাকাউন্ট তৈরি' : 'Create New Staff Account')}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {lang === 'bn' ? 'পূর্ণ নাম *' : 'Full Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Tanvir Ahmed"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {lang === 'bn' ? 'ইউজারনেম (লগইন আইডি) *' : 'Username (Login ID) *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. tanvir_pos"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {lang === 'bn' ? 'ইমেইল ঠিকানা' : 'Email Address'}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tanvir@tamannamotors.com"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {lang === 'bn' ? 'মোবাইল নম্বর' : 'Phone Number'}
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+880 1711-000000"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {lang === 'bn' ? 'লগইন পাসওয়ার্ড *' : 'Login Password *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="password123"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-hidden font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {lang === 'bn' ? 'পদবী ও অ্যাক্সেস রোল' : 'System Role'}
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-hidden"
                  >
                    <option value="super_admin">{lang === 'bn' ? 'সুপার অ্যাডমিন (মালিক)' : 'Super Admin (Owner)'}</option>
                    <option value="admin">{lang === 'bn' ? 'অ্যাডমিন / শাখা ইনচার্জ' : 'Admin / Branch Head'}</option>
                    <option value="manager">{lang === 'bn' ? 'শোরুম ম্যানেজার' : 'Showroom Manager'}</option>
                    <option value="cashier">{lang === 'bn' ? 'ক্যাশিয়ার / পিওএস অপারেটর' : 'Cashier / POS Operator'}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {lang === 'bn' ? 'কর্মক্ষেত্র / শাখা' : 'Assigned Branch'}
                  </label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-hidden"
                  >
                    <option value="Dhaka Central Showroom">Dhaka Central Showroom</option>
                    <option value="Mirpur Branch">Mirpur Branch</option>
                    <option value="Chittagong Hub">Chittagong Hub</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {lang === 'bn' ? 'অ্যাকাউন্টের অবস্থা' : 'Account Status'}
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'Active' | 'Suspended')}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-hidden"
                  >
                    <option value="Active">{lang === 'bn' ? 'সক্রিয় (Active)' : 'Active'}</option>
                    <option value="Suspended">{lang === 'bn' ? 'স্থগিত (Suspended)' : 'Suspended'}</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-700 px-5 py-2 font-black text-white shadow-md transition-colors cursor-pointer"
                >
                  {editingUser 
                    ? (lang === 'bn' ? 'আপডেট করুন' : 'Update Staff')
                    : (lang === 'bn' ? 'সংরক্ষণ করুন' : 'Save Staff')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (Replaces browser confirm) */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl text-center">
            <div className="h-12 w-12 rounded-2xl bg-red-100 dark:bg-red-950/60 text-red-600 mx-auto flex items-center justify-center mb-3">
              <Trash2 className="h-6 w-6" />
            </div>
            <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
              {lang === 'bn' ? 'স্টাফ অ্যাকাউন্ট মুছবেন?' : 'Delete Staff Account?'}
            </h4>
            <p className="text-xs text-slate-500 mt-1 mb-5">
              {lang === 'bn' 
                ? `আপনি কি নিশ্চিতভাবে "${deleteCandidate.name}" এর অ্যাক্সেস সম্পূর্ণ মুছে ফেলতে চান?` 
                : `Are you sure you want to remove user access for "${deleteCandidate.name}"?`}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteCandidate(null)}
                className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 rounded-xl bg-red-600 hover:bg-red-700 py-2.5 text-xs font-bold text-white shadow-md transition-colors cursor-pointer"
              >
                {lang === 'bn' ? 'হ্যাঁ, মুছুন' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
