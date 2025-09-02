'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { AlertTriangle } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'destructive' | 'default';
  isLoading?: boolean;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'destructive',
  isLoading = false,
}: ConfirmationModalProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const HeaderContent = () => (
    <div className="flex items-center space-x-3">
      {variant === 'destructive' && (
        <div className="flex-shrink-0">
          <AlertTriangle className="w-6 h-6 text-destructive" />
        </div>
      )}
      <div>
        <div className="text-left font-semibold">{title}</div>
      </div>
    </div>
  );


  const FooterButtons = ({ className = "" }: { className?: string }) => (
    <div className={`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 gap-2 ${className}`}>
      <Button
        variant="outline"
        onClick={onClose}
        disabled={isLoading}
        className="w-full sm:w-auto"
      >
        {cancelText}
      </Button>
      <Button
        variant={variant}
        onClick={handleConfirm}
        disabled={isLoading}
        className="w-full sm:w-auto"
      >
        {isLoading ? 'Processing...' : confirmText}
      </Button>
    </div>
  );

  if (isDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              <HeaderContent />
            </DialogTitle>
            <DialogDescription>
              {description}
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <FooterButtons />
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>
            <HeaderContent />
          </DrawerTitle>
          <DrawerDescription>
            {description}
          </DrawerDescription>
        </DrawerHeader>
        
        <DrawerFooter className="pt-2">
          <FooterButtons />
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
