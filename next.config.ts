import type { NextConfig } from "next";

const guidePages = ["eu-vs-non-eu", "admission-requirements", "deadlines", "cost-of-living"];

const nextConfig: NextConfig = {
  // Denmark pages moved under /denmark – keep old links and search results working.
  // Every old URL points straight at its final page, so nothing redirects twice.
  async redirects() {
    return [
      { source: "/programmes", destination: "/denmark/programmes", permanent: true },
      { source: "/eligibility", destination: "/denmark/eligibility", permanent: true },
      { source: "/study-in-denmark", destination: "/denmark/guide/student-life", permanent: true },
      { source: "/denmark/student-life", destination: "/denmark/guide/student-life", permanent: true },
      ...guidePages.flatMap((slug) => [
        { source: `/${slug}`, destination: `/denmark/guide/${slug}`, permanent: true },
        { source: `/denmark/${slug}`, destination: `/denmark/guide/${slug}`, permanent: true },
      ]),
    ];
  },
};

export default nextConfig;
