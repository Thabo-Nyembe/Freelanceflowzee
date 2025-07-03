'use client'

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getSubProjects } from '@/app/(app)/projects/actions';
import ProjectView from './project-view';

interface Project {
  id: string
  title: string
  description: string
  client_name?: string
  client_email?: string
  budget?: number
  start_date?: string
  end_date?: string
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  status?: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled'
  user_id: string
  created_at: string
  updated_at: string
}

interface ProjectDetailsProps {
  project: Project;
}

export function ProjectDetails({ project }: ProjectDetailsProps) {
  const [subProjects, setSubProjects] = useState<Project[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSubProjects() {
      const { subProjects, error } = await getSubProjects(project.id);
      if (error) {
        setError(error);
      } else if (subProjects) {
        setSubProjects(subProjects);
      }
    }

    fetchSubProjects();
  }, [project.id]);

  return (
    <div>
      <ProjectView project={project} />

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Sub-projects</h2>
        {error && <p className="text-red-500">{error}</p>}
        {subProjects.length > 0 ? (
          <ul className="space-y-4">
            {subProjects.map((sub) => (
              <li key={sub.id} className="p-4 border rounded-lg hover:bg-gray-50">
                <Link href={`/dashboard/project-tracker?projectId=${sub.id}`} className="block">
                  <h3 className="font-semibold">{sub.title}</h3>
                  <p className="text-sm text-gray-500">Status: {sub.status}</p>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p>No sub-projects found.</p>
        )}
      </div>
    </div>
  );
}
