import React from 'react';
import { Client } from '../AppContext';
import { useApp } from '../AppContext';
import { ClientGoalsAndMetrics } from '../ClientGoalsAndMetrics';

interface ClientProgressProps {
  client: Client;
}

export default function ClientProgress({ client }: ClientProgressProps) {
  const { updateClient } = useApp();

  return (
    <ClientGoalsAndMetrics 
      client={client} 
      onUpdateClient={(updates) => updateClient(client.id, updates)} 
    />
  );
}