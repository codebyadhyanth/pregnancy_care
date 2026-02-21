// import { X } from 'lucide-react';
// import { motion, AnimatePresence } from 'framer-motion';

// const AlertModal = ({ isOpen, onClose, data }) => {
//     if (!isOpen || !data) return null;

//     return (
//         <AnimatePresence>
//             <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
//                 <motion.div
//                     initial={{ opacity: 0, scale: 0.9 }}
//                     animate={{ opacity: 1, scale: 1 }}
//                     exit={{ opacity: 0, scale: 0.9 }}
//                     className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
//                 >
//                     <div className="bg-primary-500 p-4 flex justify-between items-center text-white">
//                         <h3 className="font-bold text-lg">Daily Health Snapshot</h3>
//                         <button onClick={onClose}><X size={20} /></button>
//                     </div>

//                     <div className="p-6 space-y-6">
//                         {/* Bullet Point Summary */}
//                         <div className="space-y-4">
//                             <h4 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-2">My Daily Snapshot</h4>
//                             <ul className="space-y-3">
//                                 <li className="flex justify-between items-center text-sm border-b border-gray-100 pb-2">
//                                     <span className="text-gray-600">Water Intake</span>
//                                     <span className="font-bold text-primary-600">{data.water}</span>
//                                 </li>
//                                 <li className="flex justify-between items-center text-sm border-b border-gray-100 pb-2">
//                                     <span className="text-gray-600">Steps</span>
//                                     <span className="font-bold text-primary-600">{data.steps}</span>
//                                 </li>
//                                 <li className="flex justify-between items-center text-sm border-b border-gray-100 pb-2">
//                                     <span className="text-gray-600">Next Appointment</span>
//                                     <span className="font-bold text-primary-600 text-right">{data.nextAppointment}</span>
//                                 </li>
//                             </ul>
//                         </div>

//                         {/* Alerts */}
//                         {data.alerts && data.alerts.length > 0 && (
//                             <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
//                                 <h4 className="text-sm font-bold text-orange-600 uppercase tracking-wider mb-2 flex items-center gap-2">
//                                     <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
//                                     Reminders
//                                 </h4>
//                                 <ul className="space-y-2">
//                                     {data.alerts.map((alert, idx) => (
//                                         <li key={idx} className="flex items-start text-sm text-gray-700">
//                                             <span className="mr-2 text-orange-500 font-bold">•</span>
//                                             {alert}
//                                         </li>
//                                     ))}
//                                 </ul>
//                             </div>
//                         )}

//                         {(!data.alerts || data.alerts.length === 0) && (
//                             <div className="text-center text-green-600 bg-green-50 p-3 rounded-lg text-sm font-medium">
//                                 You are doing great today! No pending alerts.
//                             </div>
//                         )}

//                         <button
//                             onClick={onClose}
//                             className="w-full py-3 bg-gradient-to-r from-primary-500 to-rose-500 text-white rounded-xl font-bold shadow-lg shadow-primary-500/30 hover:shadow-xl hover:scale-[1.02] transition-all"
//                         >
//                             Okay, got it!
//                         </button>
//                     </div>
//                 </motion.div>
//             </div>
//         </AnimatePresence>
//     );
// };

// export default AlertModal;

// import { X, Droplets, Footprints, CalendarDays } from 'lucide-react';
// import { motion, AnimatePresence } from 'framer-motion';

// const StatCard = ({ icon: Icon, label, value }) => (
//   <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
//     <div className="flex items-start justify-between gap-3">
//       <div>
//         <p className="text-xs font-bold text-text-muted uppercase tracking-wider">
//           {label}
//         </p>
//         <p className="mt-1 text-base font-extrabold text-primary-600">
//           {value ?? '—'}
//         </p>
//       </div>
//       <div className="rounded-lg bg-primary-50 p-2 text-primary-600">
//         <Icon size={18} />
//       </div>
//     </div>
//   </div>
// );

// const AlertModal = ({ isOpen, onClose, data }) => {
//   if (!isOpen || !data) return null;

//   return (
//     <AnimatePresence>
//       <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
//         <motion.div
//           initial={{ opacity: 0, scale: 0.9 }}
//           animate={{ opacity: 1, scale: 1 }}
//           exit={{ opacity: 0, scale: 0.9 }}
//           className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
//         >
//           <div className="bg-primary-500 p-4 flex justify-between items-center text-white">
//             <h3 className="font-bold text-lg">Daily Health Snapshot</h3>
//             <button onClick={onClose} className="hover:opacity-90">
//               <X size={20} />
//             </button>
//           </div>

//           <div className="p-6 space-y-6">
//             {/* Card Summary */}
//             <div className="space-y-3">
//               <h4 className="text-sm font-bold text-text-muted uppercase tracking-wider">
//                 My Daily Snapshot
//               </h4>

//               <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
//                 <StatCard
//                   icon={Droplets}
//                   label="Water Intake"
//                   value={data.water}
//                 />
//                 <StatCard
//                   icon={Footprints}
//                   label="Steps"
//                   value={data.steps}
//                 />
//                 <StatCard
//                   icon={CalendarDays}
//                   label="Next Appointment"
//                   value={data.nextAppointment}
//                 />
//               </div>
//             </div>

//             {/* Alerts */}
//             {data.alerts && data.alerts.length > 0 && (
//               <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
//                 <h4 className="text-sm font-bold text-orange-600 uppercase tracking-wider mb-2 flex items-center gap-2">
//                   <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
//                   Reminders
//                 </h4>
//                 <ul className="space-y-2">
//                   {data.alerts.map((alert, idx) => (
//                     <li key={idx} className="flex items-start text-sm text-gray-700">
//                       <span className="mr-2 text-orange-500 font-bold">•</span>
//                       {alert}
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             )}

//             {(!data.alerts || data.alerts.length === 0) && (
//               <div className="text-center text-green-600 bg-green-50 p-3 rounded-lg text-sm font-medium">
//                 You are doing great today! No pending alerts.
//               </div>
//             )}

//             <button
//               onClick={onClose}
//               className="w-full py-3 bg-gradient-to-r from-primary-500 to-rose-500 text-white rounded-xl font-bold shadow-lg shadow-primary-500/30 hover:shadow-xl hover:scale-[1.02] transition-all"
//             >
//               Okay, got it!
//             </button>
//           </div>
//         </motion.div>
//       </div>
//     </AnimatePresence>
//   );
// };

// export default AlertModal;

import { X, Droplets, Footprints, CalendarDays } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const StatCard = ({ icon: Icon, label, value, className = '' }) => (
  <div className={`rounded-2xl border border-gray-100 bg-white p-5 shadow-sm ${className}`}>
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-xs font-bold text-text-muted uppercase tracking-wider">
          {label}
        </p>
        <p className="mt-2 text-lg sm:text-xl font-extrabold text-gray-900">
          {value ?? '—'}
        </p>
      </div>
      <div className="rounded-xl bg-primary-50 p-2.5 text-primary-600">
        <Icon size={18} />
      </div>
    </div>
  </div>
);

const AlertModal = ({ isOpen, onClose, data, loading = false }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50">
        {/* Overlay */}
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal wrapper */}
        <div className="relative flex min-h-dvh items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.18 }}
            className="
              w-full
              max-w-[92vw]
              sm:max-w-xl
              md:max-w-2xl
              bg-white
              rounded-3xl
              shadow-2xl
              overflow-hidden
              max-h-[85vh]
            "
          >
            {/* Header */}
            <div className="bg-primary-500 p-4 sm:p-5 flex justify-between items-center text-white">
              <h3 className="font-bold text-base sm:text-lg">Daily Health Snapshot</h3>
              <button onClick={onClose} className="rounded-lg p-1 hover:bg-white/10">
                <X size={20} />
              </button>
            </div>

            {/* Body scroll */}
            <div className="p-5 sm:p-6 space-y-6 overflow-y-auto">
              <div className="space-y-3">
                <h4 className="text-xs sm:text-sm font-bold text-text-muted uppercase tracking-wider">
                  My Daily Snapshot
                </h4>

                {/* Cards grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <StatCard
                    icon={Droplets}
                    label="Water Intake"
                    value={loading ? 'Loading…' : data?.water}
                  />
                  <StatCard
                    icon={Footprints}
                    label="Steps"
                    value={loading ? 'Loading…' : data?.steps}
                  />
                  <StatCard
                    className="col-span-2 sm:col-span-1"
                    icon={CalendarDays}
                    label="Next Appointment"
                    value={loading ? 'Loading…' : (data?.nextAppointment || 'No upcoming visits')}
                  />
                </div>
              </div>

              {/* Alerts */}
              {!loading && data?.alerts?.length > 0 && (
                <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100">
                  <h4 className="text-xs sm:text-sm font-bold text-orange-700 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                    Reminders
                  </h4>
                  <ul className="space-y-2">
                    {data.alerts.map((alert, idx) => (
                      <li key={idx} className="flex items-start text-sm text-gray-700">
                        <span className="mr-2 text-orange-500 font-bold">•</span>
                        {alert}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {!loading && (!data?.alerts || data.alerts.length === 0) && (
                <div className="text-center text-green-700 bg-green-50 p-3 rounded-2xl text-sm font-medium">
                  You are doing great today! No pending alerts.
                </div>
              )}

              <button
                onClick={onClose}
                className="w-full py-3.5 bg-gradient-to-r from-primary-500 to-rose-500 text-white rounded-2xl font-bold shadow-lg shadow-primary-500/30 hover:shadow-xl hover:scale-[1.01] transition-all"
              >
                Okay, got it!
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default AlertModal;
