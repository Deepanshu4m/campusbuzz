const Skeleton = ({ className = "" }) => (
  <div className={`animate-pulse bg-gray-200 rounded-md ${className}`} />
);

export const EventCardSkeleton = () => (
  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
    <Skeleton className="w-full h-40 rounded-none" />
    <div className="p-4 flex flex-col gap-3">
      <div className="flex justify-between">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-14" />
      </div>
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-4/5" />
      <Skeleton className="h-9 w-full mt-2 rounded-lg" />
    </div>
  </div>
);

export const RegistrationCardSkeleton = () => (
  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex flex-col gap-3">
    <div className="flex justify-between">
      <div className="flex flex-col gap-2 flex-1">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-3 w-1/3" />
        <div className="flex gap-2 mt-1">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      </div>
      <Skeleton className="h-4 w-16" />
    </div>
  </div>
);

export const AnalyticsRowSkeleton = () => (
  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1 flex flex-col gap-2">
        <Skeleton className="h-5 w-1/2" />
        <Skeleton className="h-3 w-1/3" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-7 w-12 rounded-lg" />
        <Skeleton className="h-7 w-14 rounded-lg" />
        <Skeleton className="h-7 w-20 rounded-lg" />
      </div>
    </div>
    <div className="mt-4 grid grid-cols-3 gap-3">
      <Skeleton className="h-16 rounded-xl" />
      <Skeleton className="h-16 rounded-xl" />
      <Skeleton className="h-16 rounded-xl" />
    </div>
  </div>
);

export const TableRowSkeleton = () => (
  <tr className="border-t">
    <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
    <td className="px-4 py-3"><Skeleton className="h-4 w-32" /></td>
    <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
    <td className="px-4 py-3"><Skeleton className="h-5 w-16 rounded-full" /></td>
    <td className="px-4 py-3"><Skeleton className="h-7 w-24 rounded-lg" /></td>
  </tr>
);

export default Skeleton;