"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import AdminSidebar from "@/components/admin/AdminSidebar";

/**
 * Full-height drawer for phones/tablets (`< lg`). The desktop rail is hidden on
 * those breakpoints and this drawer takes over, so the admin stays one column
 * of content + one navigation surface at every width.
 */
export default function AdminMobileNav({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          />
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-stone-800 bg-stone-950 p-5 lg:hidden"
          >
            <div className="mb-8 flex items-center justify-between">
              <span className="font-heading text-2xl font-bold text-white">
                LUXE<span className="text-amber-400">.</span>
              </span>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close navigation"
                className="rounded-full p-2 text-stone-400 transition-colors hover:bg-white/5 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <AdminSidebar onNavigate={onClose} />
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
