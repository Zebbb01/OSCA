// components/financial-monitoring/editable-overview-card.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LucideIcon, Pencil } from 'lucide-react';
import { useState } from 'react';

interface EditableOverviewCardProps {
    title: string;
    value: string;
    description: string;
    icon: LucideIcon | React.ComponentType<{ className?: string }>;
    iconColor?: string;
    onSave?: (newValue: number) => void;
    isSaving?: boolean;
    isEditable?: boolean;
    initialValue?: number;
    editLabel?: string;
}

export function EditableOverviewCard({ 
    title, 
    value, 
    description, 
    icon: Icon, 
    iconColor = 'text-gray-500',
    onSave,
    isSaving = false,
    isEditable = false,
    initialValue = 0,
    editLabel = 'Initial Balance'
}: EditableOverviewCardProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editedValue, setEditedValue] = useState<string>('');

    const handleEdit = () => {
        setEditedValue(initialValue.toString());
        setIsEditing(true);
    };

    const handleSave = () => {
        const newValue = parseFloat(editedValue);
        if (isNaN(newValue) || newValue < 0) {
            alert('Please enter a valid positive number');
            return;
        }
        onSave?.(newValue);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditedValue('');
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <div className="flex items-center gap-2">
                    <Icon className={`h-4 w-4 ${iconColor}`} />
                    {isEditable && !isEditing && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={handleEdit}
                        >
                            <Pencil className="h-3 w-3" />
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {isEditing ? (
                    <div className="space-y-3">
                        <div className="space-y-2">
                            <Label htmlFor="balance-edit" className="text-xs">
                                {editLabel}
                            </Label>
                            <Input
                                id="balance-edit"
                                type="number"
                                value={editedValue}
                                onChange={(e) => setEditedValue(e.target.value)}
                                placeholder="Enter amount"
                                step="0.01"
                                className="h-8"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button 
                                size="sm" 
                                onClick={handleSave}
                                disabled={isSaving}
                                className="h-7 text-xs"
                            >
                                {isSaving ? 'Saving...' : 'Save'}
                            </Button>
                            <Button 
                                size="sm" 
                                variant="outline"
                                onClick={handleCancel}
                                className="h-7 text-xs"
                                disabled={isSaving}
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="text-2xl font-bold">{value}</div>
                        <p className="text-xs text-muted-foreground">{description}</p>
                    </>
                )}
            </CardContent>
        </Card>
    );
}