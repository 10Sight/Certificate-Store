import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { IconUsers, IconTrash, IconFilter, IconX, IconPencil, IconDownload } from '@tabler/icons-react';
import * as XLSX from 'xlsx';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SearchInput from '@/components/common/SearchInput';
import FilterSelect from '@/components/common/FilterSelect';
import FilterBar from '@/components/common/FilterBar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGetAllUsersQuery, useUserRegisterMutation, useDeleteUserByIdMutation, useUserUpdateMutation } from '../../Redux/AllApi/UserApi';
import { toast } from 'sonner'; // Assuming sonner is used, or console.log/alert if not sure. I'll use alert for now or check if toast exists.

const AllUser = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState(new Set());

  // ... (hooks)

  const toggleSelectAll = () => {
    if (selectedUsers.size === users.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(users.map(u => u._id)));
    }
  };

  const toggleSelectUser = (id) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedUsers(newSelected);
  };

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobile: '',
    dateOfJoining: '',
    password: '',
    role: 'WORKER',
    employmentType: 'PERMANENT',
    iCardNumber: '',
    profilePhoto: null
  });

  const { user: currentUser } = useSelector((state) => state.auth);

  const [dateFilter, setDateFilter] = useState('');

  // API Hooks
  const { data, isLoading, isError, refetch } = useGetAllUsersQuery({
    page,
    limit,
    search: searchQuery,
    employmentType: activeTab === 'all' ? undefined : activeTab.toUpperCase(),
    dateOfJoining: dateFilter || undefined // Pass date filter
  });

  const [registerUser, { isLoading: isRegistering }] = useUserRegisterMutation();
  const [updateUser, { isLoading: isUpdating }] = useUserUpdateMutation();
  const [deleteUser] = useDeleteUserByIdMutation();

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setPage(1); // Reset to first page on tab change
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(id).unwrap();
        toast.success('User deleted successfully');
      } catch (error) {
        console.error('Failed to delete user:', error);
        toast.error('Failed to delete user');
      }
    }
  };

  const handleEdit = (user) => {
    setIsEditMode(true);
    setSelectedUserId(user._id);
    setFormData({
      fullName: user.fullName || '',
      email: user.email || '',
      mobile: user.mobile || '',
      dateOfJoining: user.dateOfJoining ? new Date(user.dateOfJoining).toISOString().split('T')[0] : '',
      password: '', // Keep password empty, only update if user enters it
      role: user.role || 'WORKER',
      employmentType: user.employmentType || 'PERMANENT',
      iCardNumber: user.iCardNumber || '',
      profilePhoto: null
    });
    setIsAddUserOpen(true);
  };

  const handleRowClick = (id) => {
    navigate(`/employee/${id}`);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value) => {
    setFormData(prev => ({ ...prev, role: value }));
  };

  const handleAddUserSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append('fullName', formData.fullName);
      data.append('email', formData.email);
      data.append('mobile', formData.mobile);
      data.append('dateOfJoining', formData.dateOfJoining);
      data.append('role', formData.role);
      data.append('employmentType', formData.employmentType);
      data.append('iCardNumber', formData.iCardNumber);

      if (formData.profilePhoto) {
        data.append('profilePhoto', formData.profilePhoto);
      }

      if (isEditMode) {
        // Only append password if provided
        if (formData.password) data.append('password', formData.password);

        // Need to pass ID separate from body in the hook usually, or URL. 
        // Our hook expects `{ id, ...data }`. But here data is FormData.
        // We need to adjust how we call updateUser or how UserApi handles it.
        // UserApi: `query: ({ id, ...data }) => ({ url: ..., body: data })`
        // If we pass an object `{ id: 123, formData: actualFormData }`, the API helper needs to know to put formData in body.
        // Let's check UserApi again. It spreads `...data` into body.
        // If we pass a FormData object, spreading it doesn't work well in JS objects for `data` property of axios config usually needs the FormData object directly.
        // Ideally we change `UserApi` or pass it differently.
        // Let's pass `{ id: selectedUserId, formData: data }` and update UserApi to handle that if needed?
        // Actually, let's look at `UserApi.js`: `query: ({ id, ...data }) => ... data: data`.
        // If I pass `id` inside FormData it's awkward because the URL needs it.
        // Let's pass: `updateUser({ id: selectedUserId, body: data })` and update UserApi to expect `body`.
        await updateUser({ id: selectedUserId, body: data }).unwrap();
        toast.success("User updated successfully");
      } else {
        // Default password is Mobile Number if not provided
        const passwordToUse = formData.password || formData.mobile;
        data.append('password', passwordToUse);
        await registerUser(data).unwrap();
        toast.success("User registered successfully");
      }

      closeModal();
    } catch (error) {
      console.error('Failed to save user:', error);
      toast.error(error?.data?.message || 'Failed to save user');
    }
  };

  const handleExport = () => {
    if (!users || users.length === 0) {
      toast.error('No users to export');
      return;
    }

    const usersToExport = selectedUsers.size > 0
      ? users.filter(u => selectedUsers.has(u._id))
      : users;

    const exportData = usersToExport.map(user => ({
      'Full Name': user.fullName,
      'I-Card Number': user.iCardNumber || user._id,
      'Email': user.email,
      'Mobile': user.mobile,
      'Date of Joining': new Date(user.dateOfJoining).toLocaleDateString(),
      'Role': user.role,
      'Employment Type': user.employmentType,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");

    // Generate filename with date
    const date = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `Users_Export_${date}.xlsx`);
    toast.success(`Exported ${usersToExport.length} users`);
  };

  const closeModal = () => {
    setIsAddUserOpen(false);
    setIsEditMode(false);
    setSelectedUserId(null);
    setFormData({
      fullName: '',
      email: '',
      mobile: '',
      dateOfJoining: '',
      password: '',
      role: 'WORKER',
      employmentType: 'PERMANENT',
      iCardNumber: '',
      profilePhoto: null
    });
  };

  const users = data?.data?.users || [];
  const pagination = data?.data?.pagination;

  const tabs = [
    { id: 'all', label: 'All', count: activeTab === 'all' ? pagination?.totalDocs : undefined },
    { id: 'permanent', label: 'Permanent', count: activeTab === 'permanent' ? pagination?.totalDocs : undefined },
    { id: 'casual', label: 'Casual', count: activeTab === 'casual' ? pagination?.totalDocs : undefined },
  ];

  return (
    <div className="p-6 space-y-6 relative">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">All Users</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <IconDownload className="mr-2 h-4 w-4" />
            {selectedUsers.size > 0 ? `Export (${selectedUsers.size})` : 'Export All'}
          </Button>
          {currentUser?.role === 'ADMIN' && (
            <Button onClick={() => setIsAddUserOpen(true)}>
              <IconUsers className="mr-2 h-4 w-4" />
              Add User
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full sm:w-auto">
          <TabsList>
            {tabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="w-full sm:w-48">
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full"
              placeholder="Filter by Date"
            />
          </div>
          <SearchInput
            placeholder="Search users..."
            value={searchQuery}
            onChange={setSearchQuery}
            className="w-full sm:w-72"
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 w-4">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    onChange={toggleSelectAll}
                    checked={users.length > 0 && selectedUsers.size === users.length}
                  />
                </th>
                <th className="px-6 py-3">Employee</th>
                <th className="px-6 py-3">Contact</th>
                <th className="px-6 py-3">Date of Joining</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3">Employment Type</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">Loading...</td>
                </tr>
              ) : users.length > 0 ? (
                users.map((emp) => (
                  <tr
                    key={emp._id}
                    onClick={() => handleRowClick(emp._id)}
                    className="bg-white border-b hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        checked={selectedUsers.has(emp._id)}
                        onChange={() => toggleSelectUser(emp._id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg overflow-hidden">
                          {emp.profilePhotoUrl?.url ? (
                            <img src={emp.profilePhotoUrl.url} alt={emp.fullName} className="h-full w-full object-cover" />
                          ) : (
                            emp.fullName.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{emp.fullName}</div>
                          <div className="text-xs text-gray-500">{emp.iCardNumber || emp._id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-gray-900">{emp.email}</span>
                        <span className="text-gray-500 text-xs">{emp.mobile}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {new Date(emp.dateOfJoining).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${emp.role === 'ADMIN'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-green-100 text-green-800'
                        }`}>
                        {emp.role === 'WORKER' ? 'EMPLOYEE' : emp.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {emp.employmentType}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {currentUser?.role === 'ADMIN' && (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => { e.stopPropagation(); handleEdit(emp); }}
                            className="h-8 w-8 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                          >
                            <IconPencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => { e.stopPropagation(); handleDelete(emp._id); }}
                            className="h-8 w-8 text-red-600 hover:text-red-800 hover:bg-red-50"
                          >
                            <IconTrash className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Pagination Controls */}
      {pagination && (
        <div className="flex justify-end gap-2 mt-4">
          <Button
            variant="outline"
            disabled={!pagination.hasPrevPage}
            onClick={() => setPage(prev => prev - 1)}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            disabled={!pagination.hasNextPage}
            onClick={() => setPage(prev => prev + 1)}
          >
            Next
          </Button>
        </div>
      )}

      {/* Add/Edit User Modal */}
      {isAddUserOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl relative overflow-hidden flex flex-col max-h-[90vh]">

            {/* Header */}
            <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center sticky top-0 z-10">
              <h2 className="text-xl font-bold text-gray-800">{isEditMode ? 'Edit User Details' : 'Add New User'}</h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-200 p-1 rounded-full transition-colors"
                type="button"
              >
                <IconX className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Form Content */}
            <div className="p-6 overflow-y-auto custom-scrollbar">
              <form id="userForm" onSubmit={handleAddUserSubmit} className="space-y-6">

                {/* Personal Information Group */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider border-b pb-1">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fullName" className="text-gray-700">Full Name</Label>
                      <Input
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        required
                        className="mt-1"
                        placeholder="e.g. John Doe"
                      />
                    </div>
                    <div>
                      <Label htmlFor="iCardNumber" className="text-gray-700">I-Card Number</Label>
                      <Input
                        id="iCardNumber"
                        name="iCardNumber"
                        value={formData.iCardNumber}
                        onChange={handleInputChange}
                        required
                        className="mt-1"
                        placeholder="e.g. EMP123"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="mobile" className="text-gray-700">Mobile Number</Label>
                      <Input
                        id="mobile"
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleInputChange}
                        required
                        className="mt-1"
                        placeholder="10-digit number"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-gray-700">Email Address</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="mt-1"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="dateOfJoining" className="text-gray-700">Date of Joining</Label>
                    <Input
                      id="dateOfJoining"
                      name="dateOfJoining"
                      type="date"
                      value={formData.dateOfJoining}
                      onChange={handleInputChange}
                      required
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Role & Employment Group */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider border-b pb-1">Role & Security</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="role" className="text-gray-700">Role</Label>
                      <Select value={formData.role} onValueChange={(val) => setFormData(prev => ({ ...prev, role: val }))}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select Role" />
                        </SelectTrigger>
                        <SelectContent className="z-[10000] bg-white">
                          <SelectItem value="WORKER">Employee</SelectItem>
                          <SelectItem value="ADMIN">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="employmentType" className="text-gray-700">Employment Type</Label>
                      <Select
                        value={formData.employmentType}
                        onValueChange={(val) => setFormData(prev => ({ ...prev, employmentType: val }))}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select Type" />
                        </SelectTrigger>
                        <SelectContent className="z-[10000] bg-white">
                          <SelectItem value="PERMANENT">Permanent</SelectItem>
                          <SelectItem value="CASUAL">Casual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* If NOT edit mode, show hint about default password */}
                    {!isEditMode && (
                      <div className="flex items-end pb-2">
                        <p className="text-sm text-gray-500 italic">
                          Default password will be the <strong>Mobile Number</strong>.
                        </p>
                      </div>
                    )}

                    <div>
                      <Label htmlFor="profilePhoto" className="text-gray-700">Profile Photo</Label>
                      <div className="mt-1 flex items-center gap-2">
                        <Input
                          id="profilePhoto"
                          name="profilePhoto"
                          type="file"
                          accept="image/*"
                          onChange={(e) => setFormData(prev => ({ ...prev, profilePhoto: e.target.files[0] }))}
                          className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                      </div>
                    </div>
                  </div>
                </div>

              </form>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3 sticky bottom-0 z-10">
              <Button type="button" variant="outline" onClick={closeModal} className="w-24">
                Cancel
              </Button>
              <Button type="submit" form="userForm" disabled={isRegistering || isUpdating} className="w-32 bg-blue-600 hover:bg-blue-700 text-white">
                {isRegistering || isUpdating ? 'Saving...' : (isEditMode ? 'Update User' : 'Add User')}
              </Button>
            </div>

          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default AllUser;