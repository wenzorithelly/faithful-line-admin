import {createClient, SupabaseClient} from '@supabase/supabase-js';

export interface DatabaseClient {
  name: string;
  phone: string;
  entered_at: string | null;
  left_at: string | null;
  country: string;
  message_sent: boolean;
  unique_code: string;
}


export interface MessageData {
  id: number;
  message: string;
  default?: boolean;
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error('Supabase URL and Key must be provided.');
}

const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

export default supabase;

export class SupabaseService {
  private mapClientData(client: any): DatabaseClient {
    return {
      name: `${client.first_name} ${client.last_name}`.trim(),
      phone: client.number,
      entered_at: client.entered_at || null,
      left_at: client.left_at || null,
      country: client.country || 'BR',
      message_sent: client.message_sent,
      unique_code: client.unique_code,
    };
  }

  /**
   * Fetches control data for clients who have been sent a message and haven't left.
   */
  async fetchDataControl(): Promise<DatabaseClient[]> {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('first_name, last_name, number, entered_at, country, message_sent, unique_code')
        .is('message_sent', true)
        .is('left_at', null)
        .order('first_name');

      if (error) throw error;

      const mappedData = data?.map(this.mapClientData) || [];

      // Ensure unique clients by phone
      return Array.from(
          new Map(mappedData.map(client => [client.phone, client])).values()
      );
    } catch (error) {
      console.error('Error fetching data control:', error);
      return [];
    }
  }

  async updateClientPresence(phone: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('clients')
        .update({ entered_at: new Date().toISOString(), presence: true })
        .eq('number', phone);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating client presence:', error);
      return false;
    }
  }

  async updateClientLeft(phone: string): Promise<boolean> {
    try {
      const {error} = await supabase
          .from('clients')
          .update({left_at: new Date().toISOString()})
          .eq('number', phone);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating client left:', error);
      return false;
    }
  }

  async deleteClient(phone: string): Promise<void> {
    try {
      const {error} = await supabase
          .from('clients')
          .delete()
          .eq('number', phone);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting client:', error);
    }
  }

  async fetchDefaultMessage(): Promise<MessageData> {
    try {
      const {data, error} = await supabase
          .from('messages')
          .select('id, content, default_message')
          .is('default_message', true)
          .limit(1)
          .single();

      if (error) throw error;

      return {
        id: data.id,
        message: data.content,
        default: data.default_message,
      };
    } catch (error) {
      console.error('Error fetching default message:', error);
      return {default: false, id: 0, message: ""}
    }
  }

  async fetchDataPresence(): Promise<DatabaseClient[]> {
    try {
      const {data, error} = await supabase
          .from('clients')
          .select('first_name, last_name, number, country, entered_at')
          .is('message_sent', false)
          .order('created_at', {ascending: true});

      if (error) throw error;

      // eslint-disable-line @typescript-eslint/no-explicit-any
      const mappedData = data?.map(this.mapClientData) || [];

      // Ensure unique clients by phone
      return Array.from(
          new Map(mappedData.map(client => [client.phone, client])).values()
      )
    } catch (error) {
      console.error('Error fetching presence data:', error);
      return [];
    }
  }

  async updateMessageSentStatus(phone: string): Promise<boolean> {
    try {
      const {error} = await supabase
          .from('clients')
          .update({message_sent: true})
          .eq('number', phone);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating message sent status:', error);
      return false;
    }
  }

  async fetchDataMessage(): Promise<MessageData[]> {
    try {
      const {data, error} = await supabase
          .from('messages')
          .select('id, content, default_message')
          .order('updated_at', {ascending: true});

      if (error) throw error;

      return data?.map((message) => ({
        id: message.id,
        message: message.content,
        default: message.default_message,
      })) || []
    } catch (error) {
      console.error('Error fetching messages:', error)
      return []
    }
  }

  async insertMessage(content: string): Promise<boolean> {
    try {
      const {error} = await supabase
          .from('messages')
          .insert({content})

      if (error) throw error
      return true
    } catch (error) {
      console.error("Error inserting message to database:", error)
      return false
    }
  }

  async handleQRCodeScan(uniqueCode: string): Promise<{ success: boolean; message: string }> {
    try {
      // Fetch the client by unique_code
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('unique_code', uniqueCode)
        .single();

      if (error) {
        console.error('Error fetching client:', error);
        return { success: false, message: 'Client not found.' };
      }

      const client = this.mapClientData(data);

      if (!client.message_sent) {
        // Update entered_at and set message_sent to true
        const { error: updateError } = await supabase
          .from('clients')
          .update({
            entered_at: new Date().toISOString(),
            message_sent: true,
          })
          .eq('unique_code', uniqueCode);

        if (updateError) {
          console.error('Error updating client presence and message_sent:', updateError);
          return { success: false, message: 'Failed to update client status.' };
        }

        return { success: true, message: `Usuário ${client.name} como entrou na sala.` };
      } else if (client.entered_at && !client.left_at) {
        // Update left_at to mark the client as having left
        const { error: updateError } = await supabase
          .from('clients')
          .update({
            left_at: new Date().toISOString(),
          })
          .eq('unique_code', uniqueCode);

        if (updateError) {
          console.error('Error updating client left_at:', updateError);
          return { success: false, message: 'Failed to update client status.' };
        }

        return { success: true, message: `Usuário ${client.name} marcado como saiu da sala.` };
      } else if (!client.entered_at){
        const { error: updateError } = await supabase
          .from('clients')
          .update({
            entered_at: new Date().toISOString(),
          })
          .eq('unique_code', uniqueCode);

        if (updateError) {
          console.error('Error updating client entered at:', updateError);
          return { success: true, message: `Usuário ${client.name} como entrou na sala.` };
      }
        else {
          return { success: true, message: 'Did nothing' }
        }
      }
    } catch (error) {
      console.error('Error handling QR code scan:', error);
      return { success: false, message: 'An unexpected error occurred.' };
    }
  }


  async updateSubscriptionStatus(status: boolean): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('configs')
        .update({ subscription: status })
        .eq('id', 1);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Error updating subscription status:', error);
      return false;
    }
  }

  async fetchSubscriptionStatus(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('configs')
        .select('subscription')
        .single(); // Assumes there's only one row in 'configs'

      if (error) throw error;

      return data.subscription;
    } catch (error) {
      console.error('Error fetching subscription status:', error);
      return true;
    }
  }

  async deleteMessage(messageId: number): Promise<boolean> {
    try {
      const { error } = await supabase
          .from('messages')
          .delete()
          .eq("id", messageId)
      if (error) throw error

      return true
    } catch (error) {
      console.error("Error deleting message from database:", error)
      return false
    }
  }

  async updateDefaultMessage(messageId: number): Promise<boolean> {
    try {
      await supabase
        .from('messages')
        .update({ default_message: false })
        .eq('default_message', true);

      const { error } = await supabase
          .from("messages")
          .update({"default_message": true, "updated_at": new Date().toISOString() })
          .eq('id', messageId)

      if (error) throw error

      return true
    } catch (error) {
      console.error("Error updating default message:", error)
      return false
    }
  }

  public getMappedClientData(client: any): DatabaseClient {
    return this.mapClientData(client);
  }
}
