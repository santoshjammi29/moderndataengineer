import type { Metadata } from "next";
import { RepositoryHub } from "./repository-hub";

export const metadata: Metadata = {
  title: "Repository Library | Modern Data Engineer",
  description:
    "Explore the public GitHub project ecosystem for modern data engineering, PySpark, SQL, Databricks, dbt, streaming, DataOps, security, and lakehouse architecture.",
  alternates: {
    canonical: "https://moderndataengineer.uk/repositories",
  },
  openGraph: {
    title: "Repository Library | Modern Data Engineer",
    description:
      "A curated directory of the public handbooks, project blueprints, experiments, and learning tools in the Modern Data Engineer ecosystem.",
    url: "https://moderndataengineer.uk/repositories",
    type: "website",
  },
};

export default function RepositoryLibraryPage() {
  return <RepositoryHub />;
}
