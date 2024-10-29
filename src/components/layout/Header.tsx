import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Store, Rocket, ChevronDown, Trash2, Plus } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  createdAt: string;
}

interface HeaderProps {
  pageName: string;
}

export function Header({ pageName }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Load projects from localStorage
    const storedProjects = localStorage.getItem('projects');
    const parsedProjects = storedProjects ? JSON.parse(storedProjects) : [];
    setProjects(parsedProjects);

    // Load current project
    const currentProjectId = localStorage.getItem('currentProjectId');
    if (currentProjectId) {
      const current = parsedProjects.find((p: Project) => p.id === currentProjectId);
      setCurrentProject(current || null);
    }

    // Click outside handler
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleProjectSelect = (project: Project) => {
    setCurrentProject(project);
    localStorage.setItem('currentProjectId', project.id);
    setIsOpen(false);
    navigate('/');
  };

  const handleDeleteProject = (projectId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const updatedProjects = projects.filter(p => p.id !== projectId);
    setProjects(updatedProjects);
    localStorage.setItem('projects', JSON.stringify(updatedProjects));

    if (currentProject?.id === projectId) {
      setCurrentProject(null);
      localStorage.removeItem('currentProjectId');
    }
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200">
      <div className="h-full px-8 flex items-center justify-between">
        <div className="flex items-center">
          <div className="flex items-center px-4 py-2 bg-gradient-to-r from-secondary-lime/10 to-transparent rounded-lg">
            {pageName === 'Context' && (
              <Store className="h-6 w-6 text-secondary-gray mr-2" />
            )}
            <h1 className="text-2xl font-moonwalk font-bold text-primary">
              {pageName}
            </h1>
          </div>
        </div>
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`
              flex items-center space-x-2 px-4 py-2 text-sm font-medium
              ${currentProject 
                ? 'text-gray-700 hover:bg-gray-50' 
                : 'text-white bg-primary hover:bg-secondary-dark'}
              rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary
            `}
          >
            {currentProject ? (
              <>
                <span>{currentProject.name}</span>
                <ChevronDown className="h-4 w-4" />
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                <span>New Project</span>
              </>
            )}
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-gray-200 z-50">
              <div className="py-1">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    onClick={() => handleProjectSelect(project)}
                    className={`
                      flex items-center justify-between px-4 py-2 text-sm cursor-pointer
                      ${currentProject?.id === project.id ? 'bg-gray-50 text-primary' : 'text-gray-700 hover:bg-gray-50'}
                    `}
                  >
                    <span>{project.name}</span>
                    <button
                      onClick={(e) => handleDeleteProject(project.id, e)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete project"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                
                {projects.length > 0 && <hr className="my-1" />}
                
                <Link
                  to="/"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Project
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}