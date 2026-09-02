export default function AdminDashboard() {
  return (
    <div className="mx-auto max-w-7xl">
      {/* Heading */}
      <div className="mb-8">
        <p className="mb-1 text-sm font-medium text-blue-600">
          Overview
        </p>

        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Dashboard
        </h1>

        <p className="mt-2 text-slate-500">
          Monitor your support system and manage everything from one place.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {/* Total Tickets */}
        <div className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Total Tickets
              </p>

              <h2 className="mt-3 text-3xl font-bold text-slate-900">
                250
              </h2>

              <p className="mt-2 text-xs font-medium text-emerald-600">
                ↑ 12% from last month
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-xl text-blue-600">
              ▤
            </div>
          </div>
        </div>

        {/* Open Tickets */}
        <div className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Open Tickets
              </p>

              <h2 className="mt-3 text-3xl font-bold text-slate-900">
                80
              </h2>

              <p className="mt-2 text-xs font-medium text-amber-600">
                32% of total tickets
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-xl text-amber-600">
              ◷
            </div>
          </div>
        </div>

        {/* Customers */}
        <div className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Customers
              </p>

              <h2 className="mt-3 text-3xl font-bold text-slate-900">
                95
              </h2>

              <p className="mt-2 text-xs font-medium text-emerald-600">
                ↑ 8% from last month
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-xl text-emerald-600">
              ♙
            </div>
          </div>
        </div>

        {/* Managers */}
        <div className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Managers
              </p>

              <h2 className="mt-3 text-3xl font-bold text-slate-900">
                20
              </h2>

              <p className="mt-2 text-xs font-medium text-slate-500">
                Active support managers
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 text-xl text-violet-600">
              ♙
            </div>
          </div>
        </div>
      </div>

      {/* Main dashboard content */}
      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Ticket Summary */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-1">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-slate-900">
                Ticket Summary
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Current ticket status
              </p>
            </div>

            <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
              View all
            </button>
          </div>

          <div className="mt-7 space-y-5">
            <TicketStatus
              label="Open"
              value={80}
              percentage="32%"
              bar="w-[32%]"
              bg="bg-blue-500"
            />

            <TicketStatus
              label="Pending"
              value={30}
              percentage="12%"
              bar="w-[12%]"
              bg="bg-amber-500"
            />

            <TicketStatus
              label="In Progress"
              value={40}
              percentage="16%"
              bar="w-[16%]"
              bg="bg-violet-500"
            />

            <TicketStatus
              label="Closed"
              value={100}
              percentage="40%"
              bar="w-[40%]"
              bg="bg-emerald-500"
            />
          </div>
        </div>

        {/* Recent Tickets */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-slate-900">
                Recent Tickets
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Latest support requests
              </p>
            </div>

            <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
              View all
            </button>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 text-xs uppercase tracking-wider text-slate-400">
                  <th className="pb-4 font-medium">Ticket</th>
                  <th className="pb-4 font-medium">Customer</th>
                  <th className="pb-4 font-medium">Priority</th>
                  <th className="pb-4 font-medium">Status</th>
                  <th className="pb-4 text-right font-medium">
                    ID
                  </th>
                </tr>
              </thead>

              <tbody>
                <TicketRow
                  title="Unable to login"
                  customer="Fahim Hasan"
                  priority="High"
                  priorityClass="bg-orange-50 text-orange-600"
                  status="Open"
                  statusClass="bg-blue-50 text-blue-600"
                  id="#102"
                />

                <TicketRow
                  title="Payment problem"
                  customer="Karim Ahmed"
                  priority="Urgent"
                  priorityClass="bg-red-50 text-red-600"
                  status="Pending"
                  statusClass="bg-amber-50 text-amber-600"
                  id="#101"
                />

                <TicketRow
                  title="Product issue"
                  customer="Nusrat Jahan"
                  priority="Medium"
                  priorityClass="bg-violet-50 text-violet-600"
                  status="In Progress"
                  statusClass="bg-violet-50 text-violet-600"
                  id="#100"
                />
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Bottom cards */}
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Quick Actions */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-slate-900">
            Quick Actions
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Frequently used admin actions
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <a
              href="/admin/tickets"
              className="rounded-xl border border-slate-200 p-4 transition hover:border-blue-200 hover:bg-blue-50"
            >
              <div className="text-lg text-blue-600">▤</div>
              <p className="mt-2 text-sm font-medium text-slate-900">
                View Tickets
              </p>
            </a>

            <a
              href="/admin/products"
              className="rounded-xl border border-slate-200 p-4 transition hover:border-blue-200 hover:bg-blue-50"
            >
              <div className="text-lg text-blue-600">▣</div>
              <p className="mt-2 text-sm font-medium text-slate-900">
                Manage Products
              </p>
            </a>

            <a
              href="/admin/managers/pending"
              className="rounded-xl border border-slate-200 p-4 transition hover:border-blue-200 hover:bg-blue-50"
            >
              <div className="text-lg text-blue-600">♙</div>
              <p className="mt-2 text-sm font-medium text-slate-900">
                Manager Requests
              </p>
            </a>

            <a
              href="/admin/reports"
              className="rounded-xl border border-slate-200 p-4 transition hover:border-blue-200 hover:bg-blue-50"
            >
              <div className="text-lg text-blue-600">◫</div>
              <p className="mt-2 text-sm font-medium text-slate-900">
                View Reports
              </p>
            </a>
          </div>
        </div>

        {/* System Overview */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-slate-900">
            System Overview
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Current platform statistics
          </p>

          <div className="mt-5 space-y-4">
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
              <div>
                <p className="text-sm font-medium text-slate-900">
                  Total Users
                </p>
                <p className="text-xs text-slate-500">
                  All registered users
                </p>
              </div>

              <span className="text-lg font-bold text-slate-900">
                120
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
              <div>
                <p className="text-sm font-medium text-slate-900">
                  Products
                </p>
                <p className="text-xs text-slate-500">
                  Available products
                </p>
              </div>

              <span className="text-lg font-bold text-slate-900">
                15
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
              <div>
                <p className="text-sm font-medium text-slate-900">
                  Urgent Tickets
                </p>
                <p className="text-xs text-slate-500">
                  Require immediate attention
                </p>
              </div>

              <span className="text-lg font-bold text-red-600">
                8
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Ticket status component */
function TicketStatus({
  label,
  value,
  percentage,
  bar,
  bg,
}: {
  label: string;
  value: number;
  percentage: string;
  bar: string;
  bg: string;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${bg}`} />
          <span className="text-sm text-slate-600">{label}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-900">
            {value}
          </span>

          <span className="text-xs text-slate-400">
            {percentage}
          </span>
        </div>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${bar} ${bg}`} />
      </div>
    </div>
  );
}

/* Recent ticket row */
function TicketRow({
  title,
  customer,
  priority,
  priorityClass,
  status,
  statusClass,
  id,
}: {
  title: string;
  customer: string;
  priority: string;
  priorityClass: string;
  status: string;
  statusClass: string;
  id: string;
}) {
  return (
    <tr className="border-b border-slate-100 last:border-0">
      <td className="py-4">
        <p className="text-sm font-medium text-slate-900">
          {title}
        </p>
      </td>

      <td className="py-4">
        <p className="text-sm text-slate-500">{customer}</p>
      </td>

      <td className="py-4">
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${priorityClass}`}
        >
          {priority}
        </span>
      </td>

      <td className="py-4">
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClass}`}
        >
          {status}
        </span>
      </td>

      <td className="py-4 text-right">
        <span className="text-sm font-medium text-slate-500">
          {id}
        </span>
      </td>
    </tr>
  );
}