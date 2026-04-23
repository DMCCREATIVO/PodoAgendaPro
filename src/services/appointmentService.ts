import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Appointment = Database["public"]["Tables"]["appointments"]["Row"];
type AppointmentInsert = Database["public"]["Tables"]["appointments"]["Insert"];
type AppointmentUpdate = Database["public"]["Tables"]["appointments"]["Update"];

export const appointmentService = {
  /**
   * Get appointments for a company with optional filters
   */
  async getAppointments(companyId: string, filters?: {
    startDate?: string;
    endDate?: string;
    status?: string;
    assignedTo?: string;
    clientId?: string;
  }) {
    let query = supabase
      .from("appointments")
      .select(`
        *,
        client:clients(id, name, email, phone, avatar_url),
        service:services(id, name, duration_minutes, price, color),
        assigned_user:users!appointments_assigned_to_fkey(id, full_name, avatar_url)
      `)
      .eq("company_id", companyId)
      .order("scheduled_at", { ascending: true });

    if (filters?.startDate) {
      query = query.gte("scheduled_at", filters.startDate);
    }

    if (filters?.endDate) {
      query = query.lte("scheduled_at", filters.endDate);
    }

    if (filters?.status) {
      query = query.eq("status", filters.status);
    }

    if (filters?.assignedTo) {
      query = query.eq("assigned_to", filters.assignedTo);
    }

    if (filters?.clientId) {
      query = query.eq("client_id", filters.clientId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  /**
   * Get appointments for a specific day
   */
  async getAppointmentsByDay(companyId: string, date: string) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return this.getAppointments(companyId, {
      startDate: startOfDay.toISOString(),
      endDate: endOfDay.toISOString(),
    });
  },

  /**
   * Get appointment by ID
   */
  async getAppointmentById(companyId: string, appointmentId: string) {
    const { data, error } = await supabase
      .from("appointments")
      .select(`
        *,
        client:clients(id, name, email, phone, avatar_url, tags),
        service:services(id, name, duration_minutes, price, color),
        assigned_user:users!appointments_assigned_to_fkey(id, full_name, avatar_url)
      `)
      .eq("company_id", companyId)
      .eq("id", appointmentId)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Check availability for a time slot
   */
  async checkAvailability(
    companyId: string,
    assignedTo: string,
    scheduledAt: string,
    durationMinutes: number,
    excludeAppointmentId?: string
  ) {
    const startTime = new Date(scheduledAt);
    const endTime = new Date(startTime.getTime() + durationMinutes * 60000);

    let query = supabase
      .from("appointments")
      .select("id")
      .eq("company_id", companyId)
      .eq("assigned_to", assignedTo)
      .neq("status", "cancelled")
      .or(`scheduled_at.lt.${endTime.toISOString()},scheduled_at.gte.${startTime.toISOString()}`);

    if (excludeAppointmentId) {
      query = query.neq("id", excludeAppointmentId);
    }

    const { data, error } = await query;

    if (error) throw error;

    return {
      available: !data || data.length === 0,
      conflicts: data || [],
    };
  },

  /**
   * Create new appointment
   */
  async createAppointment(companyId: string, appointment: Omit<AppointmentInsert, "company_id">) {
    const { data: session } = await supabase.auth.getSession();

    // Check availability first
    const availability = await this.checkAvailability(
      companyId,
      appointment.assigned_to!,
      appointment.scheduled_at,
      appointment.duration_minutes
    );

    if (!availability.available) {
      throw new Error("Time slot not available");
    }

    const { data, error } = await supabase
      .from("appointments")
      .insert({
        ...appointment,
        company_id: companyId,
        created_by: session.session?.user.id,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update appointment
   */
  async updateAppointment(
    companyId: string,
    appointmentId: string,
    updates: Partial<Omit<AppointmentUpdate, "company_id" | "id">>
  ) {
    // If rescheduling, check availability
    if (updates.scheduled_at || updates.assigned_to) {
      const current = await this.getAppointmentById(companyId, appointmentId);
      
      const availability = await this.checkAvailability(
        companyId,
        updates.assigned_to || current.assigned_to!,
        updates.scheduled_at || current.scheduled_at,
        updates.duration_minutes || current.duration_minutes,
        appointmentId
      );

      if (!availability.available) {
        throw new Error("New time slot not available");
      }
    }

    const { data, error } = await supabase
      .from("appointments")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("company_id", companyId)
      .eq("id", appointmentId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update appointment status
   */
  async updateStatus(
    companyId: string,
    appointmentId: string,
    status: "scheduled" | "confirmed" | "in_progress" | "completed" | "cancelled" | "no_show",
    cancellationReason?: string
  ) {
    return this.updateAppointment(companyId, appointmentId, {
      status,
      cancellation_reason: cancellationReason,
    });
  },

  /**
   * Cancel appointment
   */
  async cancelAppointment(companyId: string, appointmentId: string, reason?: string) {
    return this.updateStatus(companyId, appointmentId, "cancelled", reason);
  },

  /**
   * Get appointment statistics
   */
  async getAppointmentStats(companyId: string, startDate?: string, endDate?: string) {
    const appointments = await this.getAppointments(companyId, {
      startDate,
      endDate,
    });

    const stats = {
      total: appointments.length,
      scheduled: appointments.filter(a => a.status === "scheduled").length,
      confirmed: appointments.filter(a => a.status === "confirmed").length,
      completed: appointments.filter(a => a.status === "completed").length,
      cancelled: appointments.filter(a => a.status === "cancelled").length,
      noShow: appointments.filter(a => a.status === "no_show").length,
    };

    return stats;
  },

  /**
   * Get upcoming appointments for a user
   */
  async getUpcomingAppointments(companyId: string, userId: string, limit: number = 5) {
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("appointments")
      .select(`
        *,
        client:clients(id, name, avatar_url),
        service:services(id, name, color)
      `)
      .eq("company_id", companyId)
      .eq("assigned_to", userId)
      .gte("scheduled_at", now)
      .in("status", ["scheduled", "confirmed"])
      .order("scheduled_at", { ascending: true })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },
};