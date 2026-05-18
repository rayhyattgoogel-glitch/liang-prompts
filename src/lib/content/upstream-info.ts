import { execSync } from "node:child_process";
import https from "node:https";
import path from "node:path";

export interface UpstreamInfo {
  fullName: string;
  description: string;
  htmlUrl: string;
  stars: number;
  forks: number;
  watchers: number;
  openIssues: number;
  defaultBranch: string;
  license: string | null;
  pushedAt: string;
  createdAt: string;
  language: string | null;
  topics: string[];
  apiAvailable: boolean;

  submoduleCommit: string;
  submoduleCommitShort: string;
  submoduleCommitDate: string;
  submoduleCommitMessage: string;
  submoduleAvailable: boolean;
  submoduleCommitUrl: string;

  fetchedAt: string;
}

const UPSTREAM_REPO = "yaojingang/yao-open-prompts";
const SUBMODULE_PATH = path.resolve(
  process.cwd(),
  "content/yao-open-prompts",
);

interface GithubRepoApi {
  full_name?: string;
  description?: string | null;
  html_url?: string;
  stargazers_count?: number;
  forks_count?: number;
  watchers_count?: number;
  subscribers_count?: number;
  open_issues_count?: number;
  default_branch?: string;
  license?: { spdx_id?: string; name?: string } | null;
  pushed_at?: string;
  created_at?: string;
  language?: string | null;
  topics?: string[];
}

function fetchJsonViaHttps<T>(url: string, timeoutMs = 5000): Promise<T> {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = https.request(
      {
        hostname: u.hostname,
        path: u.pathname + u.search,
        method: "GET",
        family: 4,
        timeout: timeoutMs,
        headers: {
          Accept: "application/vnd.github+json",
          "User-Agent": "yao-prompts-web/0.1 (about-page)",
        },
      },
      (res) => {
        const status = res.statusCode ?? 0;
        if (status < 200 || status >= 300) {
          reject(new Error(`HTTP ${status}`));
          res.resume();
          return;
        }
        let body = "";
        res.setEncoding("utf-8");
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          try {
            resolve(JSON.parse(body) as T);
          } catch (err) {
            reject(err);
          }
        });
      },
    );
    req.on("error", reject);
    req.on("timeout", () => {
      req.destroy(new Error("ETIMEDOUT"));
    });
    req.end();
  });
}

function fetchJsonViaCurl<T>(url: string, timeoutSec = 10): T {
  const out = execSync(
    `curl -fsS --max-time ${timeoutSec} -H "Accept: application/vnd.github+json" -H "User-Agent: yao-prompts-web/0.1" "${url}"`,
    { encoding: "utf-8", stdio: ["ignore", "pipe", "pipe"] },
  );
  return JSON.parse(out) as T;
}

async function fetchJson<T>(url: string): Promise<T> {
  try {
    return await fetchJsonViaHttps<T>(url, 5000);
  } catch (httpsErr) {
    try {
      return fetchJsonViaCurl<T>(url, 10);
    } catch (curlErr) {
      throw new Error(
        `Both https (${(httpsErr as Error).message}) and curl (${(curlErr as Error).message}) failed`,
      );
    }
  }
}

let cache: UpstreamInfo | null = null;

export async function loadUpstreamInfo(): Promise<UpstreamInfo> {
  if (cache) return cache;

  let api: GithubRepoApi = {};
  let apiAvailable = false;
  try {
    api = await fetchJson<GithubRepoApi>(
      `https://api.github.com/repos/${UPSTREAM_REPO}`,
    );
    apiAvailable = true;
  } catch (err) {
    console.warn(
      "[upstream-info] failed to fetch GitHub API:",
      (err as Error).message,
    );
  }

  let commit = "";
  let commitDate = "";
  let commitMessage = "";
  let submoduleAvailable = false;
  try {
    commit = execSync(`git -C "${SUBMODULE_PATH}" rev-parse HEAD`, {
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "pipe"],
    }).trim();
    commitDate = execSync(
      `git -C "${SUBMODULE_PATH}" log -1 --format=%cI`,
      { encoding: "utf-8", stdio: ["ignore", "pipe", "pipe"] },
    ).trim();
    commitMessage = execSync(
      `git -C "${SUBMODULE_PATH}" log -1 --format=%s`,
      { encoding: "utf-8", stdio: ["ignore", "pipe", "pipe"] },
    ).trim();
    submoduleAvailable = Boolean(commit);
  } catch (err) {
    console.warn(
      "[upstream-info] failed to read submodule git info:",
      (err as Error).message,
    );
  }

  const htmlUrl = api.html_url ?? `https://github.com/${UPSTREAM_REPO}`;

  cache = {
    fullName: api.full_name ?? UPSTREAM_REPO,
    description:
      api.description ??
      "Yao Open Prompts：中文 AI 提示词库，覆盖工作、学习、内容、营销和生活场景",
    htmlUrl,
    stars: api.stargazers_count ?? 0,
    forks: api.forks_count ?? 0,
    watchers: api.subscribers_count ?? api.watchers_count ?? 0,
    openIssues: api.open_issues_count ?? 0,
    defaultBranch: api.default_branch ?? "main",
    license: (() => {
      const spdx = api.license?.spdx_id;
      if (spdx && spdx !== "NOASSERTION") return spdx;
      const name = api.license?.name;
      if (name && name !== "Other") return name;
      return "CC BY 4.0";
    })(),
    pushedAt: api.pushed_at ?? "",
    createdAt: api.created_at ?? "",
    language: api.language ?? null,
    topics: api.topics ?? [],
    apiAvailable,

    submoduleCommit: commit,
    submoduleCommitShort: commit.slice(0, 7),
    submoduleCommitDate: commitDate,
    submoduleCommitMessage: commitMessage,
    submoduleAvailable,
    submoduleCommitUrl: commit ? `${htmlUrl}/commit/${commit}` : htmlUrl,

    fetchedAt: new Date().toISOString(),
  };

  return cache;
}
