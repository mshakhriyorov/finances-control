import Form from '@/app/ui/invoices/create-form';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';

import { fetchCustomers } from '@/app/lib/data';
import { invoicesPath } from '@/app/lib/constants';

export default async function Page() {
  const customers = await fetchCustomers();

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Invoices', href: invoicesPath },
          {
            label: 'Create Invoice',
            href: `${invoicesPath}/create`,
            active: true,
          },
        ]}
      />
      <Form customers={customers} />
    </main>
  );
}
