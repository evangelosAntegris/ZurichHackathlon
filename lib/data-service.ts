import type {
  Client,
  Conversation,
  ProfessionalBackground,
  FinancialPreferences,
  CommunicationPreferences,
  RecentInteraction,
  UpcomingMeeting,
  RecommendedAction,
  ClientProfile,
} from "./types"

import {
  mockClients,
  mockConversations,
  mockProfessionalBackgrounds,
  mockFinancialPreferences,
  mockCommunicationPreferences,
  mockRecentInteractions,
  mockUpcomingMeetings,
  mockRecommendedActions,
} from "./mock-data"

// import { createClient } from '@supabase/supabase-js'
//
// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
// const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
// const supabase = createClient(supabaseUrl, supabaseKey)

// Simulate async database calls with delays
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export class DataService {
  // Client operations
  static async getAllClients(): Promise<Client[]> {
    // const { data, error } = await supabase
    //   .from('clients')
    //   .select('*')
    //   .order('name', { ascending: true })
    //
    // if (error) {
    //   console.error('Error fetching clients:', error)
    //   throw new Error('Failed to fetch clients')
    // }
    //
    // return data || []

    await delay(100)
    return mockClients
  }

  static async getClientById(clientId: string): Promise<Client | null> {
    // const { data, error } = await supabase
    //   .from('clients')
    //   .select('*')
    //   .eq('id', clientId)
    //   .single()
    //
    // if (error) {
    //   if (error.code === 'PGRST116') return null // No rows returned
    //   console.error('Error fetching client:', error)
    //   throw new Error('Failed to fetch client')
    // }
    //
    // return data

    await delay(50)
    return mockClients.find((client) => client.id === clientId) || null
  }

  // Conversation operations
  static async getConversationsByClientId(clientId: string): Promise<Conversation[]> {
    // const { data, error } = await supabase
    //   .from('conversations')
    //   .select('*')
    //   .eq('client_id', clientId)
    //   .order('date', { ascending: false })
    //
    // if (error) {
    //   console.error('Error fetching conversations:', error)
    //   throw new Error('Failed to fetch conversations')
    // }
    //
    // return data || []

    await delay(100)
    return mockConversations.filter((conv) => conv.clientId === clientId)
  }

  static async getConversationById(conversationId: string): Promise<Conversation | null> {
    // const { data, error } = await supabase
    //   .from('conversations')
    //   .select('*')
    //   .eq('id', conversationId)
    //   .single()
    //
    // if (error) {
    //   if (error.code === 'PGRST116') return null
    //   console.error('Error fetching conversation:', error)
    //   throw new Error('Failed to fetch conversation')
    // }
    //
    // return data

    await delay(50)
    return mockConversations.find((conv) => conv.id === conversationId) || null
  }

  // Professional background operations
  static async getProfessionalBackgroundByClientId(clientId: string): Promise<ProfessionalBackground | null> {
    // const { data, error } = await supabase
    //   .from('professional_backgrounds')
    //   .select('*')
    //   .eq('client_id', clientId)
    //   .single()
    //
    // if (error) {
    //   if (error.code === 'PGRST116') return null
    //   console.error('Error fetching professional background:', error)
    //   throw new Error('Failed to fetch professional background')
    // }
    //
    // return data

    await delay(50)
    return mockProfessionalBackgrounds.find((bg) => bg.clientId === clientId) || null
  }

  // Financial preferences operations
  static async getFinancialPreferencesByClientId(clientId: string): Promise<FinancialPreferences | null> {
    // const { data, error } = await supabase
    //   .from('financial_preferences')
    //   .select('*')
    //   .eq('client_id', clientId)
    //   .single()
    //
    // if (error) {
    //   if (error.code === 'PGRST116') return null
    //   console.error('Error fetching financial preferences:', error)
    //   throw new Error('Failed to fetch financial preferences')
    // }
    //
    // return data

    await delay(50)
    return mockFinancialPreferences.find((pref) => pref.clientId === clientId) || null
  }

  // Communication preferences operations
  static async getCommunicationPreferencesByClientId(clientId: string): Promise<CommunicationPreferences | null> {
    // const { data, error } = await supabase
    //   .from('communication_preferences')
    //   .select('*')
    //   .eq('client_id', clientId)
    //   .single()
    //
    // if (error) {
    //   if (error.code === 'PGRST116') return null
    //   console.error('Error fetching communication preferences:', error)
    //   throw new Error('Failed to fetch communication preferences')
    // }
    //
    // return data

    await delay(50)
    return mockCommunicationPreferences.find((pref) => pref.clientId === clientId) || null
  }

  // Recent interactions operations
  static async getRecentInteractionsByClientId(clientId: string): Promise<RecentInteraction[]> {
    // const { data, error } = await supabase
    //   .from('recent_interactions')
    //   .select('*')
    //   .eq('client_id', clientId)
    //   .order('date', { ascending: false })
    //
    // if (error) {
    //   console.error('Error fetching recent interactions:', error)
    //   throw new Error('Failed to fetch recent interactions')
    // }
    //
    // return data || []

    await delay(100)
    return mockRecentInteractions.filter((interaction) => interaction.clientId === clientId)
  }

  // Upcoming meetings operations
  static async getUpcomingMeetingsByClientId(clientId: string): Promise<UpcomingMeeting[]> {
    // const { data, error } = await supabase
    //   .from('upcoming_meetings')
    //   .select('*')
    //   .eq('client_id', clientId)
    //   .order('date', { ascending: true })
    //
    // if (error) {
    //   console.error('Error fetching upcoming meetings:', error)
    //   throw new Error('Failed to fetch upcoming meetings')
    // }
    //
    // return data || []

    await delay(100)
    return mockUpcomingMeetings.filter((meeting) => meeting.clientId === clientId)
  }

  // Recommended actions operations
  static async getRecommendedActionsByClientId(clientId: string): Promise<RecommendedAction[]> {
    // const { data, error } = await supabase
    //   .from('recommended_actions')
    //   .select('*')
    //   .eq('client_id', clientId)
    //   .order('priority', { ascending: true })
    //
    // if (error) {
    //   console.error('Error fetching recommended actions:', error)
    //   throw new Error('Failed to fetch recommended actions')
    // }
    //
    // return data || []

    await delay(100)
    return mockRecommendedActions.filter((action) => action.clientId === clientId)
  }

  // Complete client profile
  static async getClientProfile(clientId: string): Promise<ClientProfile | null> {
    await delay(200)

    const client = await this.getClientById(clientId)
    if (!client) return null

    const [
      professionalBackground,
      financialPreferences,
      communicationPreferences,
      conversations,
      recentInteractions,
      upcomingMeetings,
      recommendedActions,
    ] = await Promise.all([
      this.getProfessionalBackgroundByClientId(clientId),
      this.getFinancialPreferencesByClientId(clientId),
      this.getCommunicationPreferencesByClientId(clientId),
      this.getConversationsByClientId(clientId),
      this.getRecentInteractionsByClientId(clientId),
      this.getUpcomingMeetingsByClientId(clientId),
      this.getRecommendedActionsByClientId(clientId),
    ])

    return {
      client,
      professionalBackground: professionalBackground!,
      financialPreferences: financialPreferences!,
      communicationPreferences: communicationPreferences!,
      conversations,
      recentInteractions,
      upcomingMeetings,
      recommendedActions,
    }
  }

  // Search and filter operations
  static async searchConversations(clientId: string, query: string): Promise<Conversation[]> {
    // const { data, error } = await supabase
    //   .from('conversations')
    //   .select('*')
    //   .eq('client_id', clientId)
    //   .or(`title.ilike.%${query}%,summary.ilike.%${query}%`)
    //   .order('date', { ascending: false })
    //
    // if (error) {
    //   console.error('Error searching conversations:', error)
    //   throw new Error('Failed to search conversations')
    // }
    //
    // return data || []

    await delay(100)
    const conversations = await this.getConversationsByClientId(clientId)
    return conversations.filter(
      (conv) =>
        conv.title.toLowerCase().includes(query.toLowerCase()) ||
        conv.summary?.toLowerCase().includes(query.toLowerCase()),
    )
  }

  static async getConversationsByDateRange(
    clientId: string,
    startDate: string,
    endDate: string,
  ): Promise<Conversation[]> {
    // const { data, error } = await supabase
    //   .from('conversations')
    //   .select('*')
    //   .eq('client_id', clientId)
    //   .gte('date', startDate)
    //   .lte('date', endDate)
    //   .order('date', { ascending: false })
    //
    // if (error) {
    //   console.error('Error fetching conversations by date range:', error)
    //   throw new Error('Failed to fetch conversations by date range')
    // }
    //
    // return data || []

    await delay(100)
    const conversations = await this.getConversationsByClientId(clientId)
    return conversations.filter((conv) => conv.date >= startDate && conv.date <= endDate)
  }

  // ==========================================
  // WRITE OPERATIONS (CREATE, UPDATE, DELETE)
  // ==========================================

  // Client write operations
  // static async createClient(clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<Client> {
  //   const newClient = {
  //     ...clientData,
  //     id: crypto.randomUUID(),
  //     createdAt: new Date().toISOString(),
  //     updatedAt: new Date().toISOString()
  //   }
  //
  //   const { data, error } = await supabase
  //     .from('clients')
  //     .insert(newClient)
  //     .select()
  //     .single()
  //
  //   if (error) {
  //     console.error('Error creating client:', error)
  //     throw new Error('Failed to create client')
  //   }
  //
  //   return data
  // }

  // static async updateClient(clientId: string, updates: Partial<Omit<Client, 'id' | 'createdAt'>>): Promise<Client> {
  //   const updateData = {
  //     ...updates,
  //     updatedAt: new Date().toISOString()
  //   }
  //
  //   const { data, error } = await supabase
  //     .from('clients')
  //     .update(updateData)
  //     .eq('id', clientId)
  //     .select()
  //     .single()
  //
  //   if (error) {
  //     console.error('Error updating client:', error)
  //     throw new Error('Failed to update client')
  //   }
  //
  //   return data
  // }

  // static async deleteClient(clientId: string): Promise<void> {
  //   // First delete all related data
  //   await Promise.all([
  //     supabase.from('conversations').delete().eq('client_id', clientId),
  //     supabase.from('professional_backgrounds').delete().eq('client_id', clientId),
  //     supabase.from('financial_preferences').delete().eq('client_id', clientId),
  //     supabase.from('communication_preferences').delete().eq('client_id', clientId),
  //     supabase.from('recent_interactions').delete().eq('client_id', clientId),
  //     supabase.from('upcoming_meetings').delete().eq('client_id', clientId),
  //     supabase.from('recommended_actions').delete().eq('client_id', clientId),
  //   ])
  //
  //   const { error } = await supabase
  //     .from('clients')
  //     .delete()
  //     .eq('id', clientId)
  //
  //   if (error) {
  //     console.error('Error deleting client:', error)
  //     throw new Error('Failed to delete client')
  //   }
  // }

  // Conversation write operations
  // static async createConversation(conversationData: Omit<Conversation, 'id' | 'createdAt' | 'updatedAt'>): Promise<Conversation> {
  //   const newConversation = {
  //     ...conversationData,
  //     id: crypto.randomUUID(),
  //     createdAt: new Date().toISOString(),
  //     updatedAt: new Date().toISOString()
  //   }
  //
  //   const { data, error } = await supabase
  //     .from('conversations')
  //     .insert(newConversation)
  //     .select()
  //     .single()
  //
  //   if (error) {
  //     console.error('Error creating conversation:', error)
  //     throw new Error('Failed to create conversation')
  //   }
  //
  //   return data
  // }

  // static async updateConversation(conversationId: string, updates: Partial<Omit<Conversation, 'id' | 'createdAt'>>): Promise<Conversation> {
  //   const updateData = {
  //     ...updates,
  //     updatedAt: new Date().toISOString()
  //   }
  //
  //   const { data, error } = await supabase
  //     .from('conversations')
  //     .update(updateData)
  //     .eq('id', conversationId)
  //     .select()
  //     .single()
  //
  //   if (error) {
  //     console.error('Error updating conversation:', error)
  //     throw new Error('Failed to update conversation')
  //   }
  //
  //   return data
  // }

  // static async deleteConversation(conversationId: string): Promise<void> {
  //   const { error } = await supabase
  //     .from('conversations')
  //     .delete()
  //     .eq('id', conversationId)
  //
  //   if (error) {
  //     console.error('Error deleting conversation:', error)
  //     throw new Error('Failed to delete conversation')
  //   }
  // }

  // ==========================================
  // FILE UPLOAD OPERATIONS
  // ==========================================

  // File upload to Supabase Storage
  // static async uploadFile(file: File, clientId: string, folder: string = 'documents'): Promise<{
  //   url: string;
  //   path: string;
  //   documentId: string;
  // }> {
  //   try {
  //     // Generate unique filename
  //     const fileExtension = file.name.split('.').pop()
  //     const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`
  //     const filePath = `${clientId}/${folder}/${fileName}`
  //
  //     // Upload file to Supabase Storage
  //     const { data: uploadData, error: uploadError } = await supabase.storage
  //       .from('client-files')
  //       .upload(filePath, file, {
  //         cacheControl: '3600',
  //         upsert: false
  //       })
  //
  //     if (uploadError) {
  //       console.error('Error uploading file to storage:', uploadError)
  //       throw new Error(`Failed to upload file: ${uploadError.message}`)
  //     }
  //
  //     // Get public URL
  //     const { data: urlData } = supabase.storage
  //       .from('client-files')
  //       .getPublicUrl(filePath)
  //
  //     // Save file reference to database
  //     const documentData = {
  //       id: crypto.randomUUID(),
  //       client_id: clientId,
  //       file_name: file.name,
  //       file_path: filePath,
  //       file_url: urlData.publicUrl,
  //       file_size: file.size,
  //       file_type: file.type,
  //       folder: folder,
  //       uploaded_at: new Date().toISOString()
  //     }
  //
  //     const { data: documentRecord, error: dbError } = await supabase
  //       .from('client_documents')
  //       .insert(documentData)
  //       .select()
  //       .single()
  //
  //     if (dbError) {
  //       console.error('Error saving file reference to database:', dbError)
  //       // Try to clean up uploaded file
  //       await supabase.storage.from('client-files').remove([filePath])
  //       throw new Error(`Failed to save file reference: ${dbError.message}`)
  //     }
  //
  //     return {
  //       url: urlData.publicUrl,
  //       path: filePath,
  //       documentId: documentRecord.id
  //     }
  //   } catch (error) {
  //     console.error('Error in uploadFile:', error)
  //     throw error
  //   }
  // }

  // static async uploadMultipleFiles(files: File[], clientId: string, folder: string = 'documents'): Promise<Array<{
  //   url: string;
  //   path: string;
  //   documentId: string;
  //   fileName: string;
  // }>> {
  //   const uploadPromises = files.map(file => this.uploadFile(file, clientId, folder))
  //   const results = await Promise.allSettled(uploadPromises)
  //
  //   const successful = results
  //     .filter((result): result is PromiseFulfilledResult<{url: string; path: string; documentId: string}> =>
  //       result.status === 'fulfilled')
  //     .map((result, index) => ({
  //       ...result.value,
  //       fileName: files[index].name
  //     }))
  //
  //   const failed = results
  //     .map((result, index) => ({ result, index }))
  //     .filter(({ result }) => result.status === 'rejected')
  //     .map(({ index }) => files[index].name)
  //
  //   if (failed.length > 0) {
  //     console.warn('Some files failed to upload:', failed)
  //   }
  //
  //   return successful
  // }

  // static async deleteFile(documentId: string): Promise<void> {
  //   // Get file info first
  //   const { data: document, error: fetchError } = await supabase
  //     .from('client_documents')
  //     .select('file_path')
  //     .eq('id', documentId)
  //     .single()
  //
  //   if (fetchError) {
  //     console.error('Error fetching document:', fetchError)
  //     throw new Error('Failed to fetch document')
  //   }
  //
  //   // Delete from storage
  //   const { error: storageError } = await supabase.storage
  //     .from('client-files')
  //     .remove([document.file_path])
  //
  //   if (storageError) {
  //     console.error('Error deleting file from storage:', storageError)
  //     throw new Error('Failed to delete file from storage')
  //   }
  //
  //   // Delete from database
  //   const { error: dbError } = await supabase
  //     .from('client_documents')
  //     .delete()
  //     .eq('id', documentId)
  //
  //   if (dbError) {
  //     console.error('Error deleting document record:', dbError)
  //     throw new Error('Failed to delete document record')
  //   }
  // }

  // static async getClientDocuments(clientId: string): Promise<Array<{
  //   id: string;
  //   fileName: string;
  //   fileUrl: string;
  //   fileSize: number;
  //   fileType: string;
  //   folder: string;
  //   uploadedAt: string;
  // }>> {
  //   const { data, error } = await supabase
  //     .from('client_documents')
  //     .select('*')
  //     .eq('client_id', clientId)
  //     .order('uploaded_at', { ascending: false })
  //
  //   if (error) {
  //     console.error('Error fetching client documents:', error)
  //     throw new Error('Failed to fetch client documents')
  //   }
  //
  //   return data.map(doc => ({
  //     id: doc.id,
  //     fileName: doc.file_name,
  //     fileUrl: doc.file_url,
  //     fileSize: doc.file_size,
  //     fileType: doc.file_type,
  //     folder: doc.folder,
  //     uploadedAt: doc.uploaded_at
  //   }))
  // }
}
