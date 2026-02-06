import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";

const execAsync = promisify(exec);

/**
 * Changelog entry structure
 */
export interface ChangelogEntry {
  type: "feat" | "fix" | "docs" | "chore" | "refactor" | "test" | "perf" | "style";
  scope?: string;
  description: string;
  body?: string;
  breaking?: string;
  hash: string;
  date: Date;
  author: string;
  files: string[];
}

/**
 * Grouped changelog entries
 */
export interface ChangelogGroup {
  features: ChangelogEntry[];
  fixes: ChangelogEntry[];
  enhancements: ChangelogEntry[];
  security: ChangelogEntry[];
  breaking: ChangelogEntry[];
  other: ChangelogEntry[];
}

/**
 * Parse a conventional commit message
 * Supports breaking change marker (!)
 */
function parseCommit(commitLine: string): ChangelogEntry | null {
  // Format: hash|date|author|subject|files
  const parts = commitLine.split("|");
  if (parts.length < 5) return null;

  const [hash, dateStr, author, subject, filesStr] = parts;
  const files = filesStr.split(",").filter(Boolean);

  // Parse conventional commit format: type(scope)!: description
  // Supports optional breaking change marker (!)
  const conventionalRegex = /^(\w+)(?:\(([^)]+)\))?(!?):\s*(.+)$/;
  const match = subject.match(conventionalRegex);

  if (!match) return null;

  const [, type, scope, breakingMarker, description] = match;

  // Check for valid types
  const validTypes = ["feat", "fix", "docs", "chore", "refactor", "test", "perf", "style"];
  if (!validTypes.includes(type)) return null;

  const entry: ChangelogEntry = {
    type: type as ChangelogEntry["type"],
    scope,
    description,
    hash: hash.substring(0, 7),
    date: new Date(dateStr),
    author,
    files,
  };

  // Mark as breaking if ! is present
  if (breakingMarker === "!") {
    entry.breaking = "Breaking change detected";
  }

  return entry;
}

/**
 * Sanitize git log parameters to prevent command injection
 */
function sanitizeGitParam(param: string): string {
  // Only allow alphanumeric, spaces, dashes, and common date formats
  const sanitized = param.replace(/[^a-zA-Z0-9\s\-:]/g, "");
  if (sanitized !== param) {
    throw new Error(`Invalid git parameter: ${param}`);
  }
  return sanitized;
}

/**
 * Get git commits since a specific date or commit
 * Secured against command injection
 */
export async function getCommitsSince(
  since: string = "1 week ago",
  cwd: string = process.cwd()
): Promise<ChangelogEntry[]> {
  try {
    // Sanitize input to prevent command injection
    const safeSince = sanitizeGitParam(since);

    const command = `git log --since="${safeSince}" --pretty=format:"%H|%aI|%an|%s" --name-only`;
    const { stdout } = await execAsync(command, { cwd });

    const commits: ChangelogEntry[] = [];
    const lines = stdout.split("\n").filter(Boolean);

    let i = 0;
    while (i < lines.length) {
      const commitLine = lines[i];
      const files: string[] = [];

      // Collect file names until next commit or end
      i++;
      while (i < lines.length && !lines[i].includes("|")) {
        files.push(lines[i]);
        i++;
      }

      const entry = parseCommit(commitLine + "|" + files.join(","));
      if (entry) commits.push(entry);
    }

    return commits;
  } catch (error) {
    console.error("Error fetching git commits:", error);
    return [];
  }
}

/**
 * Group commits by type
 */
export function groupCommits(commits: ChangelogEntry[]): ChangelogGroup {
  const groups: ChangelogGroup = {
    features: [],
    fixes: [],
    enhancements: [],
    security: [],
    breaking: [],
    other: [],
  };

  for (const commit of commits) {
    if (commit.breaking) {
      groups.breaking.push(commit);
    } else if (commit.type === "feat") {
      groups.features.push(commit);
    } else if (commit.type === "fix") {
      groups.fixes.push(commit);
    } else if (commit.type === "perf" || commit.type === "refactor") {
      groups.enhancements.push(commit);
    } else if (commit.scope === "security") {
      groups.security.push(commit);
    } else {
      groups.other.push(commit);
    }
  }

  return groups;
}

/**
 * Generate markdown for a changelog entry
 */
function formatEntry(entry: ChangelogEntry): string {
  const scope = entry.scope ? `**${entry.scope}**` : "";
  const hash = `[\`${entry.hash}\`]`;
  return `- ${scope ? scope + ": " : ""}${entry.description} ${hash}`;
}

/**
 * Generate changelog markdown content
 */
export function generateChangelogMarkdown(
  groups: ChangelogGroup,
  date: Date = new Date()
): string {
  const dateStr = date.toISOString().split("T")[0];
  let markdown = `# Changelog - ${dateStr}\n\n`;

  if (groups.breaking.length > 0) {
    markdown += `## ⚠️ Breaking Changes\n\n`;
    groups.breaking.forEach((entry) => {
      markdown += formatEntry(entry) + "\n";
      if (entry.breaking) {
        markdown += `  - **BREAKING:** ${entry.breaking}\n`;
      }
    });
    markdown += "\n";
  }

  if (groups.features.length > 0) {
    markdown += `## ✨ Features\n\n`;
    groups.features.forEach((entry) => {
      markdown += formatEntry(entry) + "\n";
    });
    markdown += "\n";
  }

  if (groups.fixes.length > 0) {
    markdown += `## 🐛 Bug Fixes\n\n`;
    groups.fixes.forEach((entry) => {
      markdown += formatEntry(entry) + "\n";
    });
    markdown += "\n";
  }

  if (groups.enhancements.length > 0) {
    markdown += `## ⚡ Enhancements\n\n`;
    groups.enhancements.forEach((entry) => {
      markdown += formatEntry(entry) + "\n";
    });
    markdown += "\n";
  }

  if (groups.security.length > 0) {
    markdown += `## 🔒 Security\n\n`;
    groups.security.forEach((entry) => {
      markdown += formatEntry(entry) + "\n";
    });
    markdown += "\n";
  }

  return markdown;
}

/**
 * Save changelog to file
 */
export async function saveChangelog(
  content: string,
  date: Date = new Date()
): Promise<string> {
  const dateStr = date.toISOString().split("T")[0];
  const fileName = `changelog-${dateStr}.md`;
  const dirPath = path.join(process.cwd(), "docs", "changelogs");
  const filePath = path.join(dirPath, fileName);

  // Ensure directory exists
  await fs.mkdir(dirPath, { recursive: true });

  // Write changelog file
  await fs.writeFile(filePath, content, "utf-8");

  return filePath;
}

/**
 * Generate and save changelog
 */
export async function generateChangelog(
  since: string = "1 week ago"
): Promise<{ filePath: string; content: string }> {
  const commits = await getCommitsSince(since);
  const groups = groupCommits(commits);
  const content = generateChangelogMarkdown(groups);
  const filePath = await saveChangelog(content);

  return { filePath, content };
}
