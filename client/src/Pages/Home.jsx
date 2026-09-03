import {
  Package,
  Users,
  ArrowDownToLine,
  ArrowUpFromLine,
} from "lucide-react";

const stats = [
  {
    title: "Total Items",
    value: "0",
    icon: Package,
  },
  {
    title: "Employees",
    value: "0",
    icon: Users,
  },
  {
    title: "Today's Issue",
    value: "0",
    icon: ArrowUpFromLine,
  },
  {
    title: "Today's Return",
    value: "0",
    icon: ArrowDownToLine,
  },
];

function Home() {
  return (
    <div className="min-h-screen bg-base-200">
      <div className="navbar bg-base-100 shadow-sm px-6">
        <div className="flex-1">
          <h1 className="text-xl font-bold">
            Chuadanga Pourashava
          </h1>
        </div>

        <div className="badge badge-primary">
          Store Management
        </div>
      </div>

      <main className="p-6">
        <div className="mb-8">
          <h2 className="text-3xl font-bold">
            Store Dashboard
          </h2>

          <p className="text-gray-500 mt-2">
            Chuadanga Pourashava Store & Inventory Management System
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.title}
                className="card bg-base-100 shadow-md"
              >
                <div className="card-body">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500">
                        {stat.title}
                      </p>

                      <h3 className="text-3xl font-bold mt-2">
                        {stat.value}
                      </h3>
                    </div>

                    <div className="rounded-full bg-primary/10 p-3">
                      <Icon className="text-primary" size={25} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 card bg-base-100 shadow-md">
          <div className="card-body">
            <h3 className="card-title">
              Welcome to Store Management System
            </h3>

            <p className="text-gray-600">
              Backend and database connection will be added
              in the next steps.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Home;