import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db/client";
import { SearchBar } from "@/components/search/SearchBar";

const STEPS = [
  {
    title: "Discover",
    description: "Search for everyday products, including sellers with no online presence.",
  },
  {
    title: "Compare",
    description: "See prices side by side, with the best-supported affordable option highlighted.",
  },
  {
    title: "Verify",
    description: "Every price shows its source, freshness, and community confirmations.",
  },
];

export default async function HomePage() {
  const products = await prisma.product.findMany({ orderBy: { name: "asc" }, take: 8 });

  return (
    <main className="flex flex-col">
      <section className="hero-surface animate-fade-in">
        <div className="container-page flex flex-col items-center gap-6 py-16 text-center sm:py-24">
          <Image src="/sokowise-logo-on-light.png" alt="SokoWise" width={104} height={104} priority />
          <h1 className="text-3xl font-bold tracking-tight text-ink-900 sm:text-5xl">SokoWise</h1>
          <p className="max-w-md text-balance text-sm text-slate-600 sm:text-base">
            Find, compare, and verify affordable local prices — reported by sellers and your
            community.
          </p>
          <SearchBar />
        </div>
      </section>

      <section className="container-page py-12">
        <div className="grid gap-4 sm:grid-cols-3">
          {STEPS.map((step, index) => (
            <div
              key={step.title}
              className="rounded-2xl border border-border bg-white p-5 shadow-sm shadow-ink-900/5"
            >
              <span className="flex size-8 items-center justify-center rounded-full bg-green-600/10 text-sm font-bold text-green-600">
                {index + 1}
              </span>
              <p className="mt-3 font-semibold text-ink-900">{step.title}</p>
              <p className="mt-1 text-sm text-slate-600">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {products.length > 0 ? (
        <section className="container-page pb-16">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Popular products
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="group flex items-center gap-3 rounded-xl border border-border bg-white p-3.5 shadow-sm shadow-ink-900/5 transition-all hover:-translate-y-0.5 hover:border-green-600/40 hover:shadow-md"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-green-600/10 text-sm font-bold text-green-600">
                  {product.name.charAt(0)}
                </span>
                <span>
                  <span className="block text-sm font-semibold text-ink-900 group-hover:text-green-600">
                    {product.name}
                  </span>
                  <span className="block text-xs text-slate-500">{product.unit}</span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
