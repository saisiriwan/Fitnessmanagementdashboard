import React from 'react';
import { Plus, X, UserPlus, CalendarPlus, Dumbbell, FileText } from 'lucide-react';
import { Button } from './ui/button';
import { motion, AnimatePresence } from 'motion/react';

interface QuickActionsProps {
  onAction?: (action: string) => void;
}

export function QuickActions({ onAction }: QuickActionsProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const actions = [
    { icon: UserPlus, label: 'ลูกเทรนใหม่', action: 'new-client', color: 'from-blue-500 to-blue-600' },
    { icon: CalendarPlus, label: 'นัดหมาย', action: 'new-appointment', color: 'from-green-500 to-green-600' },
    { icon: Dumbbell, label: 'โปรแกรม', action: 'new-program', color: 'from-purple-500 to-purple-600' },
    { icon: FileText, label: 'บันทึกเซสชัน', action: 'new-session', color: 'from-orange-500 to-orange-600' },
  ];

  const handleAction = (action: string) => {
    setIsOpen(false);
    onAction?.(action);
  };

  return (
    <div className="fixed bottom-20 right-6 lg:bottom-6 z-40">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="absolute bottom-16 right-0 flex flex-col gap-3"
          >
            {actions.map((item, index) => (
              <motion.div
                key={item.action}
                initial={{ opacity: 0, x: 20, y: 10 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                exit={{ opacity: 0, x: 20, y: 10 }}
                transition={{ delay: index * 0.05 }}
              >
                <Button
                  onClick={() => handleAction(item.action)}
                  className={`h-12 px-4 gap-3 bg-gradient-to-r ${item.color} hover:shadow-lg text-white border-0 group`}
                >
                  <item.icon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">{item.label}</span>
                </Button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main FAB */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          onClick={() => setIsOpen(!isOpen)}
          size="lg"
          className={`h-14 w-14 rounded-full shadow-lg ${
            isOpen
              ? 'bg-destructive hover:bg-destructive'
              : 'bg-gradient-to-br from-primary via-accent to-primary hover:shadow-xl'
          } transition-all duration-300`}
        >
          <motion.div
            animate={{ rotate: isOpen ? 45 : 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <Plus className="h-6 w-6 text-primary-foreground" />
          </motion.div>
        </Button>
      </motion.div>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm -z-10"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
