import { supabase } from './supabaseClient';
import { toast } from '../components/ui/Toast';
import type { Tables } from './supabaseClient';

export type Project = Tables['projects']['Row'];
export type NewProject = Tables['projects']['Insert'];

export const projectService = {
  async getProjects(userId: string) {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Erro ao carregar projetos');
      return [];
    }
  },

  async createProject(project: NewProject) {
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert(project)
        .select()
        .single();

      if (error) throw error;
      toast.success('Projeto criado com sucesso');
      return data;
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Erro ao criar projeto');
      throw error;
    }
  },

  async updateProject(id: string, updates: Partial<Project>) {
    try {
      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      toast.success('Projeto atualizado com sucesso');
      return data;
    } catch (error) {
      console.error('Error updating project:', error);
      toast.error('Erro ao atualizar projeto');
      throw error;
    }
  },

  async deleteProject(id: string) {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Projeto eliminado com sucesso');
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Erro ao eliminar projeto');
      throw error;
    }
  }
};