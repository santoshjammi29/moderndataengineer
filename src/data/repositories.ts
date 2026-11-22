export type RepositoryCategory =
  | "Platform"
  | "Handbooks"
  | "Azure & Blueprints"
  | "Experiments"
  | "Profile";

export interface ProjectRepository {
  slug: string;
  name: string;
  title: string;
  description: string;
  category: RepositoryCategory;
  tags: string[];
  githubUrl: string;
  portalHref?: string;
  portalLabel?: string;
  featured?: boolean;
}

const OWNER = "santoshjammi29";
const github = (slug: string) => `https://github.com/${OWNER}/${slug}`;

export const REPOSITORIES: ProjectRepository[] = [
  {
    slug: "moderndataengineer",
    name: "moderndataengineer",
    title: "Modern Data Engineer",
    description:
      "The central knowledge platform for modern data engineering, lakehouse architecture, interactive learning, architecture references, and hands-on labs.",
    category: "Platform",
    tags: ["Next.js", "React", "Lakehouse", "Search", "Learning"],
    githubUrl: github("moderndataengineer"),
    portalHref: "/",
    portalLabel: "Open platform",
    featured: true,
  },
  {
    slug: "pyspark-handbook",
    name: "pyspark-handbook",
    title: "The PySpark Handbook",
    description:
      "Production-oriented Spark and PySpark recipes, performance tuning, lakehouse patterns, and incident runbooks.",
    category: "Handbooks",
    tags: ["Apache Spark", "PySpark", "Performance", "Delta Lake"],
    githubUrl: github("pyspark-handbook"),
    portalHref: "/code-practice?db=pyspark",
    portalLabel: "Practice PySpark",
    featured: true,
  },
  {
    slug: "sql-handbook",
    name: "sql-handbook",
    title: "The SQL Handbook",
    description:
      "SQL coding exercises, query optimization, MPP architecture, logical query processing, and production incident runbooks.",
    category: "Handbooks",
    tags: ["SQL", "PostgreSQL", "DuckDB", "Query tuning"],
    githubUrl: github("sql-handbook"),
    portalHref: "/sql?tab=drills",
    portalLabel: "Practice SQL",
    featured: true,
  },
  {
    slug: "databricks-handbook",
    name: "databricks-handbook",
    title: "The Databricks Handbook",
    description:
      "Databricks platform recipes and architecture covering Unity Catalog, Delta Lake, Lakeflow, Photon, and operational runbooks.",
    category: "Handbooks",
    tags: ["Databricks", "Unity Catalog", "Delta Lake", "Photon"],
    githubUrl: github("databricks-handbook"),
    portalHref: "/code-practice/databricks",
    portalLabel: "Explore Databricks labs",
    featured: true,
  },
  {
    slug: "dbt-handbook",
    name: "dbt-handbook",
    title: "The dbt & Analytics Engineering Handbook",
    description:
      "Production dbt Core and dbt Cloud modeling, Jinja macros, incremental strategies, data tests, contracts, and dbt Mesh governance.",
    category: "Handbooks",
    tags: ["dbt", "Analytics Engineering", "Jinja", "Data quality"],
    githubUrl: github("dbt-handbook"),
    portalHref: "/modern-stack",
    portalLabel: "Explore modern stack",
  },
  {
    slug: "streaming-handbook",
    name: "streaming-handbook",
    title: "The Streaming Handbook",
    description:
      "Event streaming and ingestion patterns with Kafka, Flink, Debezium CDC, exactly-once processing, and stream-to-lakehouse designs.",
    category: "Handbooks",
    tags: ["Kafka", "Flink", "Debezium", "CDC"],
    githubUrl: github("streaming-handbook"),
    portalHref: "/architecture?tab=distributed",
    portalLabel: "Explore distributed systems",
  },
  {
    slug: "data-system-design-handbook",
    name: "data-system-design-handbook",
    title: "The Data System Design Handbook",
    description:
      "Enterprise data platform architectures, high-scale system design case studies, and trade-off matrices for senior engineers and architects.",
    category: "Handbooks",
    tags: ["System design", "Architecture", "Distributed systems"],
    githubUrl: github("data-system-design-handbook"),
    portalHref: "/architecture",
    portalLabel: "Explore architecture",
  },
  {
    slug: "dataops-cicd-handbook",
    name: "dataops-cicd-handbook",
    title: "The DataOps & CI/CD Handbook",
    description:
      "Infrastructure as Code, automated data quality gates, platform engineering, and enterprise data CI/CD pipelines.",
    category: "Handbooks",
    tags: ["DataOps", "CI/CD", "IaC", "Platform engineering"],
    githubUrl: github("dataops-cicd-handbook"),
    portalHref: "/dataops",
    portalLabel: "Explore DataOps",
  },
  {
    slug: "security-handbook",
    name: "security-handbook",
    title: "The Security Handbook",
    description:
      "Security engineering for cloud and data platforms, including Zero Trust, workload identity, DevSecOps, governance, and incident containment.",
    category: "Handbooks",
    tags: ["Zero Trust", "DevSecOps", "Identity", "Governance"],
    githubUrl: github("security-handbook"),
    portalHref: "/security",
    portalLabel: "Explore security",
  },
  {
    slug: "data-engineering-interview-handbook",
    name: "data-engineering-interview-handbook",
    title: "The Data Engineering Interview Handbook",
    description:
      "A technical interview and architecture defense reference with SQL, PySpark, cloud, Databricks, whiteboards, and production troubleshooting scenarios.",
    category: "Handbooks",
    tags: ["Interview prep", "PySpark", "SQL", "Whiteboards"],
    githubUrl: github("data-engineering-interview-handbook"),
    portalHref: "/qa-prep",
    portalLabel: "Practice interview questions",
    featured: true,
  },
  {
    slug: "azure-cheat-sheet",
    name: "azure-cheat-sheet",
    title: "The Azure Developer & Architect Cheat Sheet",
    description:
      "A practical reference for Azure and Microsoft Fabric services, architecture patterns, CLI commands, Bicep, GenAI, and FinOps runbooks.",
    category: "Azure & Blueprints",
    tags: ["Azure", "Microsoft Fabric", "Bicep", "FinOps"],
    githubUrl: github("azure-cheat-sheet"),
    portalHref: "/cheat-sheet",
    portalLabel: "Open cheat sheets",
  },
  {
    slug: "azure-databricks-project-blueprints",
    name: "azure-databricks-project-blueprints",
    title: "Azure Databricks Project Blueprints",
    description:
      "End-to-end production project blueprints, implementation patterns, and operational playbooks for Azure Databricks lakehouse platforms.",
    category: "Azure & Blueprints",
    tags: ["Azure Databricks", "Lakehouse", "Project blueprints"],
    githubUrl: github("azure-databricks-project-blueprints"),
    portalHref: "/blueprints",
    portalLabel: "Open blueprints",
  },
  {
    slug: "spark-experiments",
    name: "spark-experiments",
    title: "Spark Performance Experiments",
    description:
      "Hands-on Spark performance tuning notebooks and experiments covering query plans, DAGs, memory, partitioning, caching, and skew.",
    category: "Experiments",
    tags: ["Spark", "Notebooks", "Performance tuning", "Experiments"],
    githubUrl: github("spark-experiments"),
    portalHref: "/spark-engine",
    portalLabel: "Open Spark lab",
  },
  {
    slug: "SantoshJammiProfile",
    name: "SantoshJammiProfile",
    title: "Professional Profile & Resume",
    description:
      "Career profile, technical competencies, Microsoft certifications, project highlights, and links to the live resume.",
    category: "Profile",
    tags: ["Portfolio", "Resume", "Certifications"],
    githubUrl: github("SantoshJammiProfile"),
    portalHref: "https://santosh-jammi-resume.vercel.app/",
    portalLabel: "Open live resume",
  },
];

export const REPOSITORY_FILTERS = [
  "All",
  "Handbooks",
  "Azure & Blueprints",
  "Experiments",
  "Platform",
  "Profile",
] as const;

export type RepositoryFilter = (typeof REPOSITORY_FILTERS)[number];

export const LEARNING_PATHS = [
  {
    number: "01",
    title: "Build strong foundations",
    description:
      "Start with relational thinking, SQL execution, query design, and data platform fundamentals.",
    focus: "SQL · Modeling · Data quality",
    href: "/sql?tab=drills",
    repository: "sql-handbook",
    repositoryLabel: "SQL Handbook",
  },
  {
    number: "02",
    title: "Master distributed compute",
    description:
      "Move into DataFrames, Spark execution, shuffle behavior, memory pressure, and performance tuning.",
    focus: "PySpark · Spark internals · Performance",
    href: "/code-practice?db=pyspark",
    repository: "pyspark-handbook",
    repositoryLabel: "PySpark Handbook",
  },
  {
    number: "03",
    title: "Engineer the Lakehouse",
    description:
      "Connect Delta Lake, Databricks, governance, orchestration, and production project patterns.",
    focus: "Databricks · Delta Lake · Lakehouse",
    href: "/code-practice/databricks",
    repository: "databricks-handbook",
    repositoryLabel: "Databricks Handbook",
  },
  {
    number: "04",
    title: "Stream, secure, and operate",
    description:
      "Design reliable ingestion, CDC, deployment pipelines, identity boundaries, and operational controls.",
    focus: "Kafka · DataOps · Security",
    href: "/dataops",
    repository: "dataops-cicd-handbook",
    repositoryLabel: "DataOps Handbook",
  },
  {
    number: "05",
    title: "Design and defend systems",
    description:
      "Bring the pieces together through architecture trade-offs, whiteboards, production scenarios, and interview practice.",
    focus: "System design · Architecture · Interviews",
    href: "/architecture",
    repository: "data-system-design-handbook",
    repositoryLabel: "System Design Handbook",
  },
] as const;
