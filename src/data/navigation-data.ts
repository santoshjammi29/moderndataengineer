import React from "react";
import {
  Home,
  BookOpen,
  FileCode2,
  FileText,
  Layers,
  MessageSquare,
  Compass,
  User,
  Workflow,
  Sparkles,
  Terminal,
  Database,
  Network,
  GitBranch,
  ShieldCheck,
  Cpu,
  Route,
  Activity,
  Code2,
  GraduationCap,
  Briefcase,
  Zap,
  Cloud,
} from "lucide-react";

export interface SubNavItem {
  label: string;
  href: string;
  badge?: string;
  icon?: React.ElementType;
}

export interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  pill?: { text: string; variant: "easy" | "medium" | "hard" | "architect" | "new" | "info" };
  matches?: string[];
  subItems?: SubNavItem[];
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export interface FlatNavPage {
  id: string;
  label: string;
  shortLabel: string;
  href: string;
  category: string;
  categoryColor: string;
  icon: React.ElementType;
  badge?: string;
}

export const NAV_GROUPS: NavGroup[] = [
  {
    title: "Platform",
    items: [
      { label: "Home Dashboard", href: "/", icon: Home },
      {
        label: "Cloud × Table Matrix",
        href: "/modern-stack",
        icon: Zap,
        pill: { text: "Matrix", variant: "easy" },
        subItems: [
          { label: "Cloud Matrix", href: "/modern-stack?tab=compatibility" },
          { label: "FinOps Playbooks", href: "/modern-stack?tab=cost" },
          { label: "Modern Blueprints", href: "/modern-stack?tab=blueprints" },
          { label: "Polyglot Matrix", href: "/modern-stack?tab=matrix" },
        ],
      },
      {
        label: "Architecture Scenarios",
        href: "/architecture",
        icon: Layers,
        pill: { text: "3.2k+", variant: "architect" },
        subItems: [
          { label: "Whiteboard Mastery Hub", href: "/whiteboards", badge: "42 Master" },
          { label: "System Blueprints", href: "/architecture?tab=scenarios", badge: "3.2k" },
          { label: "Whiteboard Diagrams", href: "/architecture?tab=diagrams", badge: "42" },
          { label: "Python Runbooks", href: "/architecture?tab=python", badge: "42" },
        ],
      },
      {
        label: "Spark Engine Lab",
        href: "/spark-engine",
        icon: Cpu,
        pill: { text: "Spark", variant: "medium" },
        matches: ["/spark-engine", "/spark-catalyst", "/visualizer"],
        subItems: [
          { label: "Engine & Memory Lab", href: "/spark-engine" },
          { label: "Catalyst & Visualizer", href: "/spark-catalyst", badge: "Live" },
          { label: "Execution Visualizer", href: "/visualizer", badge: "Simulator" },
        ],
      },
      {
        label: "DataOps & CI/CD",
        href: "/dataops",
        icon: Workflow,
        pill: { text: "E2E", variant: "info" },
        subItems: [
          { label: "Tool Connectivity", href: "/dataops?tab=connectivity" },
          { label: "CI/CD Pipelines", href: "/dataops?tab=cicd" },
          { label: "360° SDLC Lifecycle", href: "/dataops?tab=lifecycle", badge: "152 Controls" },
          { label: "Architecture Flow", href: "/dataops?tab=diagram" },
        ],
      },
    ],
  },
  {
    title: "Knowledge & Drills",
    items: [
      {
        label: "Concepts Glossary",
        href: "/concepts",
        icon: BookOpen,
        pill: { text: "679", variant: "easy" },
        matches: ["/concepts", "/mindmap"],
        subItems: [
          { label: "Glossary & Cards", href: "/concepts", badge: "679" },
          { label: "Concepts Mind Map", href: "/concepts?view=mindmap", badge: "14 Pillars" },
          { label: "Flashcards Study", href: "/concepts?view=study", badge: "Recall" },
        ],
      },
      {
        label: "Code Practice",
        href: "/code-practice",
        icon: Code2,
        pill: { text: "Drills", variant: "medium" },
        subItems: [
          { label: "PySpark Drills", href: "/code-practice?db=pyspark", badge: "51" },
          { label: "Spark SQL Drills", href: "/code-practice?db=sparksql", badge: "50" },
          { label: "T-SQL Drills", href: "/code-practice?db=mssql", badge: "35" },
          { label: "Python & Polars", href: "/code-practice?db=python", badge: "42" },
          { label: "Databricks Coding", href: "/code-practice/databricks", badge: "148" },
        ],
      },
      {
        label: "Cheat Sheets",
        href: "/cheat-sheet",
        icon: FileCode2,
        pill: { text: "Sheets", variant: "medium" },
        subItems: [
          { label: "Production Runbooks", href: "/cheat-sheet?tab=runbooks", badge: "76" },
          { label: "Databricks Suites", href: "/cheat-sheet?tab=databricks", badge: "48" },
          { label: "A4 PDF Reference Hub", href: "/cheat-sheet?tab=pdf_hub", badge: "7 PDFs" },
        ],
      },
    ],
  },
  {
    title: "Interviews & Roadmaps",
    items: [
      { label: "Question Drill Bank", href: "/qa-prep", icon: MessageSquare, pill: { text: "6.8k+", variant: "hard" } },
      {
        label: "Guided Learning",
        href: "/guided-learning",
        icon: Route,
        pill: { text: "Tracks", variant: "info" },
        matches: ["/guided-learning", "/learning-paths"],
        subItems: [
          { label: "Topic Tracks", href: "/guided-learning" },
          { label: "Career Curricula", href: "/guided-learning?tab=curricula", badge: "12 Paths" },
          { label: "Lab & Topic Tree", href: "/guided-learning?tab=tree", badge: "130 Deep Dives" },
        ],
      },
      { label: "Target Company Intel", href: "/company-research", icon: Briefcase, pill: { text: "156+", variant: "new" } },
    ],
  },
  {
    title: "Workspace",
    items: [
      { label: "My Studio", href: "/studio", icon: User, pill: { text: "Personal", variant: "info" } },
    ],
  },
];

export const ALL_FLAT_PAGES_AND_SUBPAGES: FlatNavPage[] = [
  { id: "home", label: "Home Dashboard", shortLabel: "Home", href: "/", category: "Portal", categoryColor: "blue", icon: Home },
  
  // Learning Journey
  { id: "guided-learning", label: "Guided Topic Tracks", shortLabel: "Topic Tracks", href: "/guided-learning", category: "Journey", categoryColor: "indigo", icon: Route, badge: "Path" },
  { id: "learning-tree", label: "Master Lab & Topic Tree", shortLabel: "Lab Tree", href: "/guided-learning?tab=tree", category: "Journey", categoryColor: "indigo", icon: GitBranch, badge: "130 Dives" },
  { id: "learn", label: "Learning Portal", shortLabel: "Learn", href: "/learn", category: "Journey", categoryColor: "indigo", icon: Route, badge: "Learn" },
  { id: "learning-paths", label: "Career Curricula", shortLabel: "Career Paths", href: "/learning-paths", category: "Journey", categoryColor: "indigo", icon: GraduationCap, badge: "Curricula" },
  
  // Concepts & Foundations (Clubbed)
  { id: "concepts", label: "Concepts Glossary", shortLabel: "Glossary", href: "/concepts", category: "Concepts", categoryColor: "emerald", icon: BookOpen, badge: "679" },
  { id: "mindmap", label: "Concepts Mind Map", shortLabel: "Mind Map", href: "/concepts?view=mindmap", category: "Concepts", categoryColor: "emerald", icon: GitBranch, badge: "Mind Map" },
  { id: "modern-concepts", label: "Core Lakehouse Concepts", shortLabel: "Lakehouse Concepts", href: "/modern-stack?tab=concepts", category: "Concepts", categoryColor: "emerald", icon: Zap, badge: "FinOps" },
  
  // Architecture & Systems (Clubbed)
  { id: "whiteboards", label: "Whiteboard Mastery Hub", shortLabel: "Whiteboards", href: "/whiteboards", category: "Architecture", categoryColor: "purple", icon: Sparkles, badge: "42 Blueprints" },
  { id: "arch-scenarios", label: "System Scenarios", shortLabel: "Scenarios", href: "/architecture?tab=scenarios", category: "Architecture", categoryColor: "purple", icon: Layers, badge: "3.2k+" },
  { id: "spark-engine", label: "Spark Engine Lab", shortLabel: "Spark Lab", href: "/spark-engine", category: "Architecture", categoryColor: "purple", icon: Cpu, badge: "Lab" },
  { id: "spark-catalyst", label: "Catalyst Optimizer & Visualizer", shortLabel: "Catalyst Lab", href: "/spark-catalyst", category: "Architecture", categoryColor: "purple", icon: Cpu, badge: "Live" },
  { id: "spark-visualizer", label: "Spark Execution Visualizer", shortLabel: "Visualizer", href: "/visualizer", category: "Architecture", categoryColor: "purple", icon: Activity, badge: "Simulator" },
  { id: "modern-stack", label: "Modern Stack & FinOps", shortLabel: "Modern Stack", href: "/modern-stack", category: "Architecture", categoryColor: "purple", icon: Zap, badge: "FinOps" },
  { id: "modern-compat", label: "Cloud × Table Compatibility", shortLabel: "Cloud Matrix", href: "/modern-stack?tab=compatibility", category: "Architecture", categoryColor: "purple", icon: Zap, badge: "Matrix" },
  { id: "dataops-conn", label: "Tool Connectivity & Secrets", shortLabel: "Tool Secrets", href: "/dataops?tab=connectivity", category: "Architecture", categoryColor: "purple", icon: Network, badge: "Secrets" },
  { id: "dataops-cicd", label: "CI/CD Alternatives & Pipelines", shortLabel: "CI/CD Pipelines", href: "/dataops?tab=cicd", category: "Architecture", categoryColor: "purple", icon: GitBranch, badge: "CI/CD" },
  { id: "dataops-lifecycle", label: "360° SDLC Lifecycle Playbook", shortLabel: "SDLC Lifecycle", href: "/dataops?tab=lifecycle", category: "Architecture", categoryColor: "purple", icon: Workflow, badge: "152 Controls" },
  
  // Coding & Runbooks (Clubbed)
  { id: "cheat-sheet", label: "Production Cheat Sheet", shortLabel: "Cheat Sheet", href: "/cheat-sheet", category: "Coding", categoryColor: "cyan", icon: FileCode2, badge: "Runbooks" },
  { id: "dbx-cheat-sheet", label: "Databricks Cheat Sheets", shortLabel: "DBX Sheets", href: "/cheat-sheet?tab=databricks", category: "Coding", categoryColor: "cyan", icon: Terminal, badge: "48" },
  { id: "pdf-hub", label: "A4 PDF Reference Hub", shortLabel: "PDF Hub", href: "/cheat-sheet?tab=pdf_hub", category: "Coding", categoryColor: "cyan", icon: FileText, badge: "7 PDFs" },
  { id: "code-pyspark", label: "PySpark Drills", shortLabel: "PySpark", href: "/code-practice?db=pyspark", category: "Coding", categoryColor: "cyan", icon: Code2, badge: "51" },
  { id: "code-sparksql", label: "Spark SQL Drills", shortLabel: "Spark SQL", href: "/code-practice?db=sparksql", category: "Coding", categoryColor: "cyan", icon: Database, badge: "50" },
  { id: "code-mssql", label: "T-SQL Drills", shortLabel: "T-SQL", href: "/code-practice?db=mssql", category: "Coding", categoryColor: "cyan", icon: Database, badge: "35" },
  { id: "code-python", label: "Python & Polars", shortLabel: "Python & Polars", href: "/code-practice?db=python", category: "Coding", categoryColor: "cyan", icon: Code2, badge: "42" },
  { id: "code-databricks", label: "Databricks Coding Hub", shortLabel: "Databricks", href: "/code-practice/databricks", category: "Coding", categoryColor: "cyan", icon: Terminal, badge: "148" },
  { id: "code-matrix", label: "Polyglot Code Matrix", shortLabel: "Polyglot Matrix", href: "/modern-stack?tab=matrix", category: "Coding", categoryColor: "cyan", icon: FileCode2, badge: "Matrix" },
  
  // Visual Blueprints & Diagrams (Clubbed)
  { id: "arch-diagrams", label: "Whiteboard Blueprints", shortLabel: "Blueprints", href: "/architecture?tab=diagrams", category: "Images & Diagrams", categoryColor: "teal", icon: Sparkles, badge: "42" },
  { id: "dataops-diagram", label: "Whiteboard Architecture Flow", shortLabel: "Architecture Flow", href: "/dataops?tab=diagram", category: "Images & Diagrams", categoryColor: "teal", icon: Layers, badge: "Flow" },
  { id: "modern-blueprints", label: "Modern Stack Blueprints", shortLabel: "Stack Blueprints", href: "/modern-stack?tab=blueprints", category: "Images & Diagrams", categoryColor: "teal", icon: Cpu, badge: "Blueprints" },
  
  // Interview Drill Hub / Q&A (Clubbed) - Target Company Intel at the last
  { id: "qa-prep", label: "Question Drill Bank", shortLabel: "Q&A Drill Bank", href: "/qa-prep", category: "Q&A", categoryColor: "amber", icon: MessageSquare, badge: "6.8k+" },
  { id: "company-research", label: "Target Company Intel", shortLabel: "Company Intel", href: "/company-research", category: "Q&A", categoryColor: "amber", icon: Briefcase, badge: "156" },
  
  // Workspace
  { id: "studio", label: "My Studio", shortLabel: "My Studio", href: "/studio", category: "Workspace", categoryColor: "indigo", icon: User, badge: "Personal" },
];

/**
 * Checks if a specific sub-navigation URL is currently active.
 */
export function isSubHrefActive(pathname: string | null, searchParams: URLSearchParams | null, subHref: string): boolean {
  if (!pathname) return false;
  const [subPath, subQuery] = subHref.split("?");
  if (pathname !== subPath) return false;

  if (!subQuery) {
    if (!searchParams) return true;
    const currentTab = searchParams.get("tab");
    const currentDb = searchParams.get("db");
    const currentView = searchParams.get("view");
    if (!currentTab && !currentDb && !currentView) return true;
    return false;
  }

  if (!searchParams) return false;
  const subParams = new URLSearchParams(subQuery);
  for (const [key, val] of subParams.entries()) {
    const currentVal = searchParams.get(key);
    // Defaults for pages without explicit search params in URL
    if (pathname === "/architecture" && key === "tab" && val === "scenarios" && !currentVal) {
      return true;
    }
    if (pathname === "/code-practice" && key === "db" && val === "pyspark" && !currentVal) {
      return true;
    }
    if (pathname === "/dataops" && key === "tab" && val === "connectivity" && !currentVal) {
      return true;
    }
    if (pathname === "/cheat-sheet" && key === "tab" && val === "runbooks" && !currentVal) {
      return true;
    }
    if (pathname === "/modern-stack" && key === "tab" && val === "compatibility" && !currentVal) {
      return true;
    }
    if (pathname === "/concepts" && key === "view" && val === "glossary" && !currentVal) {
      return true;
    }
    if (pathname === "/guided-learning" && key === "tab" && val === "topics" && !currentVal) {
      return true;
    }
    if (currentVal !== val) return false;
  }
  return true;
}

export interface SitemapSection {
  title: string;
  badge?: string;
  pages: {
    label: string;
    href: string;
    badge?: string;
    subpages?: { label: string; href: string; badge?: string }[];
  }[];
}

export const SITEMAP_SECTIONS: SitemapSection[] = [
  {
    title: "Platform & Systems",
    badge: "Core Architecture",
    pages: [
      { label: "Home Dashboard", href: "/" },
      {
        label: "Architecture Hub",
        href: "/architecture",
        badge: "3.2k+",
        subpages: [
          { label: "System Blueprints", href: "/architecture?tab=scenarios", badge: "3.2k" },
          { label: "Whiteboard Diagrams", href: "/architecture?tab=diagrams", badge: "42" },
          { label: "Python Runbooks", href: "/architecture?tab=python", badge: "42" },
        ],
      },
      {
        label: "Spark Engine Lab",
        href: "/spark-engine",
        badge: "AQE & Memory",
        subpages: [
          { label: "Engine & Memory Lab", href: "/spark-engine" },
          { label: "Catalyst Optimizer & Visualizer", href: "/spark-catalyst", badge: "Live" },
          { label: "Execution Visualizer", href: "/visualizer", badge: "Simulator" },
        ],
      },
      {
        label: "Cloud × Table Matrix",
        href: "/modern-stack",
        badge: "FinOps",
        subpages: [
          { label: "Compatibility Matrix", href: "/modern-stack?tab=compatibility" },
          { label: "FinOps Cost Playbooks", href: "/modern-stack?tab=cost", badge: "15" },
          { label: "Stack Blueprints", href: "/modern-stack?tab=blueprints" },
          { label: "Polyglot Code Matrix", href: "/modern-stack?tab=matrix", badge: "15" },
        ],
      },
      {
        label: "DataOps & CI/CD",
        href: "/dataops",
        badge: "E2E",
        subpages: [
          { label: "Tool Connectivity & Secrets", href: "/dataops?tab=connectivity" },
          { label: "CI/CD Alternatives & Pipelines", href: "/dataops?tab=cicd" },
          { label: "Lifecycle Playbook", href: "/dataops?tab=lifecycle" },
          { label: "Whiteboard Architecture Flow", href: "/dataops?tab=diagram" },
        ],
      },
    ],
  },
  {
    title: "Knowledge & Drills",
    badge: "Foundations",
    pages: [
      {
        label: "Concepts Glossary",
        href: "/concepts",
        badge: "679",
        subpages: [
          { label: "Glossary & Cards", href: "/concepts", badge: "679" },
          { label: "Concepts Mind Map", href: "/concepts?view=mindmap", badge: "14 Pillars" },
          { label: "Flashcards Study", href: "/concepts?view=study", badge: "Recall" },
        ],
      },
      {
        label: "Guided Learning",
        href: "/guided-learning",
        badge: "Tracks & Roadmaps",
        subpages: [
          { label: "Specialized Topic Tracks", href: "/guided-learning", badge: "14 Tracks" },
          { label: "Career Curricula", href: "/guided-learning?tab=curricula", badge: "12 Paths" },
          { label: "Lab & Topic Tree", href: "/guided-learning?tab=tree", badge: "130 Deep Dives" },
        ],
      },
      { label: "Question Drill Bank", href: "/qa-prep", badge: "6.8k+ Scenarios" },
      { label: "Target Company Intel", href: "/company-research", badge: "156 GCC" },
    ],
  },
  {
    title: "Code & Incident Runbooks",
    badge: "178+ Drills",
    pages: [
      {
        label: "Code Practice Hub",
        href: "/code-practice",
        badge: "Multi-Engine",
        subpages: [
          { label: "PySpark Drills", href: "/code-practice?db=pyspark", badge: "51" },
          { label: "Spark SQL Drills", href: "/code-practice?db=sparksql", badge: "50" },
          { label: "T-SQL Drills", href: "/code-practice?db=mssql", badge: "35" },
          { label: "Python & Polars", href: "/code-practice?db=python", badge: "42" },
          { label: "Databricks Coding Hub", href: "/code-practice/databricks", badge: "148" },
        ],
      },
      {
        label: "Production Cheat Sheets",
        href: "/cheat-sheet",
        badge: "Runbooks",
        subpages: [
          { label: "Production Runbooks", href: "/cheat-sheet?tab=runbooks", badge: "76" },
          { label: "Databricks Cheat Sheets", href: "/cheat-sheet?tab=databricks", badge: "48" },
          { label: "A4 PDF Reference Hub", href: "/cheat-sheet?tab=pdf_hub", badge: "7 Master PDFs" },
        ],
      },
    ],
  },
  {
    title: "Workspace & Progress",
    badge: "Personal",
    pages: [
      { label: "My Learning Studio", href: "/studio", badge: "Bookmarks & Tracker" },
    ],
  },
];
