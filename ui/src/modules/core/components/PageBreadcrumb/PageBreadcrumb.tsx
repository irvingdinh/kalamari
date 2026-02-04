import { Fragment } from "react";
import { Link } from "react-router";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useWorkspace } from "@/modules/workspace/hooks/use-workspace";

export interface BreadcrumbSegment {
  label: string;
  href?: string;
}

interface PageBreadcrumbProps {
  workspaceId: string;
  segments?: BreadcrumbSegment[];
}

export const PageBreadcrumb = ({
  workspaceId,
  segments = [],
}: PageBreadcrumbProps) => {
  const { data: workspace } = useWorkspace(workspaceId);
  const workspaceName = workspace?.name ?? "Workspace";

  const allSegments: BreadcrumbSegment[] = [
    { label: "Workspaces", href: "/workspaces" },
    { label: workspaceName, href: `/workspaces/${workspaceId}` },
    ...segments,
  ];

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {allSegments.map((segment, index) => {
          const isLast = index === allSegments.length - 1;

          return (
            <Fragment key={index}>
              {index > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{segment.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={segment.href!}>{segment.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
};
