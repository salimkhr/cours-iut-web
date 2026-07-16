'use client';

import {useState} from 'react';
import {Trash2} from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {Button} from '@/components/ui/button';
import {cn} from '@/lib/utils';

interface DeleteUserDialogProps {
    userId: string;
    userName: string;
    onDeleted: (userId: string) => void;
}

export default function DeleteUserDialog({userId, userName, onDeleted}: DeleteUserDialogProps) {
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/users/${userId}`, {method: 'DELETE'});
            if (res.ok) onDeleted(userId);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-11 w-11 text-bridge-600 dark:text-bridge-300 hover:text-destructive hover:bg-destructive/10"
                    aria-label={`Supprimer ${userName}`}
                >
                    <Trash2 className="w-4 h-4"/>
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent
                className={cn(
                    'bg-card',
                    'border border-bridge-500/45',
                    'shadow-[0_22px_44px_-14px_rgba(147,97,58,0.45)] dark:shadow-[0_22px_44px_-14px_rgba(0,0,0,0.7)]',
                )}
            >
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-brand-dark dark:text-bridge-100">
                        Supprimer le compte ?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-bridge-600 dark:text-bridge-400">
                        Le compte de <strong className="text-brand-dark dark:text-bridge-200">{userName}</strong> sera
                        définitivement supprimé. Cette action est irréversible.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel className="border-bridge-500/45">Annuler</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDelete}
                        disabled={loading}
                        variant="destructive"
                    >
                        {loading ? 'Suppression…' : 'Supprimer'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
