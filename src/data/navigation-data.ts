import { CONTENT_COUNTS, formatContentCount } from "@/data/content-counts";
import React from "react";
import {
  Home,
  BookOpen,
  FileCode2,
  Layers,
  MessageSquare,
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
  Search,
  FolderGit2,
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
    title: "Start",
    items: [
      { label: "Home", href: "/", icon: Home },
      { label: "Repository Library", href: "/repositories", icon: FolderGit2, matches: ["/repositories", "/repos"], pill: { text: "14 projects", variant: "info" } },
      {
        label: "Search All Content",
        href: "/search-topics",
        icon: Search,
        matches: ["/search-topics", "/browser"],
        pill: { text: "⌘K", variant: "info" },
      },
    ],
  },
  {
    title: "Learn",
    items: [
      {
        label: "Guided Learning",
        href: "/guided-learning",
        icon: Route,
        matches: ["/guided-learning", "/learn", "/plan"],
        pill: { text: "Tracks", variant: "info" },
        subItems: [
          { label: "Topic Tracks", href: "/guided-learning" },
          { label: "Career Curricula", href: "/guided-learning?tab=curricula", badge: `${CONTENT_COUNTS.learningPaths} Paths` },
          { label: "Topic Tree", href: "/guided-learning?tab=tree", badge: `${CONTENT_COUNTS.deepDiveTopics} Dives` },
        ],
      },
      {
        label: "Concepts",
        href: "/concepts",
        icon: BookOpen,
        matches: ["/concepts", "/mindmap"],
        pill: { text: `${formatContentCount(CONTENT_COUNTS.concepts)}`, variant: "easy" },
        subItems: [
          { label: "Glossary & Cards", href: "/concepts", badge: `${formatContentCount(CONTENT_COUNTS.concepts)}` },
          { label: "Mind Map", href: "/mindmap", badge: "Interactive" },
          { label: "Flashcards", href: "/concepts?view=study", badge: "Recall" },
        ],
      },
      {
        label: "Learning Paths",
        href: "/learning-paths",
        icon: GraduationCap,
        pill: { text: `${CONTENT_COUNTS.learningPaths} Paths`, variant: "info" },
      },
      {
        label: "Mastery Stages Hub",
        href: "/stages",
        icon: Workflow,
        pill: { text: "Stages", variant: "info" },
        subItems: [
          { label: "Mastery Journey", href: "/stages?tab=mastery" },
          { label: "Lakehouse Flow", href: "/stages?tab=lakehouse" },
          { label: "SDLC Playbook", href: "/stages?tab=sdlc", badge: `${CONTENT_COUNTS.sdlcControls} Controls` },
          { label: "Catalyst Pipeline", href: "/stages?tab=catalyst" },
          { label: "Production Flows", href: "/stages?tab=flows", badge: "8 Flows" },
        ],
      },
      {
        label: "SQL Study Guide",
        href: "/sql",
        icon: Database,
        matches: ["/sql", "/sql-study-guide"],
        pill: { text: "Guide", variant: "new" },
        subItems: [
          { label: "Execution Stepper", href: "/sql?tab=stepper", badge: "S-F-W-G-H-O" },
          { label: "Window Visualizer", href: "/sql?tab=window", badge: "Live" },
          { label: "Rosetta Stone", href: "/sql?tab=rosetta", badge: "5 Engines" },
          { label: "Practice Drills", href: "/sql?tab=drills", badge: "4 Tiers" },
          { label: "Architecture Runbooks", href: "/sql?tab=runbooks", badge: "Prod" },
        ],
      },
    ],
  },
  {
    title: "Practise",
    items: [
      {
        label: "Architecture",
        href: "/architecture",
        icon: Layers,
        pill: { text: `${formatContentCount(CONTENT_COUNTS.scenarios)}+`, variant: "architect" },
        subItems: [
          { label: "Scenarios", href: "/architecture?tab=scenarios", badge: `${formatContentCount(CONTENT_COUNTS.scenarios)}` },
          { label: "Diagrams", href: "/architecture?tab=diagrams", badge: `${CONTENT_COUNTS.whiteboards}` },
          { label: "Python Runbooks", href: "/architecture?tab=python", badge: `${CONTENT_COUNTS.pythonDrills}` },
          { label: "Polyglot Examples", href: "/architecture?tab=polyglot", badge: `${CONTENT_COUNTS.polyglotMatrix}` },
          { label: "Distributed Systems", href: "/architecture?tab=distributed", badge: "Systems" },
        ],
      },
      {
        label: "Spark Lab",
        href: "/spark-engine",
        icon: Cpu,
        matches: ["/spark-engine"],
        pill: { text: "Spark", variant: "medium" },
        subItems: [
          { label: "Engine & Memory Lab", href: "/spark-engine" },
          { label: "Execution Simulator", href: "/spark-engine?tab=simulator", badge: "Simulator" },
          { label: "Memory Architecture", href: "/spark-engine?tab=memory", badge: "GC & Off-Heap" },
        ],
      },
      {
        label: "Catalyst Optimizer",
        href: "/spark-catalyst",
        icon: Zap,
        matches: ["/spark-catalyst", "/spark-engine/catalyst"],
        pill: { text: "Live", variant: "new" },
      },
      {
        label: "Execution Visualizer",
        href: "/visualizer",
        icon: Activity,
        matches: ["/visualizer", "/spark-visualizer"],
        pill: { text: "Simulator", variant: "medium" },
      },
      {
        label: "Code Practice",
        href: "/code-practice",
        icon: Code2,
        pill: { text: "Drills", variant: "medium" },
        subItems: [
          { label: "PySpark Drills", href: "/code-practice?db=pyspark", badge: `${formatContentCount(CONTENT_COUNTS.pysparkDrills)}` },
          { label: "Spark SQL", href: "/code-practice?db=sparksql", badge: `${formatContentCount(CONTENT_COUNTS.sparkSqlDrills)}` },
          { label: "Python & Polars", href: "/code-practice?db=python", badge: `${formatContentCount(CONTENT_COUNTS.pythonDrills)}` },
          { label: "T-SQL", href: "/code-practice?db=mssql", badge: `${formatContentCount(CONTENT_COUNTS.mssqlDrills)}` },
          { label: "Databricks Hub", href: "/code-practice/databricks", badge: `${formatContentCount(CONTENT_COUNTS.databricksOps)}` },
          { label: "Language Matrix", href: "/code-practice?tab=matrix", badge: `${CONTENT_COUNTS.polyglotMatrix}` },
          { label: "Runbooks", href: "/code-practice?tab=runbooks", badge: `${CONTENT_COUNTS.combinedPythonRunbooks}` },
        ],
      },
      {
        label: "Databricks Coding Hub",
        href: "/code-practice/databricks",
        icon: Terminal,
        pill: { text: `${CONTENT_COUNTS.databricksOps}`, variant: "new" },
      },
      {
        label: "Whiteboards",
        href: "/whiteboards",
        icon: Sparkles,
        matches: ["/whiteboards", "/blueprints"],
        pill: { text: `${CONTENT_COUNTS.whiteboards}`, variant: "architect" },
      },
    ],
  },
  {
    title: "Build and operate",
    items: [
      {
        label: "Modern Stack",
        href: "/modern-stack",
        icon: Cloud,
        pill: { text: "Matrix", variant: "easy" },
        subItems: [
          { label: "Overview", href: "/modern-stack" },
          { label: "Compatibility", href: "/modern-stack?tab=compatibility" },
          { label: "Cost & FinOps", href: "/modern-stack?tab=cost", badge: `${CONTENT_COUNTS.finopsPlaybooks}` },
          { label: "Code Matrix", href: "/modern-stack?tab=matrix", badge: `${CONTENT_COUNTS.polyglotMatrix}` },
          { label: "Simulators", href: "/modern-stack?tab=simulators", badge: "6 Tools" },
          { label: "Concepts", href: "/modern-stack?tab=concepts", badge: `${CONTENT_COUNTS.modernConcepts}` },
          { label: "Blueprints", href: "/modern-stack?tab=blueprints", badge: "Blueprints" },
          { label: "AI & Vector Serving", href: "/modern-stack?tab=ai", badge: "RAG" },
          { label: "Python", href: "/modern-stack?tab=python", badge: "Python" },
        ],
      },
      {
        label: "DataOps",
        href: "/dataops",
        icon: Workflow,
        pill: { text: "E2E", variant: "info" },
        subItems: [
          { label: "Connections & Secrets", href: "/dataops?tab=connectivity" },
          { label: "CI/CD Pipelines", href: "/dataops?tab=cicd", badge: "5 Paths" },
          { label: "Project Lifecycle", href: "/dataops?tab=lifecycle", badge: `${CONTENT_COUNTS.sdlcControls} Controls` },
          { label: "Architecture Flow", href: "/dataops?tab=diagram", badge: "Flow" },
        ],
      },
      {
        label: "Cheat Sheets",
        href: "/cheat-sheet",
        icon: FileCode2,
        pill: { text: "Sheets", variant: "medium" },
        subItems: [
          { label: "Incident Runbooks", href: "/cheat-sheet?tab=runbooks", badge: `${CONTENT_COUNTS.incidentRunbooks}` },
          { label: "Databricks References", href: "/cheat-sheet?tab=databricks", badge: `${CONTENT_COUNTS.databricksCheatCards}` },
        ],
      },
    ],
  },
  {
    title: "Assess and explore careers",
    items: [
      {
        label: "Interview Practice",
        href: "/qa-prep",
        icon: MessageSquare,
        matches: ["/qa-prep", "/boost"],
        pill: { text: `${formatContentCount(CONTENT_COUNTS.qa)}+`, variant: "hard" },
        subItems: [
          { label: "Question Bank", href: "/qa-prep" },
          { label: "System Architect Scenarios", href: "/qa-prep?difficulty=ARCHITECT", badge: "Architect" },
          { label: "Hard Technical Q&As", href: "/qa-prep?difficulty=HARD", badge: "Hard" },
        ],
      },
      {
        label: "Company Research",
        href: "/company-research",
        icon: Briefcase,
        pill: { text: `${formatContentCount(CONTENT_COUNTS.companyProfiles)}+`, variant: "new" },
        subItems: [
          { label: "Company Profiles", href: "/company-research", badge: `${formatContentCount(CONTENT_COUNTS.companyProfiles)}` },
          { label: "Hyderabad Hubs", href: "/company-research?location=hyderabad", badge: "Hyd" },
          { label: "Bengaluru Hubs", href: "/company-research?location=bangalore", badge: "Blr" },
          { label: "Table View", href: "/company-research?view=table", badge: "Table" },
        ],
      },
    ],
  },
  {
    title: "Your workspace",
    items: [
      {
        label: "My Studio",
        href: "/studio",
        icon: User,
        matches: ["/studio", "/goal", "/deployments"],
        pill: { text: "Personal", variant: "info" },
        subItems: [
          { label: "Learning Progress", href: "/studio" },
          { label: "Bookmarks", href: "/studio#bookmarks" },
        ],
      },
    ],
  },
  {
    title: "About",
    items: [
      {
        label: "Security & Contact",
        href: "/security",
        icon: ShieldCheck,
      },
    ],
  },
];

export const ALL_FLAT_PAGES_AND_SUBPAGES: FlatNavPage[] = [
  { id: "home", label: "Home Dashboard", shortLabel: "Home", href: "/", category: "Portal", categoryColor: "blue", icon: Home },
  { id: "search-topics", label: "Search All Content", shortLabel: "Search", href: "/search-topics", category: "Portal", categoryColor: "blue", icon: Search },
  { id: "repositories", label: "Public Repository Library", shortLabel: "Repositories", href: "/repositories", category: "Portal", categoryColor: "blue", icon: FolderGit2, badge: "14 projects" },
  
  // Learn
  { id: "guided-learning", label: "Guided Learning Tracks", shortLabel: "Guided Tracks", href: "/guided-learning", category: "Learn", categoryColor: "indigo", icon: Route, badge: "Path" },
  { id: "guided-curricula", label: "Career Curricula", shortLabel: "Curricula", href: "/guided-learning?tab=curricula", category: "Learn", categoryColor: "indigo", icon: GraduationCap, badge: `${CONTENT_COUNTS.learningPaths} Paths` },
  { id: "learning-tree", label: "Master Lab & Topic Tree", shortLabel: "Lab Tree", href: "/guided-learning?tab=tree", category: "Learn", categoryColor: "indigo", icon: GitBranch, badge: `${CONTENT_COUNTS.deepDiveTopics} Dives` },
  { id: "learning-paths", label: "Learning Paths Portal", shortLabel: "Learning Paths", href: "/learning-paths", category: "Learn", categoryColor: "indigo", icon: GraduationCap, badge: "Curricula" },
  { id: "concepts", label: "Concepts Glossary", shortLabel: "Glossary", href: "/concepts", category: "Learn", categoryColor: "emerald", icon: BookOpen, badge: `${formatContentCount(CONTENT_COUNTS.concepts)}` },
  { id: "mindmap", label: "Concepts Mind Map", shortLabel: "Mind Map", href: "/concepts?view=mindmap", category: "Learn", categoryColor: "emerald", icon: GitBranch, badge: "Mind Map" },
  { id: "mindmap-page", label: "Concepts Linked Mind Map", shortLabel: "Mind Map Hub", href: "/mindmap", category: "Learn", categoryColor: "emerald", icon: GitBranch, badge: "Interactive" },
  { id: "concepts-study", label: "Flashcards Study", shortLabel: "Flashcards", href: "/concepts?view=study", category: "Learn", categoryColor: "emerald", icon: BookOpen, badge: "Recall" },
  { id: "stages", label: "Mastery Stages Hub", shortLabel: "Stages Hub", href: "/stages", category: "Learn", categoryColor: "purple", icon: Workflow, badge: "All Stages" },
  { id: "stages-mastery", label: "4-Stage Mastery Journey", shortLabel: "Mastery Journey", href: "/stages?tab=mastery", category: "Learn", categoryColor: "purple", icon: Workflow, badge: "4 Stages" },
  { id: "stages-lakehouse", label: "7-Stage Lakehouse Flow", shortLabel: "Lakehouse Flow", href: "/stages?tab=lakehouse", category: "Learn", categoryColor: "purple", icon: Workflow, badge: "7 Stages" },
  { id: "stages-sdlc", label: "6-Stage SDLC Playbook", shortLabel: "SDLC Playbook", href: "/stages?tab=sdlc", category: "Learn", categoryColor: "purple", icon: Workflow, badge: `${CONTENT_COUNTS.sdlcControls} Controls` },
  { id: "stages-catalyst", label: "5-Stage Catalyst Pipeline", shortLabel: "Catalyst Pipeline", href: "/stages?tab=catalyst", category: "Learn", categoryColor: "purple", icon: Cpu, badge: "5 Stages" },
  { id: "stages-flows", label: "8 Production Flows", shortLabel: "Production Flows", href: "/stages?tab=flows", category: "Learn", categoryColor: "purple", icon: Activity, badge: "8 Flows" },
  { id: "sql-guide", label: "SQL Mastery Study Guide", shortLabel: "SQL Guide", href: "/sql", category: "Learn", categoryColor: "indigo", icon: Database, badge: "Guide" },
  { id: "sql-stepper", label: "SQL Clause Execution Stepper", shortLabel: "SQL Stepper", href: "/sql?tab=stepper", category: "Learn", categoryColor: "indigo", icon: Activity, badge: "S-F-W-G-H-O" },
  { id: "sql-window", label: "Window Functions Visualizer", shortLabel: "Window Visualizer", href: "/sql?tab=window", category: "Learn", categoryColor: "indigo", icon: Database, badge: "Live" },
  { id: "sql-rosetta", label: "Multi-Engine SQL Rosetta Stone", shortLabel: "SQL Rosetta", href: "/sql?tab=rosetta", category: "Learn", categoryColor: "indigo", icon: Code2, badge: "5 Engines" },
  { id: "sql-drills", label: "4-Tier SQL Practice Drills", shortLabel: "SQL Drills", href: "/sql?tab=drills", category: "Learn", categoryColor: "indigo", icon: Sparkles, badge: "4 Tiers" },
  { id: "sql-runbooks", label: "SQL Engine Architecture & Runbooks", shortLabel: "SQL Runbooks", href: "/sql?tab=runbooks", category: "Practise", categoryColor: "purple", icon: Terminal, badge: "Prod" },

  // Practise
  { id: "architecture", label: "Architecture Hub", shortLabel: "Architecture", href: "/architecture", category: "Practise", categoryColor: "purple", icon: Layers, badge: `${formatContentCount(CONTENT_COUNTS.scenarios)}+` },
  { id: "arch-scenarios", label: "System Blueprints & Scenarios", shortLabel: "Scenarios", href: "/architecture?tab=scenarios", category: "Practise", categoryColor: "purple", icon: Layers, badge: `${formatContentCount(CONTENT_COUNTS.scenarios)}+` },
  { id: "arch-diagrams", label: "Architecture Diagrams", shortLabel: "Diagrams", href: "/architecture?tab=diagrams", category: "Practise", categoryColor: "purple", icon: Sparkles, badge: `${CONTENT_COUNTS.whiteboards}` },
  { id: "arch-python", label: "Architecture Python Runbooks", shortLabel: "Arch Runbooks", href: "/architecture?tab=python", category: "Practise", categoryColor: "purple", icon: Terminal, badge: `${CONTENT_COUNTS.pythonDrills}` },
  { id: "arch-polyglot", label: "Polyglot Examples", shortLabel: "Polyglot", href: "/architecture?tab=polyglot", category: "Practise", categoryColor: "purple", icon: Code2, badge: `${CONTENT_COUNTS.polyglotMatrix}` },
  { id: "arch-distributed", label: "Distributed Systems Scenarios", shortLabel: "Distributed", href: "/architecture?tab=distributed", category: "Practise", categoryColor: "purple", icon: Network, badge: "Systems" },
  { id: "spark-engine", label: "Spark Engine Lab", shortLabel: "Spark Lab", href: "/spark-engine", category: "Practise", categoryColor: "purple", icon: Cpu, badge: "Lab" },
  { id: "spark-simulator", label: "Spark Execution Simulator", shortLabel: "Simulator", href: "/spark-engine?tab=simulator", category: "Practise", categoryColor: "purple", icon: Activity, badge: "Simulator" },
  { id: "spark-memory", label: "Spark Memory Architecture", shortLabel: "Memory Lab", href: "/spark-engine?tab=memory", category: "Practise", categoryColor: "purple", icon: Cpu, badge: "GC & Off-Heap" },
  { id: "spark-catalyst", label: "Catalyst Optimizer", shortLabel: "Catalyst Lab", href: "/spark-catalyst", category: "Practise", categoryColor: "purple", icon: Zap, badge: "Live" },
  { id: "spark-visualizer", label: "Spark Execution Visualizer", shortLabel: "Visualizer", href: "/visualizer", category: "Practise", categoryColor: "purple", icon: Activity, badge: "Simulator" },
  { id: "code-practice", label: "Code Practice Hub", shortLabel: "Code Practice", href: "/code-practice", category: "Practise", categoryColor: "cyan", icon: Code2, badge: "Drills" },
  { id: "code-pyspark", label: "PySpark Drills", shortLabel: "PySpark", href: "/code-practice?db=pyspark", category: "Practise", categoryColor: "cyan", icon: Code2, badge: `${formatContentCount(CONTENT_COUNTS.pysparkDrills)}` },
  { id: "code-sparksql", label: "Spark SQL Drills", shortLabel: "Spark SQL", href: "/code-practice?db=sparksql", category: "Practise", categoryColor: "cyan", icon: Database, badge: `${formatContentCount(CONTENT_COUNTS.sparkSqlDrills)}` },
  { id: "code-python", label: "Python & Polars Drills", shortLabel: "Python & Polars", href: "/code-practice?db=python", category: "Practise", categoryColor: "cyan", icon: Code2, badge: `${formatContentCount(CONTENT_COUNTS.pythonDrills)}` },
  { id: "code-mssql", label: "T-SQL Drills", shortLabel: "T-SQL", href: "/code-practice?db=mssql", category: "Practise", categoryColor: "cyan", icon: Database, badge: `${formatContentCount(CONTENT_COUNTS.mssqlDrills)}` },
  { id: "code-matrix", label: "Polyglot Code Matrix", shortLabel: "Code Matrix", href: "/code-practice?tab=matrix", category: "Practise", categoryColor: "cyan", icon: FileCode2, badge: `${CONTENT_COUNTS.polyglotMatrix}` },
  { id: "code-runbooks", label: "Python Lakehouse Runbooks", shortLabel: "Runbooks", href: "/code-practice?tab=runbooks", category: "Practise", categoryColor: "cyan", icon: Terminal, badge: `${CONTENT_COUNTS.combinedPythonRunbooks}` },
  { id: "code-databricks", label: "Databricks Coding Hub", shortLabel: "Databricks", href: "/code-practice/databricks", category: "Practise", categoryColor: "cyan", icon: Terminal, badge: `${CONTENT_COUNTS.databricksOps}` },
  { id: "whiteboards", label: "Whiteboard Mastery Hub", shortLabel: "Whiteboards", href: "/whiteboards", category: "Practise", categoryColor: "purple", icon: Sparkles, badge: `${CONTENT_COUNTS.whiteboards} Blueprints` },

  // Build and operate
  { id: "modern-stack", label: "Modern Stack Matrix & FinOps", shortLabel: "Modern Stack", href: "/modern-stack", category: "Build & Operate", categoryColor: "purple", icon: Cloud, badge: "Matrix" },
  { id: "modern-compat", label: "Cloud × Table Compatibility", shortLabel: "Compatibility", href: "/modern-stack?tab=compatibility", category: "Build & Operate", categoryColor: "purple", icon: Zap, badge: "10 Engines" },
  { id: "modern-cost", label: "FinOps Cost Playbooks", shortLabel: "FinOps", href: "/modern-stack?tab=cost", category: "Build & Operate", categoryColor: "purple", icon: Zap, badge: `${CONTENT_COUNTS.finopsPlaybooks}` },
  { id: "modern-simulators", label: "Engine Simulators", shortLabel: "Simulators", href: "/modern-stack?tab=simulators", category: "Build & Operate", categoryColor: "purple", icon: Cpu, badge: "6 Tools" },
  { id: "modern-concepts", label: "Core Lakehouse Concepts", shortLabel: "Lakehouse Concepts", href: "/modern-stack?tab=concepts", category: "Build & Operate", categoryColor: "emerald", icon: Zap, badge: `${CONTENT_COUNTS.modernConcepts}` },
  { id: "modern-blueprints", label: "Modern Stack Blueprints", shortLabel: "Stack Blueprints", href: "/modern-stack?tab=blueprints", category: "Build & Operate", categoryColor: "purple", icon: Layers, badge: "Blueprints" },
  { id: "modern-ai", label: "AI & Vector Serving", shortLabel: "AI & Vectors", href: "/modern-stack?tab=ai", category: "Build & Operate", categoryColor: "purple", icon: Zap, badge: "RAG" },
  { id: "modern-python", label: "Modern Python Integration", shortLabel: "Modern Python", href: "/modern-stack?tab=python", category: "Build & Operate", categoryColor: "cyan", icon: Code2, badge: "Python" },
  { id: "dataops", label: "DataOps & CI/CD Hub", shortLabel: "DataOps", href: "/dataops", category: "Build & Operate", categoryColor: "purple", icon: Workflow, badge: "E2E" },
  { id: "dataops-conn", label: "Tool Connectivity & Secrets", shortLabel: "Tool Secrets", href: "/dataops?tab=connectivity", category: "Build & Operate", categoryColor: "purple", icon: Network, badge: "Secrets" },
  { id: "dataops-cicd", label: "CI/CD Alternatives & Pipelines", shortLabel: "CI/CD Pipelines", href: "/dataops?tab=cicd", category: "Build & Operate", categoryColor: "purple", icon: GitBranch, badge: "CI/CD" },
  { id: "dataops-lifecycle", label: "360° SDLC Lifecycle Playbook", shortLabel: "SDLC Lifecycle", href: "/dataops?tab=lifecycle", category: "Build & Operate", categoryColor: "purple", icon: Workflow, badge: `${CONTENT_COUNTS.sdlcControls} Controls` },
  { id: "dataops-diagram", label: "Architecture Flow Canvas", shortLabel: "Architecture Flow", href: "/dataops?tab=diagram", category: "Build & Operate", categoryColor: "teal", icon: Layers, badge: "Flow" },
  { id: "cheat-sheet", label: "Production Cheat Sheets", shortLabel: "Cheat Sheet", href: "/cheat-sheet", category: "Build & Operate", categoryColor: "cyan", icon: FileCode2, badge: "Runbooks" },
  { id: "cheat-runbooks", label: "Severity-1 Incident Runbooks", shortLabel: "Runbooks", href: "/cheat-sheet?tab=runbooks", category: "Build & Operate", categoryColor: "cyan", icon: Terminal, badge: `${CONTENT_COUNTS.incidentRunbooks}` },
  { id: "dbx-cheat-sheet", label: "Databricks Cheat Sheets", shortLabel: "DBX Sheets", href: "/cheat-sheet?tab=databricks", category: "Build & Operate", categoryColor: "cyan", icon: Terminal, badge: `${CONTENT_COUNTS.databricksCheatCards}` },

  // Assess and explore careers
  { id: "qa-prep", label: "Interview Question Drill Bank", shortLabel: "Interview Bank", href: "/qa-prep", category: "Careers", categoryColor: "amber", icon: MessageSquare, badge: `${formatContentCount(CONTENT_COUNTS.qa)}+` },
  { id: "qa-architect", label: "System Architect Scenarios", shortLabel: "Architect Q&A", href: "/qa-prep?difficulty=ARCHITECT", category: "Careers", categoryColor: "amber", icon: MessageSquare, badge: "Architect" },
  { id: "qa-hard", label: "Hard Technical Questions", shortLabel: "Hard Q&A", href: "/qa-prep?difficulty=HARD", category: "Careers", categoryColor: "amber", icon: MessageSquare, badge: "Hard" },
  { id: "company-research", label: "Target Company Intel", shortLabel: "Company Intel", href: "/company-research", category: "Careers", categoryColor: "amber", icon: Briefcase, badge: `${formatContentCount(CONTENT_COUNTS.companyProfiles)} GCCs` },
  { id: "company-hyderabad", label: "Hyderabad GCC Hubs", shortLabel: "Hyderabad Hub", href: "/company-research?location=hyderabad", category: "Careers", categoryColor: "amber", icon: Briefcase, badge: "Hyd" },
  { id: "company-bangalore", label: "Bengaluru Tech Centers", shortLabel: "Bengaluru Hub", href: "/company-research?location=bangalore", category: "Careers", categoryColor: "amber", icon: Briefcase, badge: "Blr" },
  { id: "company-table", label: "Company Intel Table View", shortLabel: "Company Table", href: "/company-research?view=table", category: "Careers", categoryColor: "amber", icon: Briefcase, badge: "Table" },

  // Workspace
  { id: "studio", label: "My Learning Studio", shortLabel: "My Studio", href: "/studio", category: "Workspace", categoryColor: "indigo", icon: User, badge: "Personal" },
  { id: "studio-bookmarks", label: "Saved Bookmarks", shortLabel: "Bookmarks", href: "/studio#bookmarks", category: "Workspace", categoryColor: "indigo", icon: User, badge: "Saved" },

  // About
  { id: "security", label: "Security & Contact", shortLabel: "Security", href: "/security", category: "About", categoryColor: "blue", icon: ShieldCheck },
];

/**
 * Checks if a specific sub-navigation URL or view is currently active.
 */
export function isSubHrefActive(
  pathname: string | null,
  searchParams: URLSearchParams | null,
  subHref: string,
  currentHash = ""
): boolean {
  if (!pathname) return false;

  const [urlWithoutHash, hash] = subHref.split("#");
  const [subPath, subQuery] = urlWithoutHash.split("?");

  if (pathname !== subPath) return false;

  // Handle hash if present (use caller-supplied hydrated hash to avoid SSR mismatch)
  if (hash) {
    return currentHash === `#${hash}`;
  }

  // If subHref has NO query string
  if (!subQuery) {
    if (!searchParams || Array.from(searchParams.entries()).length === 0) {
      if (pathname === "/studio" && currentHash === "#bookmarks") {
        return false;
      }
      return true;
    }
    const currentTab = searchParams.get("tab")?.toLowerCase();
    const currentDb = searchParams.get("db")?.toLowerCase();
    const currentView = searchParams.get("view")?.toLowerCase();
    const currentLocation = searchParams.get("location")?.toLowerCase();
    const currentDifficulty = searchParams.get("difficulty")?.toLowerCase();
    const currentDomain = searchParams.get("domain")?.toLowerCase();

    // Default views match when on base path without conflicting query params
    if (pathname === "/stages" && (!currentTab || currentTab === "mastery")) return true;
    if (pathname === "/architecture" && (!currentTab || currentTab === "scenarios")) return true;
    if (pathname === "/code-practice" && (!currentDb && !currentTab)) return true;
    if (pathname === "/spark-engine" && (!currentTab || currentTab === "architecture")) return true;
    if (pathname === "/modern-stack" && (!currentTab || currentTab === "overview" || currentTab === "compatibility")) return true;
    if (pathname === "/dataops" && (!currentTab || currentTab === "connectivity")) return true;
    if (pathname === "/cheat-sheet" && (!currentTab || currentTab === "runbooks")) return true;
    if (pathname === "/concepts" && (!currentView || currentView === "glossary")) return true;
    if (pathname === "/guided-learning" && (!currentTab || currentTab === "topics")) return true;
    if (pathname === "/qa-prep" && !currentDifficulty && (!currentDomain || currentDomain === "all")) return true;
    if (pathname === "/company-research" && !currentLocation && (!currentView || currentView === "cards")) return true;
    if (pathname === "/studio") {
      return currentHash !== "#bookmarks";
    }

    return false;
  }

  if (!searchParams) return false;
  const subParams = new URLSearchParams(subQuery);
  for (const [key, val] of subParams.entries()) {
    const currentVal = searchParams.get(key)?.toLowerCase();
    const targetVal = val.toLowerCase();

    // Handle defaults when currentVal is omitted from URL
    if (!currentVal) {
      if (pathname === "/stages" && key === "tab" && targetVal === "mastery") return true;
      if (pathname === "/architecture" && key === "tab" && targetVal === "scenarios") return true;
      if (pathname === "/code-practice" && key === "db" && targetVal === "pyspark") return true;
      if (pathname === "/spark-engine" && key === "tab" && targetVal === "architecture") return true;
      if (pathname === "/dataops" && key === "tab" && targetVal === "connectivity") return true;
      if (pathname === "/cheat-sheet" && key === "tab" && targetVal === "runbooks") return true;
      if (pathname === "/modern-stack" && key === "tab" && (targetVal === "compatibility" || targetVal === "overview")) return true;
      if (pathname === "/concepts" && key === "view" && targetVal === "glossary") return true;
      if (pathname === "/guided-learning" && key === "tab" && targetVal === "topics") return true;
      return false;
    }

    if (currentVal !== targetVal) return false;
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
    title: "Start & Learn",
    badge: "Foundations",
    pages: [
      { label: "Home Dashboard", href: "/" },
      { label: "Search All Content", href: "/search-topics", badge: "Universal" },
      {
        label: "Guided Learning",
        href: "/guided-learning",
        badge: `${CONTENT_COUNTS.guidedTracks} Tracks`,
        subpages: [
          { label: "Topic Tracks", href: "/guided-learning" },
          { label: "Career Curricula", href: "/guided-learning?tab=curricula", badge: `${CONTENT_COUNTS.learningPaths} Paths` },
          { label: "Topic Tree", href: "/guided-learning?tab=tree", badge: `${CONTENT_COUNTS.deepDiveTopics} Dives` },
        ],
      },
      {
        label: "Concepts Glossary",
        href: "/concepts",
        badge: `${formatContentCount(CONTENT_COUNTS.concepts)}`,
        subpages: [
          { label: "Glossary & Cards", href: "/concepts", badge: `${formatContentCount(CONTENT_COUNTS.concepts)}` },
          { label: "Mind Map", href: "/mindmap", badge: "Interactive" },
          { label: "Flashcards Study", href: "/concepts?view=study", badge: "Recall" },
        ],
      },
      { label: "Learning Paths", href: "/learning-paths", badge: `${CONTENT_COUNTS.learningPaths} Paths` },
      {
        label: "Mastery Stages Hub",
        href: "/stages",
        badge: "Lifecycle",
        subpages: [
          { label: "4-Stage Mastery Journey", href: "/stages?tab=mastery" },
          { label: "7-Stage Lakehouse Flow", href: "/stages?tab=lakehouse" },
          { label: "6-Stage SDLC Playbook", href: "/stages?tab=sdlc" },
          { label: "5-Stage Catalyst Pipeline", href: "/stages?tab=catalyst" },
          { label: "8 Production Flows", href: "/stages?tab=flows" },
        ],
      },
    ],
  },
  {
    title: "Practise & Systems",
    badge: "Interactive Labs",
    pages: [
      {
        label: "Architecture Hub",
        href: "/architecture",
        badge: `${formatContentCount(CONTENT_COUNTS.scenarios)}+`,
        subpages: [
          { label: "System Scenarios", href: "/architecture?tab=scenarios", badge: `${formatContentCount(CONTENT_COUNTS.scenarios)}` },
          { label: "Whiteboard Diagrams", href: "/architecture?tab=diagrams", badge: `${CONTENT_COUNTS.whiteboards}` },
          { label: "Python Runbooks", href: "/architecture?tab=python", badge: `${CONTENT_COUNTS.pythonDrills}` },
          { label: "Polyglot Examples", href: "/architecture?tab=polyglot", badge: `${CONTENT_COUNTS.polyglotMatrix}` },
          { label: "Distributed Systems", href: "/architecture?tab=distributed" },
        ],
      },
      {
        label: "Spark Lab",
        href: "/spark-engine",
        badge: "Engine & GC",
        subpages: [
          { label: "Engine & Memory Lab", href: "/spark-engine" },
          { label: "Execution Simulator", href: "/spark-engine?tab=simulator" },
          { label: "Memory Architecture", href: "/spark-engine?tab=memory" },
        ],
      },
      { label: "Catalyst Optimizer", href: "/spark-catalyst", badge: "Live" },
      { label: "Execution Visualizer", href: "/visualizer", badge: "Simulator" },
      {
        label: "Code Practice Hub",
        href: "/code-practice",
        badge: "Drills",
        subpages: [
          { label: "PySpark Drills", href: "/code-practice?db=pyspark", badge: `${formatContentCount(CONTENT_COUNTS.pysparkDrills)}` },
          { label: "Spark SQL", href: "/code-practice?db=sparksql", badge: `${formatContentCount(CONTENT_COUNTS.sparkSqlDrills)}` },
          { label: "Python & Polars", href: "/code-practice?db=python", badge: `${formatContentCount(CONTENT_COUNTS.pythonDrills)}` },
          { label: "T-SQL", href: "/code-practice?db=mssql", badge: `${formatContentCount(CONTENT_COUNTS.mssqlDrills)}` },
          { label: "Polyglot Matrix", href: "/code-practice?tab=matrix", badge: `${CONTENT_COUNTS.polyglotMatrix}` },
          { label: "Incident Runbooks", href: "/code-practice?tab=runbooks", badge: `${CONTENT_COUNTS.combinedPythonRunbooks}` },
        ],
      },
      { label: "Databricks Coding Hub", href: "/code-practice/databricks", badge: `${CONTENT_COUNTS.databricksOps}` },
      { label: "Whiteboard Hub", href: "/whiteboards", badge: `${CONTENT_COUNTS.whiteboards} Master` },
    ],
  },
  {
    title: "Build & Operate",
    badge: "Production Stack",
    pages: [
      {
        label: "Modern Stack Matrix",
        href: "/modern-stack",
        badge: "FinOps",
        subpages: [
          { label: "Overview", href: "/modern-stack" },
          { label: "Compatibility Matrix", href: "/modern-stack?tab=compatibility" },
          { label: "FinOps Cost Playbooks", href: "/modern-stack?tab=cost", badge: `${CONTENT_COUNTS.finopsPlaybooks}` },
          { label: "Code Matrix", href: "/modern-stack?tab=matrix", badge: `${CONTENT_COUNTS.polyglotMatrix}` },
          { label: "Engine Simulators", href: "/modern-stack?tab=simulators", badge: "6 Tools" },
          { label: "Lakehouse Concepts", href: "/modern-stack?tab=concepts", badge: `${CONTENT_COUNTS.modernConcepts}` },
          { label: "Stack Blueprints", href: "/modern-stack?tab=blueprints" },
          { label: "AI & Vector Serving", href: "/modern-stack?tab=ai", badge: "RAG" },
          { label: "Python Integration", href: "/modern-stack?tab=python" },
        ],
      },
      {
        label: "DataOps & CI/CD",
        href: "/dataops",
        badge: "E2E",
        subpages: [
          { label: "Connections & Secrets", href: "/dataops?tab=connectivity" },
          { label: "CI/CD Pipelines", href: "/dataops?tab=cicd", badge: "5 Paths" },
          { label: "SDLC Lifecycle", href: "/dataops?tab=lifecycle", badge: `${CONTENT_COUNTS.sdlcControls} Controls` },
          { label: "Architecture Flow", href: "/dataops?tab=diagram" },
        ],
      },
      {
        label: "Cheat Sheets",
        href: "/cheat-sheet",
        badge: `${CONTENT_COUNTS.cheatSheetsTotal} Cards`,
        subpages: [
          { label: "Incident Runbooks", href: "/cheat-sheet?tab=runbooks", badge: `${CONTENT_COUNTS.incidentRunbooks}` },
          { label: "Databricks Cheat Sheets", href: "/cheat-sheet?tab=databricks", badge: `${CONTENT_COUNTS.databricksCheatCards}` },
        ],
      },
    ],
  },
  {
    title: "Careers & Workspace",
    badge: "Personal",
    pages: [
      {
        label: "Interview Practice Bank",
        href: "/qa-prep",
        badge: `${formatContentCount(CONTENT_COUNTS.qa)}+`,
        subpages: [
          { label: "Question Bank", href: "/qa-prep" },
          { label: "System Architect Scenarios", href: "/qa-prep?difficulty=ARCHITECT", badge: "Architect" },
          { label: "Hard Technical Q&As", href: "/qa-prep?difficulty=HARD", badge: "Hard" },
        ],
      },
      {
        label: "Target Company Intel",
        href: "/company-research",
        badge: `${formatContentCount(CONTENT_COUNTS.companyProfiles)} GCCs`,
        subpages: [
          { label: "Company Profiles", href: "/company-research" },
          { label: "Hyderabad Hubs", href: "/company-research?location=hyderabad" },
          { label: "Bengaluru Hubs", href: "/company-research?location=bangalore" },
          { label: "Table View", href: "/company-research?view=table" },
        ],
      },
      {
        label: "My Learning Studio",
        href: "/studio",
        badge: "Workspace",
        subpages: [
          { label: "Learning Progress", href: "/studio" },
          { label: "Bookmarks", href: "/studio#bookmarks" },
        ],
      },
      { label: "Security & Contact", href: "/security" },
    ],
  },
];
