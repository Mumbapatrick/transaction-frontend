'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Users, Plus, Trash2, Edit, Search, Phone, DollarSign, TrendingUp } from 'lucide-react';
import type { Contact } from '@/types';
import { DEFAULT_CONTACT_CATEGORIES } from '@/utils/data-store';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ContactBookProps {
    contacts: Contact[];
    onAddContact: (contact: Omit<Contact, 'id' | 'createdAt' | 'totalPayments' | 'totalAmount'>) => void;
    onUpdateContact: (id: string, updates: Partial<Contact>) => void;
    onDeleteContact: (id: string) => void;
}

export function ContactBook({ contacts, onAddContact, onUpdateContact, onDeleteContact }: ContactBookProps) {
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [editingContact, setEditingContact] = useState<Contact | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        category: DEFAULT_CONTACT_CATEGORIES[0].id,
        notes: ''
    });

    const filteredContacts = contacts.filter(contact => {
        const matchesSearch =
            contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            contact.phone.includes(searchQuery);
        const matchesCategory = filterCategory === 'all' || contact.category.id === filterCategory;
        return matchesSearch && matchesCategory;
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const category = DEFAULT_CONTACT_CATEGORIES.find(c => c.id === formData.category) || DEFAULT_CONTACT_CATEGORIES[0];

        if (editingContact) {
            onUpdateContact(editingContact.id, {
                ...formData,
                category
            });
            setEditingContact(null);
        } else {
            onAddContact({
                ...formData,
                category
            });
        }

        setFormData({
            name: '',
            phone: '',
            category: DEFAULT_CONTACT_CATEGORIES[0].id,
            notes: ''
        });
        setIsAddDialogOpen(false);
    };

    const handleEdit = (contact: Contact) => {
        setEditingContact(contact);
        setFormData({
            name: contact.name,
            phone: contact.phone,
            category: contact.category.id,
            notes: contact.notes || ''
        });
        setIsAddDialogOpen(true);
    };

    const handleCancel = () => {
        setEditingContact(null);
        setFormData({
            name: '',
            phone: '',
            category: DEFAULT_CONTACT_CATEGORIES[0].id,
            notes: ''
        });
        setIsAddDialogOpen(false);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-green-600" />
                            Contact Book
                        </CardTitle>
                        <CardDescription>
                            Manage your frequent payment recipients
                        </CardDescription>
                    </div>

                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-green-600 hover:bg-green-700">
                                <Plus className="w-4 h-4 mr-2" />
                                Add Contact
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>
                                    {editingContact ? 'Edit Contact' : 'Add New Contact'}
                                </DialogTitle>
                                <DialogDescription>
                                    {editingContact ? 'Update contact information' : 'Add a frequent payment recipient to your contact book'}
                                </DialogDescription>
                            </DialogHeader>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name</Label>
                                    <Input
                                        id="name"
                                        placeholder="e.g., John Doe"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        placeholder="e.g., 0712345678"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="category">Category</Label>
                                    <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {DEFAULT_CONTACT_CATEGORIES.map((cat) => (
                                                <SelectItem key={cat.id} value={cat.id}>
                          <span className="flex items-center gap-2">
                            <span>{cat.icon}</span>
                            <span>{cat.name}</span>
                          </span>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="notes">Notes (Optional)</Label>
                                    <Textarea
                                        id="notes"
                                        placeholder="Additional notes about this contact"
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        rows={3}
                                    />
                                </div>

                                <div className="flex gap-2 pt-2">
                                    <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700">
                                        {editingContact ? 'Update Contact' : 'Add Contact'}
                                    </Button>
                                    <Button type="button" variant="outline" onClick={handleCancel}>
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>

            <CardContent>
                {/* Search and Filter */}
                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Search contacts by name or phone..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    <Select value={filterCategory} onValueChange={setFilterCategory}>
                        <SelectTrigger className="w-full sm:w-48">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {DEFAULT_CONTACT_CATEGORIES.map((cat) => (
                                <SelectItem key={cat.id} value={cat.id}>
                                    {cat.icon} {cat.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Contacts Table */}
                {filteredContacts.length === 0 ? (
                    <div className="text-center py-12">
                        <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No contacts found</h3>
                        <p className="text-gray-500">
                            {searchQuery || filterCategory !== 'all'
                                ? 'Try adjusting your search or filters'
                                : 'Add your first contact to get started'}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Phone</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Payments</TableHead>
                                    <TableHead>Total Sent</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredContacts.map((contact) => (
                                    <TableRow key={contact.id}>
                                        <TableCell className="font-medium">{contact.name}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Phone className="w-3 h-3 text-gray-400" />
                                                {contact.phone}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={contact.category.color}>
                                                {contact.category.icon} {contact.category.name}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{contact.totalPayments || 0}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1 text-green-600 font-medium">
                                                <DollarSign className="w-3 h-3" />
                                                {formatCurrency(contact.totalAmount || 0)}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEdit(contact)}
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => onDeleteContact(contact.id)}
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}

                {/* Summary Stats */}
                {filteredContacts.length > 0 && (
                    <div className="flex justify-between items-center mt-4 pt-4 border-t text-sm text-gray-600">
                        <span>Total: {filteredContacts.length} contact(s)</span>
                        <span>
              Total Payments: {filteredContacts.reduce((sum, c) => sum + (c.totalPayments || 0), 0)}
            </span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
