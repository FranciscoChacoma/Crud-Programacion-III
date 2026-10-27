import { Layout } from '../components/Layout';
import { VenueManager } from '../components/VenueManager';
import { PageHeader } from '../components/ui';

export function VenuesPage() {
  return (
    <Layout>
      <PageHeader
        title="Sedes"
        description="Los clubes donde organizás torneos y sus canchas. Al crear un torneo, todas tus sedes quedan seleccionadas; después podés elegir cuáles usar."
      />
      <div style={{ maxWidth: 820 }}>
        <VenueManager />
      </div>
    </Layout>
  );
}
